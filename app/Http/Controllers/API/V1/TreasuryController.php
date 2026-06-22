<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Family;
use App\Models\IuranPayment;
use App\Models\IuranPeriod;
use App\Models\TreasuryLog;
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class TreasuryController extends Controller
{
    /**
     * Mengambil riwayat mutasi kas (Mendukung filter tipe).
     * GET /api/v1/treasury-logs
     */
    public function index(Request $request): JsonResponse
    {
        $query = TreasuryLog::with('recorder:user_id,full_name')->latest();

        // Fitur Filter berdasarkan tipe (INCOME / EXPENSE) jika dikirim dari Postman/Flutter
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json([
            'success' => true,
            'message' => 'Riwayat mutasi kas berhasil diambil.',
            'data'    => $query->get()
        ]);
    }

    /**
     * Mencatat uang masuk/keluar baru.
     * POST /api/v1/treasury-logs
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'        => 'required|in:INCOME,EXPENSE',
            'source'      => 'required|string|max:255',
            'amount'      => 'required|numeric|min:0',
            'description' => 'required|string',
            'receipt_file' => 'nullable|image|max:8192',
        ]);

        // Otomatis mengambil ID user yang sedang login (Bendahara) sebagai pencatat
        $validated['recorded_by'] = $request->user()->user_id;
        unset($validated['receipt_file']);

        if ($request->hasFile('receipt_file')) {
            $validated['receipt_url'] = $this->uploadReceipt($request);
        }

        $log = TreasuryLog::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Catatan mutasi kas berhasil disimpan.',
            'data'    => $log
        ], 201);
    }

    /**
     * Mengedit deskripsi atau nominal transaksi kas jika ada kekeliruan.
     * PATCH /api/v1/treasury-logs/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $log = TreasuryLog::findOrFail($id);

        $validated = $request->validate([
            'type'        => 'sometimes|required|in:INCOME,EXPENSE',
            'source'      => 'sometimes|required|string|max:255',
            'amount'      => 'sometimes|required|numeric|min:0',
            'description' => 'sometimes|required|string',
            'receipt_file' => 'nullable|image|max:8192',
        ]);

        unset($validated['receipt_file']);

        $oldReceiptUrl = $log->receipt_url;

        if ($request->hasFile('receipt_file')) {
            $validated['receipt_url'] = $this->uploadReceipt($request);
        }

        $log->update($validated);

        if (
            array_key_exists('receipt_url', $validated)
            && filled($oldReceiptUrl)
            && $oldReceiptUrl !== $validated['receipt_url']
        ) {
            app(SupabaseStorageService::class)->deletePublicUrl($oldReceiptUrl);
        }

        return response()->json([
            'success' => true,
            'message' => 'Catatan transaksi kas berhasil diperbarui.',
            'data'    => $log
        ]);
    }

    /**
     * Menghapus log transaksi kas.
     * DELETE /api/v1/treasury-logs/{id}
     */
    public function destroy($id): JsonResponse
    {
        $log = TreasuryLog::findOrFail($id);
        $receiptUrl = $log->receipt_url;
        $log->delete();
        app(SupabaseStorageService::class)->deletePublicUrl($receiptUrl);

        return response()->json([
            'success' => true,
            'message' => 'Catatan transaksi kas berhasil dihapus dari sistem.'
        ]);
    }

    /**
     * LOGIKA UTAMA: Menghitung akumulasi uang kas saat ini (Total Masuk - Total Keluar).
     * GET /api/v1/treasury-summary
     */
    public function summary(): JsonResponse
    {
        $totalIncome = TreasuryLog::where('type', 'INCOME')->sum('amount');
        $totalExpense = TreasuryLog::where('type', 'EXPENSE')->sum('amount');
        $currentBalance = $totalIncome - $totalExpense;

        return response()->json([
            'success' => true,
            'message' => 'Akumulasi ringkasan kas berhasil dihitung.',
            'data'    => [
                'total_income'    => (float) $totalIncome,
                'total_expense'   => (float) $totalExpense,
                'current_balance' => (float) $currentBalance,
            ]
        ]);
    }

    //untuk halaman audit bendahara
    public function auditSummary(): JsonResponse
    {
        try {
            // 1. Gunakan WHERE LOWER untuk mengamankan variasi teks 'income' / 'INCOME' di database
            $totalIncome = (float) (TreasuryLog::whereRaw('LOWER(type) = ?', ['income'])->sum('amount') ?? 0);
            $totalExpense = (float) (TreasuryLog::whereRaw('LOWER(type) = ?', ['expense'])->sum('amount') ?? 0);
            $currentBalance = $totalIncome - $totalExpense;

            // 2. Ambil list rincian pengeluaran dengan filter lower case
            $expensesList = TreasuryLog::whereRaw('LOWER(type) = ?', ['expense'])
                ->latest()
                ->get()
                ->map(function ($item) {
                    return [
                        'title' => $item->source ?? 'Pengeluaran Kas',
                        'amount' => (float) ($item->amount ?? 0),
                        'notes' => $item->description ?? '-',
                    ];
                });

            // 3. Tarik statistik warga murni
            $totalKk = (int) \Illuminate\Support\Facades\DB::table('families')
                ->join('users as heads', 'families.head_of_family_id', '=', 'heads.user_id')
                ->where('heads.role', 'WARGA')
                ->whereNull('heads.deleted_at')
                ->count('families.family_id');
            $activePeriod = IuranPeriod::with('category')->latest()->first();

            $sudahBayarKk = 0;
            $tariffPerKk = 150000;
            $periodLabel = 'Oktober 2026';

            if ($activePeriod) {
                $periodLabel = $activePeriod->period_name ?? 'Periode Aktif';
                if ($activePeriod->category) {
                    $tariffPerKk = (float) ($activePeriod->category->default_amount ?? 150000);
                }

                $sudahBayarKk = (int) IuranPayment::where('period_id', $activePeriod->period_id)
                    ->where('amount_paid', '>', 0)
                    ->distinct('family_id')
                    ->count('family_id');
            }

            // 🌟 KUNCI: Bungkus data secara presisi sesuai dengan variabel yang dideklarasikan di Flutter
            return response()->json([
                'success' => true,
                'message' => 'Data audit keuangan berhasil diproses.',
                'data' => [
                    'summary' => [
                        'total_income'   => $totalIncome,
                        'total_expense'  => $totalExpense,
                        'current_balance'=> $currentBalance,
                        'current_period_label' => $periodLabel,
                        'generated_at'   => now()->format('d M Y'),
                    ],
                    'expenses' => $expensesList->toArray(), // Pastikan dikonversi ke array clean JSON
                    'iuran_stats' => [
                        'total_kk'       => $totalKk,
                        'sudah_bayar_kk' => $sudahBayarKk,
                        'tariff_per_kk'  => $tariffPerKk,
                        'total_collected'=> $totalIncome,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses data audit: ' . $e->getMessage()
            ], 500);
        }
    }

    private function uploadReceipt(Request $request): string
    {
        $file = $request->file('receipt_file');
        $supabaseUrl = rtrim((string) config('services.supabase.url'), '/');
        $serviceRoleKey = config('services.supabase.service_role_key');
        $bucket = config('services.supabase.buckets.treasury');

        if (!$supabaseUrl || !$serviceRoleKey || !$bucket) {
            abort(500, 'Konfigurasi Supabase Storage untuk bukti kas belum lengkap.');
        }

        $extension = $file->getClientOriginalExtension() ?: $file->extension();
        $path = 'receipts/' . now()->format('Y/m') . '/' . Str::uuid() . '.' . $extension;
        $uploadUrl = "{$supabaseUrl}/storage/v1/object/{$bucket}/{$path}";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$serviceRoleKey}",
            'apikey' => $serviceRoleKey,
            'Content-Type' => $file->getMimeType(),
            'x-upsert' => 'true',
        ])->withBody(
            file_get_contents($file->getRealPath()),
            $file->getMimeType()
        )->post($uploadUrl);

        if ($response->failed()) {
            abort(500, 'Gagal mengunggah bukti kas ke Supabase Storage.');
        }

        return app(SupabaseStorageService::class)->publicUrl($bucket, $path);
    }
}
