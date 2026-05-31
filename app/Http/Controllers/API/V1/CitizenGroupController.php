<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\CitizenGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CitizenGroupController extends Controller
{
    public function index(): JsonResponse
    {
        $groups = CitizenGroup::with('members:user_id,full_name,role,phone_number')
            ->withCount('members')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kelompok warga berhasil diambil.',
            'data' => $groups,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:citizen_groups,name',
            'member_ids' => 'array',
            'member_ids.*' => 'exists:users,user_id',
        ]);

        $group = CitizenGroup::create(['name' => $validated['name']]);
        $this->syncMembers($group, $validated['member_ids'] ?? []);

        return response()->json([
            'success' => true,
            'message' => 'Kelompok warga berhasil dibuat.',
            'data' => $group->fresh(['members:user_id,full_name,role,phone_number'])->loadCount('members'),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $group = CitizenGroup::with('members:user_id,full_name,role,phone_number')
            ->withCount('members')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail kelompok warga berhasil diambil.',
            'data' => $group,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $group = CitizenGroup::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:citizen_groups,name,' . $group->group_id . ',group_id',
            'member_ids' => 'array',
            'member_ids.*' => 'exists:users,user_id',
        ]);

        $group->update(['name' => $validated['name']]);
        $this->syncMembers($group, $validated['member_ids'] ?? []);

        return response()->json([
            'success' => true,
            'message' => 'Kelompok warga berhasil diperbarui.',
            'data' => $group->fresh(['members:user_id,full_name,role,phone_number'])->loadCount('members'),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        CitizenGroup::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kelompok warga berhasil dihapus.',
        ]);
    }

    private function syncMembers(CitizenGroup $group, array $memberIds): void
    {
        $syncPayload = collect($memberIds)
            ->unique()
            ->mapWithKeys(fn ($userId) => [$userId => ['id' => (string) Str::uuid()]])
            ->all();

        $group->members()->sync($syncPayload);
    }
}
