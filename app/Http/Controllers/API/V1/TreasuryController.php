<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\TreasuryLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
            'receipt_url' => 'nullable|string', // Opsional, bisa diisi path string atau url berkas
        ]);

        // Otomatis mengambil ID user yang sedang login (Bendahara) sebagai pencatat
        $validated['recorded_by'] = $request->user()->user_id;

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
            'source'      => 'sometimes|required|string|max:255',
            'amount'      => 'sometimes|required|numeric|min:0',
            'description' => 'sometimes|required|string',
            'receipt_url' => 'nullable|string',
        ]);

        $log->update($validated);

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
        $log->delete();

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
}