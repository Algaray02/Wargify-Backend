<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\RondaSchedule;
use App\Models\RondaAttendance;
use App\Models\RondaGroup;
use App\Models\Checkpoint;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RondaController extends Controller
{
    // show schedule ronda
    public function index(): JsonResponse
    {
        $schedules = RondaSchedule::with(['group.members', 'coordinator', 'checkpoints', 'attendances'])
            ->whereDate('schedule_date', now()->toDateString())
            ->get();

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    public function groups(): JsonResponse
    {
        $groups = RondaGroup::with('members')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $groups
        ]);
    }

    // absensi ronda (scan QR code)
    public function attendance(Request $request): JsonResponse
    {
        $request->validate([
            'schedule_id' => 'required|exists:ronda_schedules,schedule_id',
        ]);

        try {
            $attendance = RondaAttendance::create([
                'schedule_id' => $request->schedule_id,
                'user_id' => Auth::id(),
                'scanned_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Absensi berhasil! Selamat bertugas.',
                'data' => $attendance
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat absensi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // make new group ronda
    public function storeGroup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:ronda_groups,name'
        ]);

        $group = RondaGroup::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Grup ronda berhasil dibuat',
            'data' => $group
        ], 201);
    }

    public function addGroupMember(Request $request, string $id): JsonResponse
    {
        $group = RondaGroup::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,user_id',
        ]);

        $exists = DB::table('ronda_group_members')
            ->where('group_id', $group->group_id)
            ->where('user_id', $validated['user_id'])
            ->exists();

        if (!$exists) {
            DB::table('ronda_group_members')->insert([
                'id' => (string) Str::uuid(),
                'group_id' => $group->group_id,
                'user_id' => $validated['user_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Anggota kelompok ronda berhasil ditambahkan',
            'data' => $group->fresh('members')
        ]);
    }

    public function storeSchedule(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group_id' => 'required|exists:ronda_groups,group_id',
            'coordinator_id' => 'required|exists:users,user_id',
            'schedule_date' => 'required|date',
            'shift_start' => 'nullable|date',
            'shift_end' => 'nullable|date|after_or_equal:shift_start',
            'status' => 'nullable|in:SCHEDULED,ONGOING,COMPLETED,MISSED',
            'checkpoint_ids' => 'nullable|array',
            'checkpoint_ids.*' => 'exists:checkpoints,checkpoint_id',
        ]);

        $checkpointIds = $validated['checkpoint_ids'] ?? [];
        unset($validated['checkpoint_ids']);

        $schedule = RondaSchedule::create($validated);

        if (!empty($checkpointIds)) {
            DB::table('schedule_checkpoints')->where('schedule_id', $schedule->schedule_id)->delete();

            DB::table('schedule_checkpoints')->insert(array_map(
                fn ($checkpointId) => [
                    'id' => (string) Str::uuid(),
                    'schedule_id' => $schedule->schedule_id,
                    'checkpoint_id' => $checkpointId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                $checkpointIds
            ));
        }

        return response()->json([
            'success' => true,
            'message' => 'Jadwal ronda berhasil dibuat',
            'data' => $schedule->load(['group.members', 'coordinator', 'checkpoints', 'attendances'])
        ], 201);
    }

    public function storeCheckpoint(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'qr_code_data' => 'required|string|unique:checkpoints,qr_code_data',
            'is_main_pos' => 'sometimes|boolean',
        ]);

        $checkpoint = Checkpoint::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Checkpoint berhasil dibuat',
            'data' => $checkpoint
        ], 201);
    }
}
