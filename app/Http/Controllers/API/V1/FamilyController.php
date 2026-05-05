<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Family;
use Illuminate\Http\Request;

class FamilyController extends Controller
{
    public function index()
    {
        $families = Family::all();
        return response()->json([
            'message' => 'Family index',
            'data' => $families
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'household_id' => 'required|exists:households,household_id',
            'qr_code_data' => 'nullable|string|unique:families,qr_code_data',
        ]);

        try {
            $family = Family::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Keluarga berhasil ditambahkan',
                'data' => $family
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambah keluarga',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $family = Family::with('household', 'members')->find($id);

        if (!$family) {
            return response()->json([
                'message' => "Family with id $id not found"
            ], 404);
        }

        return response()->json([
            'message' => "Family show: $id",
            'success' => true,
            'data' => $family
        ]);
    }

    public function destroy(Family $family)
    {
        $family->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Data keluarga berhasil dihapus'
        ]);
    }
}
