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
        $periods = IuranPeriod::withCount([
                'payments',
                'payments as paid_payments_count' => fn ($query) => $query->where('amount_paid', '>', 0),
            ])
            ->latest()
            ->get();

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

        $period = IuranPeriod::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Periode iuran berhasil dibuat.',
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
            'payment_id'      => 'nullable|exists:iuran_payments,payment_id',
            'period_id'       => 'required_without:payment_id|exists:iuran_periods,period_id',
            'family_id'       => 'required_without:payment_id|exists:families,family_id',
            'paid_by_user_id' => 'required|exists:users,user_id',
            'amount_paid'     => 'required|numeric|min:0',
        ]);

        $payment = isset($validated['payment_id'])
            ? IuranPayment::findOrFail($validated['payment_id'])
            : IuranPayment::firstOrNew([
                'period_id' => $validated['period_id'],
                'family_id' => $validated['family_id'],
            ]);

        $payment->fill([
            'period_id'        => $payment->period_id ?? $validated['period_id'],
            'family_id'        => $payment->family_id ?? $validated['family_id'],
            'paid_by_user_id' => $validated['paid_by_user_id'],
            'amount_paid'     => $validated['amount_paid'],
            'paid_at'         => now(),
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Catatan pembayaran berhasil diperbarui.',
            'data'    => $payment->load(['period', 'family.headOfFamily', 'payer'])
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

        return response()->json([
            'success' => true,
            'message' => 'Catatan pembayaran berhasil diperbarui.',
            'data'    => $payment->fresh(['period', 'family.headOfFamily', 'payer'])
        ]);
    }

    public function destroyPayment($id): JsonResponse
    {
        $payment = IuranPayment::findOrFail($id);
        $payment->delete();

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
