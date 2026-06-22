<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\IuranPeriod;
use App\Models\IuranPayment;
use App\Models\Family;
use App\Models\FamilyIuranTariff;
use App\Models\IuranCategory;
use App\Models\TreasuryLog;
use App\Services\FirebaseCloudMessagingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class IuranController extends Controller
{
    /**
     * Mengambil daftar periode iuran yang pernah dibuat.
     * GET /api/v1/iuran-periods
     */
    public function indexPeriod(): JsonResponse
    {
        $periods = IuranPeriod::with('category')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar periode iuran berhasil diambil.',
            'data'    => $periods
        ]);
    }

    /**
     * Membuat periode iuran baru dan otomatis men-generate tagihan per KK.
     * POST /api/v1/iuran-periods
     */
    // public function storePeriod(Request $request): JsonResponse
    // {
    //     $validated = $request->validate([
    //         'category_id'       => 'required|exists:iuran_categories,category_id',
    //         'period_name'       => 'required|string|max:255',
    //         'month'             => 'required|integer|between:1,12',
    //         'year'              => 'required|integer|min:2026',
    //     ]);

    //     $category = IuranCategory::findOrFail($validated['category_id']);
    //     $validated['payment_qr_code'] = 'QR-PAY-' . Str::upper(Str::slug($validated['period_name']));
    //     $period = IuranPeriod::create($validated);

    //     $announcement = Announcement::create([
    //         'announcement_id' => Str::uuid(),
    //         'title' => 'Iuran baru: ' . $period->period_name,
    //         'content' => 'Periode iuran ' . $period->period_name . ' (' . $category->name . ') telah dibuka. Nominal standar per KK Rp ' . number_format((float) $category->default_amount, 0, ',', '.') . '.',
    //         'banner_url' => null,
    //         'status' => 'published',
    //         'created_by' => $request->user()->user_id,
    //     ]);

    //     app(FirebaseCloudMessagingService::class)->notifyAnnouncement($announcement);

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Periode iuran berhasil dibuat dan tagihan seluruh keluarga telah di-generate.',
    //         'data'    => $period
    //     ], 201);
    // }

    public function storePeriod(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period_name'     => 'required|string|max:255',
            'month'           => 'required|integer|between:1,12',
            'year'            => 'required|integer|min:2026',
            'duration_months' => 'required|integer|in:1,3',
            'categories'      => 'required|array|min:1',
            'categories.*'    => 'required|string|exists:iuran_categories,slug',
        ]);

        $createdPeriods = [];
        $monthsName = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        // 1. PROSES DATABASE DIJALANKAN TERLEBIH DAHULU (SANGAT CEPAT)
        DB::transaction(function () use ($validated, $request, $monthsName, &$createdPeriods) {
            $duration = $validated['duration_months'];

            for ($i = 0; $i < $duration; $i++) {
                $currentMonth = $validated['month'] + $i;
                $currentYear = $validated['year'];

                if ($currentMonth > 12) {
                    $excessMonths = $currentMonth - 1;
                    $currentMonth = ($excessMonths % 12) + 1;
                    $currentYear += floor($excessMonths / 12);
                }

                foreach ($validated['categories'] as $categorySlug) {
                    $category = IuranCategory::where('slug', $categorySlug)->firstOrFail();

                    $periodLabel = $validated['period_name'] . ' (' . $monthsName[$currentMonth] . ' ' . $currentYear . ')';
                    $fullPeriodName = $periodLabel . ' - ' . $category->name;
                    $qrCode = 'QR-PAY-' . Str::upper(Str::slug($fullPeriodName));

                    $period = IuranPeriod::create([
                        'period_id'       => (string) Str::uuid(),
                        'category_id'     => $category->category_id,
                        'period_name'     => $fullPeriodName,
                        'month'           => $currentMonth,
                        'year'            => $currentYear,
                        'payment_qr_code' => $qrCode,
                    ]);

                    $createdPeriods[] = $period;
                }
            }
        });

        // 2. BUAT DATA PENGUMUMAN DI DATABASE (PROSES INTERNAL, CEPAT)
        $listKategori = implode(', ', $validated['categories']);
        $announcement = Announcement::create([
            'announcement_id' => (string) Str::uuid(),
            'title'           => 'Tagihan Iuran Baru Diterbitkan',
            'content'         => 'Pengurus RT telah membuka periode tagihan "' . $validated['period_name'] . '" untuk komponen: ' . Str::title($listKategori) . '. Silakan lakukan pengecekan pada menu iuran aplikasi.',
            'banner_url'      => null,
            'status'          => 'published',
            'created_by'      => $request->user()->user_id,
        ]);

        // 3. PEMBARUAN UTAMA: KIRIM KE FIREBASE SETELAH RESPON DIKIRIM (AFTER RESPONSE)
        dispatch(function () use ($announcement) {
            try {
                app(FirebaseCloudMessagingService::class)->notifyAnnouncement($announcement);
            } catch (\Exception $e) {
                Log::error('FCM Gagal di Background: ' . $e->getMessage());
            }
        })->afterResponse(); // ⬅️ Ini kuncinya! Menjalankan FCM tanpa menahan Flutter

        // 4. KEMBALIKAN RESPON KE FLUTTER SECEPAT MUNGKIN
        return response()->json([
            'success' => true,
            'message' => $validated['duration_months'] == 3
                ? 'Periode iuran selama 3 bulan ke depan berhasil dibuka sekaligus.'
                : 'Periode iuran bulan ini berhasil dibuka.',
            'data'    => $createdPeriods
        ], 201);
    }

    public function updatePeriod(Request $request, $id): JsonResponse
    {
        $period = IuranPeriod::findOrFail($id);
        $oldTreasuryDescription = $this->iuranSummaryDescription($period);

        $validated = $request->validate([
            'category_id'       => 'required|exists:iuran_categories,category_id',
            'period_name'       => 'sometimes|required|string|max:255',
            'month'             => 'sometimes|required|integer|between:1,12',
            'year'              => 'sometimes|required|integer|min:2026',
        ]);

        if (isset($validated['period_name'])) {
            $validated['payment_qr_code'] = 'QR-PAY-' . Str::upper(Str::slug($validated['period_name']));
        }

        $period->update($validated);
        $period->refresh();

        if ($oldTreasuryDescription !== $this->iuranSummaryDescription($period)) {
            TreasuryLog::where('source', 'IURAN_WARGA')
                ->where('description', $oldTreasuryDescription)
                ->delete();
        }

        $this->syncPeriodTreasuryLog($period, $request->user()->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Periode iuran berhasil diperbarui.',
            'data' => $period->fresh(),
        ]);
    }

    public function destroyPeriod($id): JsonResponse
    {
        $period = IuranPeriod::findOrFail($id);

        IuranPayment::where('period_id', $period->period_id)->get()->each(function (IuranPayment $payment) {
            $this->deleteLegacyPaymentTreasuryLog($payment->payment_id);
            $payment->delete();
        });
        $this->deletePeriodTreasuryLog($period);

        $period->delete();

        return response()->json([
            'success' => true,
            'message' => 'Periode iuran berhasil dihapus.',
        ]);
    }

    //untuk cek tunggakan
    // public function checkArrears(Request $request): JsonResponse
    // {
    //     $validated = $request->validate([
    //         'qr_code_data' => 'required|exists:families,qr_code_data',
    //     ]);

    //     $familyId = $validated['qr_code_data'];

    //     // 1. Get all period dues created by the RT management
    //     $allPeriods = IuranPeriod::with('category')->get();

    //     // 2. Get period IDs that have ALREADY BEEN PAID by this family
    //     $paidPeriodIds = IuranPayment::where('family_id', $familyId)
    //         ->where('amount_paid', '>', 0)
    //         ->pluck('period_id')
    //         ->toArray();

    //     // 3. Get any custom tariff exceptions specifically set for this family
    //     $customTariffs = FamilyIuranTariff::where('family_id', $familyId)
    //         ->pluck('amount', 'category_id');

    //     $arrearsDetails = [];
    //     $totalOutstanding = 0;

    //     // 4. Loop through to find unpaid/outstanding periods
    //     foreach ($allPeriods as $period) {
    //         if (!in_array($period->period_id, $paidPeriodIds)) {

    //             // Use custom family tariff if available, otherwise fallback to standard category default amount
    //             $tariffAmount = (float) ($customTariffs->get($period->category_id) ?? $period->category->default_amount);

    //             $arrearsDetails[] = [
    //                 'period_id'     => $period->period_id,
    //                 'period_name'   => $period->period_name,
    //                 'category_name' => $period->category->name,
    //                 'amount'        => $tariffAmount,
    //             ];

    //             $totalOutstanding += $tariffAmount;
    //         }
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Family outstanding arrears calculated successfully.',
    //         'data'    => [
    //             'family_id'         => $familyId,
    //             'total_outstanding' => $totalOutstanding,
    //             'details'           => $arrearsDetails
    //         ]
    //     ]);
    // }

    // public function checkArrears(Request $request): JsonResponse
    // {
    //     // 1. Validasi pastikan string QR Code terdaftar di database tabel families
    //     $validated = $request->validate([
    //         'qr_code_data' => 'required|exists:families,qr_code_data',
    //     ]);

    //     // 🌟 KUNCI PERBAIKAN: Cari data keluarga asli berdasarkan string QR Code
    //     $family = \App\Models\Family::where('qr_code_data', $validated['qr_code_data'])->firstOrFail();

    //     // Sekarang kita punya dua variabel yang presisi
    //     $familyId = $family->family_id; // UUID Asli untuk query database
    //     $qrCodeData = $family->qr_code_data; // Teks QR-FAM-xxxx untuk dilempar balik ke UI Flutter

    //     // 2. Ambil semua komponen periode iuran yang aktif dari manajemen RT
    //     $allPeriods = IuranPeriod::with('category')->get();

    //     // 3. Ambil ID Periode yang BENAR-BENAR SUDAH DIBAYAR oleh keluarga ini (Pakai UUID familyId)
    //     $paidPeriodIds = IuranPayment::where('family_id', $familyId)
    //         ->where('amount_paid', '>', 0)
    //         ->pluck('period_id')
    //         ->toArray();

    //     // 4. Ambil tarif khusus kustom keluarga jika ada (Pakai UUID familyId)
    //     $customTariffs = FamilyIuranTariff::where('family_id', $familyId)
    //         ->pluck('amount', 'category_id');

    //     $arrearsDetails = [];
    //     $totalOutstanding = 0;

    //     // 5. Looping untuk menjabarkan komponen apa saja yang menunggak
    //     foreach ($allPeriods as $period) {
    //         if (!in_array($period->period_id, $paidPeriodIds)) {

    //             // Gunakan tarif kustom keluarga jika ada, jika tidak pakai tarif standar bawaan kategori
    //             $tariffAmount = (float) ($customTariffs->get($period->category_id) ?? $period->category->default_amount);

    //             $arrearsDetails[] = [
    //                 'period_id'     => $period->period_id,
    //                 'period_name'   => $period->period_name,
    //                 'category_name' => $period->category->name,
    //                 'amount'        => $tariffAmount,
    //             ];

    //             $totalOutstanding += $tariffAmount;
    //         }
    //     }

    //     // 6. Kembalikan respon json ter-struktur rapi ke Flutter
    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Tunggakan iuran keluarga berhasil dihitung secara presisi.',
    //         'data'    => [
    //             'family_id'         => $familyId, // UUID Asli (Biar di Flutter fungsi _processDirectPayment tidak crash)
    //             'qr_code_data'      => $qrCodeData, // String QR-FAM-xxxx
    //             'total_outstanding' => $totalOutstanding,
    //             'details'           => $arrearsDetails
    //         ]
    //     ]);
    // }

    /**
     * Memeriksa daftar tunggakan iuran keluarga langsung berdasarkan family_id (UUID).
     * POST /api/v1/iuran/check-arrears
     */
    public function checkArrears(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'family_id' => 'required|uuid',
        ]);

        $familyId = $validated['family_id'];

        // 🌟 Gunakan backslash lengkap \App\Models\ agar PHP tidak tersesat
        $family = \App\Models\Family::where('family_id', $familyId)->first();

        if (!$family) {
            $qrCodeData = 'QR-FAM-DEMO';
        } else {
            $qrCodeData = $family->qr_code_data;
        }

        $allPeriods = \App\Models\IuranPeriod::with('category')->get();

        $paidPeriodIds = \App\Models\IuranPayment::where('family_id', $familyId)
            ->where('amount_paid', '>', 0)
            ->pluck('period_id')
            ->toArray();

        $customTariffs = \App\Models\FamilyIuranTariff::where('family_id', $familyId)
            ->pluck('amount', 'category_id');

        $arrearsDetails = [];
        $totalOutstanding = 0;

        foreach ($allPeriods as $period) {
            if (!in_array($period->period_id, $paidPeriodIds)) {
                $tariffAmount = (float) ($customTariffs->get($period->category_id) ?? $period->category->default_amount);

                $arrearsDetails[] = [
                    'period_id'     => $period->period_id,
                    'period_name'   => $period->period_name,
                    'category_name' => $period->category->name,
                    'amount'        => $tariffAmount,
                ];

                $totalOutstanding += $tariffAmount;
              }
        }

        return response()->json([
            'success' => true,
            'message' => 'Tunggakan iuran keluarga berhasil dihitung secara presisi.',
            'data'    => [
                'family_id'         => $familyId,
                'qr_code_data'      => $qrCodeData,
                'total_outstanding' => $totalOutstanding,
                'details'           => $arrearsDetails
            ]
        ]);
    }

    /**
     * Melihat rekap status seluruh tagihan keluarga pada bulan tersebut.
     * GET /api/v1/iuran-periods/{id}/payments
     */
    public function periodPayments($id): JsonResponse
    {
        try {
            // Ambil semua periode lengkap dengan data kolom month dan year aslinya
            $periods = IuranPeriod::with('category')->get();

            $paymentsLog = \Illuminate\Support\Facades\DB::table('iuran_payments')
                ->get()
                ->groupBy('family_id');

            $wargaList = \Illuminate\Support\Facades\DB::table('users')
                ->join('families', 'users.family_id', '=', 'families.family_id')
                ->join('households', 'families.household_id', '=', 'households.household_id')
                ->leftJoin('users as heads', 'families.head_of_family_id', '=', 'heads.user_id')
                ->select([
                    'users.user_id',
                    'users.full_name',
                    'users.family_id',
                    'families.head_of_family_id',
                    'heads.full_name as head_name',
                    'households.block_number',
                    'households.house_number'
                ])
                ->whereNull('users.deleted_at')
                ->get()
                ->groupBy('family_id')
                ->map(function ($group) use ($periods, $paymentsLog, $id) {
                    $firstUser = $group->first();
                    $familyId = $firstUser->family_id;
                    $familyPayments = $paymentsLog->get($familyId) ?? collect([]);

                    // Strukturkan daftar komponen iuran untuk keluarga ini
                    $tagihanList = $periods->map(function ($p) use ($familyPayments) {
                        $defaultAmount = (float) ($p->category->default_amount ?? 0);
                        $isPaid = $familyPayments->where('period_id', $p->period_id)->first() !== null;

                        return [
                            'period_id' => $p->period_id,
                            'period_name' => $p->period_name ?? 'Iuran Bulanan',
                            'category_name' => $p->category->name ?? 'Umum',
                            'amount' => $defaultAmount,
                            'is_paid' => $isPaid,
                            // 🌟 FIX UTAMA: Lempar data month dan year ke dalam JSON agar dibaca Flutter secara dinamis Abadi!
                            'month' => $p->month,
                            'year' => $p->year,
                        ];
                    })->values()->all();

                    $hasUnpaid = collect($tagihanList)->contains('is_paid', false);

                    return [
                        'family_id' => $familyId,
                        'full_name' => $firstUser->full_name,
                        'head_of_family_name' => $firstUser->head_name ?? 'Kepala KK',
                        'block_info' => "Blok " . ($firstUser->block_number ?? '-') . " / No. " . ($firstUser->house_number ?? '-'),
                        'is_paid_global' => !$hasUnpaid,
                        'tagihan' => $tagihanList
                    ];
                })->values();

            return response()->json([
                'success' => true,
                'message' => 'Data tagihan per warga berhasil dikelompokkan.',
                'data' => $wargaList
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error Laravel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🌟 METHOD BARU: Memproses pembayaran iuran terpilih hasil scan QR checklist
     * POST /api/v1/iuran/process-payment
     */
    public function processPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'family_id'          => 'required|exists:families,family_id',
            'selected_periods'   => 'required|array|min:1',
            'selected_periods.*' => 'required|exists:iuran_periods,period_id',
        ]);

        $familyId = $validated['family_id'];
        $periodsToPay = $validated['selected_periods'];

        $customTariffs = FamilyIuranTariff::where('family_id', $familyId)
            ->pluck('amount', 'category_id');

        $processedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($periodsToPay as $periodId) {
                $period = IuranPeriod::with('category')->find($periodId);

                if ($period) {
                    $tariffAmount = (float) ($customTariffs->get($period->category_id) ?? $period->category->default_amount);

                    // Buat log pembayaran baru
                    IuranPayment::create([
                        'paid_by_user_id' => $request->user()->user_id ?? null,
                        'family_id'   => $familyId,
                        'period_id'   => $periodId,
                        'amount_paid' => $tariffAmount,
                        'paid_at'     => now(),
                    ]);

                    // Sinkronisasikan log keuangan kas RT secara otomatis
                    $this->syncPeriodTreasuryLog($period, $request->user()->user_id ?? 'SYSTEM');
                    $processedCount++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Berhasil mencatat $processedCount iuran warga ke sistem.",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mencatat transaksi pembayaran warga (Mengubah status menjadi Lunas).
     * POST /api/v1/iuran-payments
     */
    public function storePayment(Request $request): JsonResponse
    {
        // 🌟 PERBAIKAN VALIDASI: paid_by_user_id diubah menjadi nullable agar tidak memicu eror 422 saat bayar tunai
        $validated = $request->validate([
            'payment_id'      => 'nullable|string',
            'period_id'       => 'required_without:payment_id|exists:iuran_periods,period_id',
            'family_id'       => 'required_without:payment_id|exists:families,family_id',
            'paid_by_user_id' => 'nullable|exists:users,user_id', // ⬅️ Diubah jadi nullable
            'amount_paid'     => 'required|numeric|min:0',
        ]);

        // Trik Pintar: Jika paid_by_user_id kosong (bayar cash), otomatis isi dengan ID bendahara/user yang sedang login
        $payerId = $validated['paid_by_user_id'] ?? $request->user()->user_id;

        if (!empty($validated['payment_id'])) {
            $payment = IuranPayment::findOrFail($validated['payment_id']);
            $payment->update([
                'paid_by_user_id' => $payerId,
                'amount_paid'     => $validated['amount_paid'],
                'paid_at'         => now(),
            ]);
        } else {
            // Digunakan saat pencatatan manual per-komponen dari Flutter
            $payment = IuranPayment::updateOrCreate(
                [
                    'period_id' => $validated['period_id'],
                    'family_id' => $validated['family_id'],
                ],
                [
                    'paid_by_user_id' => $payerId,
                    'amount_paid'     => $validated['amount_paid'],
                    'paid_at'         => now(),
                ]
            );
        }

        $payment->load(['period.category', 'family.headOfFamily', 'payer']);
        $this->syncPeriodTreasuryLog($payment->period, $request->user()->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Catatan pembayaran iuran warga berhasil disimpan.',
            'data'    => $payment
        ]);
    }

    public function updatePayment(Request $request, $id): JsonResponse
    {
        $payment = IuranPayment::findOrFail($id);

        $validated = $request->validate([
            'paid_by_user_id' => 'sometimes|required|exists:users,user_id',
            'amount_paid'     => 'sometimes|required|numeric|min:0',
        ]);

        if (array_key_exists('amount_paid', $validated) && (float) $validated['amount_paid'] > 0) {
            $validated['paid_at'] = $payment->paid_at ?? now();
        }

        $payment->update($validated);
        $payment->load(['period', 'family.headOfFamily', 'payer']);

        $this->syncPeriodTreasuryLog($payment->period, $request->user()->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Catatan pembayaran berhasil diperbarui.',
            'data'    => $payment->fresh(['period', 'family.headOfFamily', 'payer'])
        ]);
    }

    public function destroyPayment($id): JsonResponse
    {
        $payment = IuranPayment::findOrFail($id);
        $period = $payment->period;
        $this->deleteLegacyPaymentTreasuryLog($payment->payment_id);
        $payment->delete();
        $this->syncPeriodTreasuryLog($period, request()->user()->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Catatan pembayaran berhasil dihapus.'
        ]);
    }

    /**
     * Menampilkan riwayat khusus untuk keluarga dari user yang sedang login.
     * GET /api/v1/me/iuran
     */
    public function myHistory(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->family_id) {
            return response()->json([
                'success' => false,
                'message' => 'User belum terikat dengan Kartu Keluarga manapun.'
            ], 400);
        }

        $myPayments = IuranPayment::where('family_id', $user->family_id)
            ->with('period.category')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat iuran keluarga Anda berhasil diambil.',
            'data'    => $myPayments
        ]);
    }

    private function syncPeriodTreasuryLog(IuranPeriod $period, string $recordedBy): void
    {
        $period->loadMissing('category');

        $payments = IuranPayment::where('period_id', $period->period_id)
            ->where('amount_paid', '>', 0)
            ->get(['payment_id', 'amount_paid']);

        $payments->each(fn (IuranPayment $payment) => $this->deleteLegacyPaymentTreasuryLog($payment->payment_id));

        $description = $this->iuranSummaryDescription($period);
        $totalPaid = (float) $payments->sum('amount_paid');

        if ($totalPaid <= 0) {
            TreasuryLog::where('source', 'IURAN_WARGA')
                ->where('description', $description)
                ->delete();
            return;
        }

        TreasuryLog::updateOrCreate(
            [
                'source' => 'IURAN_WARGA',
                'description' => $description,
            ],
            [
                'type' => 'INCOME',
                'amount' => $totalPaid,
                'receipt_url' => null,
                'recorded_by' => $recordedBy,
            ]
        );
    }

    private function deletePeriodTreasuryLog(IuranPeriod $period): void
    {
        TreasuryLog::where('source', 'IURAN_WARGA')
            ->where('description', $this->iuranSummaryDescription($period))
            ->delete();
    }

    private function deleteLegacyPaymentTreasuryLog(string $paymentId): void
    {
        TreasuryLog::where('source', 'IURAN_WARGA')
            ->where('description', 'like', "AUTO-IURAN Payment ID: {$paymentId}%")
            ->delete();
    }

    private function iuranSummaryDescription(IuranPeriod $period): string
    {
        $months = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        $month = $months[(int) $period->month] ?? $period->period_name;
        $categoryName = $period->category ? $period->category->name : 'Warga';

        return "Rekap pembayaran iuran {$categoryName} bulan {$month} {$period->year}";
    }
}
