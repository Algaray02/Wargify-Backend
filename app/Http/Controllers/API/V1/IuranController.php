<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\IuranPeriod;
use App\Models\IuranPayment;
use App\Models\Family;
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
        $periods = IuranPeriod::latest()->get();

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
            'period_name'       => 'required|string|max:255',
            'month'             => 'required|integer|between:1,12',
            'year'              => 'required|integer|min:2026',
            'amount_per_family' => 'required|numeric|min:0',
        ]);

        // Generate QR Code Statis untuk pembayaran bulan ini
        $validated['payment_qr_code'] = 'QR-PAY-' . Str::upper(Str::slug($validated['period_name']));

        // 1. Simpan Periode Baru
        $period = IuranPeriod::create($validated);

        // 2. LOGIKA UTAMA: Ambil semua keluarga aktif untuk digenerate tagihannya
        $families = Family::all();

        foreach ($families as $family) {
            IuranPayment::create([
                'period_id'   => $period->period_id,
                'family_id'   => $family->family_id,
                'amount_paid' => 0,
                'status'      => 'BELUM_BAYAR',
                'paid_at'     => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Periode iuran berhasil dibuat dan tagihan seluruh keluarga telah di-generate.',
            'data'    => $period
        ], 201);
    }

    /**
     * Melihat rekap status seluruh tagihan keluarga pada bulan tersebut.
     * GET /api/v1/iuran-periods/{id}/payments
     */
    public function periodPayments($id): JsonResponse
    {
        $payments = IuranPayment::where('period_id', $id)
            ->with(['family.headOfFamily', 'payer'])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Rekap pembayaran periode ini berhasil diambil.',
            'data'    => $payments
        ]);
    }

    /**
     * Mencatat transaksi pembayaran warga (Mengubah status menjadi Lunas).
     * POST /api/v1/iuran-payments
     */
    public function storePayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_id'      => 'required|exists:iuran_payments,payment_id',
            'paid_by_user_id' => 'required|exists:users,user_id',
            'amount_paid'     => 'required|numeric|min:0',
        ]);

        $payment = IuranPayment::findOrFail($validated['payment_id']);
        
        $payment->update([
            'paid_by_user_id' => $validated['paid_by_user_id'],
            'amount_paid'     => $validated['amount_paid'],
            'status'          => 'LUNAS',
            'paid_at'         => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Catatan pembayaran berhasil diperbarui, status: LUNAS.',
            'data'    => $payment
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
            ->with('period')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat iuran keluarga Anda berhasil diambil.',
            'data'    => $myPayments
        ]);
    }
}