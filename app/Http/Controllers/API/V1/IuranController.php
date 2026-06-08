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
    public function storePeriod(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id'       => 'required|exists:iuran_categories,category_id',
            'period_name'       => 'required|string|max:255',
            'month'             => 'required|integer|between:1,12',
            'year'              => 'required|integer|min:2026',
        ]);

        $category = IuranCategory::findOrFail($validated['category_id']);
        $validated['payment_qr_code'] = 'QR-PAY-' . Str::upper(Str::slug($validated['period_name']));
        $period = IuranPeriod::create($validated);

        $announcement = Announcement::create([
            'announcement_id' => Str::uuid(),
            'title' => 'Iuran baru: ' . $period->period_name,
            'content' => 'Periode iuran ' . $period->period_name . ' (' . $category->name . ') telah dibuka. Nominal standar per KK Rp ' . number_format((float) $category->default_amount, 0, ',', '.') . '.',
            'banner_url' => null,
            'status' => 'published',
            'created_by' => $request->user()->user_id,
        ]);

        app(FirebaseCloudMessagingService::class)->notifyAnnouncement($announcement);

        return response()->json([
            'success' => true,
            'message' => 'Periode iuran berhasil dibuat.',
            'data'    => $period
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
    public function checkArrears(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'family_id' => 'required|exists:families,family_id',
        ]);

        $familyId = $validated['family_id'];

        // 1. Get all period dues created by the RT management
        $allPeriods = IuranPeriod::with('category')->get();

        // 2. Get period IDs that have ALREADY BEEN PAID by this family
        $paidPeriodIds = IuranPayment::where('family_id', $familyId)
            ->where('amount_paid', '>', 0)
            ->pluck('period_id')
            ->toArray();

        // 3. Get any custom tariff exceptions specifically set for this family
        $customTariffs = FamilyIuranTariff::where('family_id', $familyId)
            ->pluck('amount', 'category_id');

        $arrearsDetails = [];
        $totalOutstanding = 0;

        // 4. Loop through to find unpaid/outstanding periods
        foreach ($allPeriods as $period) {
            if (!in_array($period->period_id, $paidPeriodIds)) {
                
                // Use custom family tariff if available, otherwise fallback to standard category default amount
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
            'message' => 'Family outstanding arrears calculated successfully.',
            'data'    => [
                'family_id'         => $familyId,
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
        $period = IuranPeriod::with('category')->findOrFail($id);
        
        // Ambil semua transaksi yang sudah masuk di periode ini
        $paymentsByFamily = IuranPayment::where('period_id', $id)
            ->with(['family.headOfFamily', 'family.household', 'payer'])
            ->get()
            ->keyBy('family_id');

        // Ambil semua daftar tarif kustom khusus kategori ini (Revisi Dosen)
        $customTariffs = FamilyIuranTariff::where('category_id', $period->category_id)
            ->pluck('amount', 'family_id');

        $defaultAmount = (float) $period->category->default_amount;

        $payments = Family::with(['headOfFamily', 'household', 'members'])
            ->orderBy('created_at')
            ->get()
            ->map(function (Family $family) use ($paymentsByFamily, $period, $customTariffs, $defaultAmount) {
                $payment = $paymentsByFamily->get($family->family_id);
                
                // Jika ada tarif kustom gunakan tarif kustom, jika tidak gunakan tarif default kategori
                $targetAmount = (float) ($customTariffs->get($family->family_id) ?? $defaultAmount);
                $amountPaid = (float) ($payment?->amount_paid ?? 0);

                return [
                    'payment_id'      => $payment?->payment_id,
                    'period_id'       => $period->period_id,
                    'family_id'       => $family->family_id,
                    'family'          => $family,
                    'payer'           => $payment?->payer,
                    'paid_by_user_id' => $payment?->paid_by_user_id,
                    'amount_paid'     => $amountPaid,
                    'target_amount'   => $targetAmount,
                    'paid_at'         => $payment?->paid_at,
                    'is_paid'         => $payment && $amountPaid >= $targetAmount,
                    'payment_qr_code' => $period->payment_qr_code . '-FAM-' . Str::upper(Str::substr($family->family_id, 0, 8)),
                    'created_at'      => $payment?->created_at,
                    'updated_at'      => $payment?->updated_at,
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Rekap pembayaran periode ini berhasil diambil.',
            'data'    => [
                'period'   => $period,
                'payments' => $payments,
            ]
        ]);
    }

    /**
     * Mencatat transaksi pembayaran warga (Mengubah status menjadi Lunas).
     * POST /api/v1/iuran-payments
     */
    public function storePayment(Request $request): JsonResponse
    {
        // Dibuat fleksibel: mendukung pencatatan via payment_id lama maupun kombinasi period_id + family_id baru
        $validated = $request->validate([
            'payment_id'      => 'nullable|string',
            'period_id'       => 'required_without:payment_id|exists:iuran_periods,period_id',
            'family_id'       => 'required_without:payment_id|exists:families,family_id',
            'paid_by_user_id' => 'required|exists:users,user_id',
            'amount_paid'     => 'required|numeric|min:0',
        ]);

        if (!empty($validated['payment_id'])) {
            $payment = IuranPayment::findOrFail($validated['payment_id']);
            $payment->update([
                'paid_by_user_id' => $validated['paid_by_user_id'],
                'amount_paid'     => $validated['amount_paid'],
                'paid_at'         => now(),
            ]);
        } else {
            // Karena data pembayaran tidak di-generate di awal, gunakan updateOrCreate saat warga bayar lewat scan QR
            $payment = IuranPayment::updateOrCreate(
                [
                    'period_id' => $validated['period_id'],
                    'family_id' => $validated['family_id'],
                ],
                [
                    'paid_by_user_id' => $validated['paid_by_user_id'],
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
