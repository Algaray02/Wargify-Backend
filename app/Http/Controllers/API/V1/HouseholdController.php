<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Household;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class HouseholdController extends Controller
{
    /**
     * Mengambil daftar fisik rumah/bangunan.
     * GET /api/v1/households
     */
    public function index(): JsonResponse
    {
        $households = Household::with('families.members')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data rumah berhasil diambil.',
            'data'    => $households
        ]);
    }

    /**
     * Menambahkan data rumah/blok baru ke dalam sistem.
     * POST /api/v1/households
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'block_number' => 'required|string|max:50',
            'house_number' => 'required|string|max:10',
        ]);

        $cleanBlock = Str::upper(Str::slug($validated['block_number']));
        $cleanHouse = Str::upper(Str::slug($validated['house_number']));
        $validated['qr_code_data'] = "QR-HOUSE-{$cleanBlock}-{$cleanHouse}";

        $household = Household::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data rumah baru berhasil ditambahkan.',
            'data'    => $household
        ], 201);
    }

    /**
     * Mengambil detail satu rumah berdasarkan ID.
     * GET /api/v1/households/{id}
     */
    public function show(Household $household): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail data rumah berhasil diambil.',
            'data'    => $household->load('families.members')
        ]);
    }

    /**
     * Mengubah detail data rumah.
     * PATCH /api/v1/households/{id}
     */
    public function update(Request $request, Household $household): JsonResponse
    {
        $validated = $request->validate([
            'block_number' => 'sometimes|required|string|max:50',
            'house_number' => 'sometimes|required|string|max:10',
        ]);

        $household->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data rumah berhasil diperbarui.',
            'data'    => $household
        ]);
    }

    /**
     * Menghapus data rumah.
     * DELETE /api/v1/households/{id}
     */
    public function destroy(Household $household): JsonResponse
    {
        $household->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data rumah berhasil dihapus dari sistem.'
        ]);
    }
}