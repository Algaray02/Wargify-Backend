<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Family;
use App\Models\User;
use Illuminate\Http\Request;

class FamilyController extends Controller
{
    public function index()
    {
        $families = Family::with(['household', 'members'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
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

    public function update(Request $request, Family $family)
    {
        $validated = $request->validate([
            'household_id' => 'sometimes|required|exists:households,household_id',
            'head_of_family_id' => 'nullable|exists:users,user_id',
            'qr_code_data' => 'sometimes|required|string|unique:families,qr_code_data,' . $family->family_id . ',family_id',
        ]);

        $family->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data keluarga berhasil diperbarui',
            'data' => $family->fresh(['household', 'members'])
        ]);
    }

    public function addMember(Request $request, $id)
    {
        $family = Family::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,user_id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $user->update(['family_id' => $family->family_id]);

        return response()->json([
            'success' => true,
            'message' => 'Anggota keluarga berhasil ditambahkan',
            'data' => $family->fresh(['household', 'members'])
        ]);
    }

    public function removeMember($id, $userId)
    {
        $family = Family::findOrFail($id);
        $user = User::where('family_id', $family->family_id)->findOrFail($userId);

        $user->update(['family_id' => null]);

        if ($family->head_of_family_id === $user->user_id) {
            $family->update(['head_of_family_id' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Anggota keluarga berhasil dihapus',
            'data' => $family->fresh(['household', 'members'])
        ]);
    }

    public function setHeadOfFamily(Request $request, $id)
    {
        $family = Family::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,user_id',
        ]);

        $user = User::findOrFail($validated['user_id']);

        if ($user->family_id !== $family->family_id) {
            return response()->json([
                'success' => false,
                'message' => 'User bukan anggota keluarga ini.'
            ], 422);
        }

        $family->update(['head_of_family_id' => $user->user_id]);

        return response()->json([
            'success' => true,
            'message' => 'Kepala keluarga berhasil diperbarui',
            'data' => $family->fresh(['household', 'members'])
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
