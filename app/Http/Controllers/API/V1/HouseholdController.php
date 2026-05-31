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

        if (isset($validated['block_number']) || isset($validated['house_number'])) {
            $block = $validated['block_number'] ?? $household->block_number;
            $house = $validated['house_number'] ?? $household->house_number;
            $validated['qr_code_data'] = 'QR-HOUSE-' . Str::upper(Str::slug($block)) . '-' . Str::upper(Str::slug($house));
        }

        $household->update($validated);

        if (isset($validated['qr_code_data'])) {
            $freshHousehold = $household->fresh();

            $freshHousehold->families()->get()->each(function ($family) use ($freshHousehold) {
                $family->update([
                    'qr_code_data' => $this->makeFamilyQrData($freshHousehold, $family->family_id),
                ]);
            });
        }

        return response()->json([
            'success' => true,
            'message' => 'Data rumah berhasil diperbarui.',
            'data'    => $household->fresh('families.members')
        ]);
    }

    private function makeFamilyQrData(Household $household, string $familyId): string
    {
        $cleanBlock = Str::upper(Str::slug($household->block_number));
        $cleanHouse = Str::upper(Str::slug($household->house_number));
        $familySuffix = Str::upper(Str::substr($familyId, 0, 8));

        return "QR-FAM-{$cleanBlock}-{$cleanHouse}-{$familySuffix}";
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
