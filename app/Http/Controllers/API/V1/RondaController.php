<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\RondaSchedule;
use App\Models\RondaAttendance;
use App\Models\RondaGroup;
use App\Models\RondaLog;
use App\Models\PatrolCheckpointLog;
use App\Models\Checkpoint;
use Illuminate\Support\Carbon;
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
        $this->syncMissingCheckpointsForAllSchedules();

        $schedules = RondaSchedule::with(['group.members', 'coordinator', 'checkpoints', 'attendances', 'checkpointLogs.checkpoint', 'rondaLog'])
            ->get()
            ->sortBy(fn (RondaSchedule $schedule) => Carbon::parse($schedule->schedule_date)->isoWeekday())
            ->values();

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

    public function checkpoints(): JsonResponse
    {
        $checkpoints = Checkpoint::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $checkpoints
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
            'name' => 'required|string|unique:ronda_groups,name',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:users,user_id',
        ]);
        $memberIds = $validated['member_ids'] ?? [];
        unset($validated['member_ids']);

        $group = RondaGroup::create($validated);
        $this->syncGroupMembers($group, $memberIds);

        return response()->json([
            'success' => true,
            'message' => 'Grup ronda berhasil dibuat',
            'data' => $group->load('members')
        ], 201);
    }

    public function updateGroup(Request $request, string $id): JsonResponse
    {
        $group = RondaGroup::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:ronda_groups,name,' . $group->group_id . ',group_id',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:users,user_id',
        ]);
        $memberIds = $validated['member_ids'] ?? null;
        unset($validated['member_ids']);

        $group->update($validated);

        if (is_array($memberIds)) {
            $this->syncGroupMembers($group, $memberIds);
        }

        return response()->json([
            'success' => true,
            'message' => 'Grup ronda berhasil diperbarui',
            'data' => $group->fresh('members')
        ]);
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

        unset($validated['checkpoint_ids']);
        $validated = $this->normalizeScheduleData($validated);
        $this->ensureWeekdayIsAvailable(Carbon::parse($validated['schedule_date'])->isoWeekday());

        $schedule = RondaSchedule::create($validated);
        $this->syncScheduleCheckpoints($schedule, $this->allCheckpointIds());

        return response()->json([
            'success' => true,
            'message' => 'Jadwal ronda berhasil dibuat',
            'data' => $schedule->load(['group.members', 'coordinator', 'checkpoints', 'attendances', 'checkpointLogs.checkpoint', 'rondaLog'])
        ], 201);
    }

    public function updateSchedule(Request $request, string $id): JsonResponse
    {
        $schedule = RondaSchedule::findOrFail($id);

        $validated = $request->validate([
            'group_id' => 'sometimes|required|exists:ronda_groups,group_id',
            'coordinator_id' => 'sometimes|required|exists:users,user_id',
            'schedule_date' => 'nullable|date',
            'shift_start' => 'nullable|date',
            'shift_end' => 'nullable|date|after_or_equal:shift_start',
            'status' => 'nullable|in:SCHEDULED,ONGOING,COMPLETED,MISSED',
            'checkpoint_ids' => 'nullable|array',
            'checkpoint_ids.*' => 'exists:checkpoints,checkpoint_id',
        ]);

        unset($validated['checkpoint_ids']);
        $validated = $this->normalizeScheduleData($validated, $schedule);
        $this->ensureWeekdayIsAvailable(Carbon::parse($validated['schedule_date'])->isoWeekday(), $schedule->schedule_id);

        $schedule->update($validated);
        $this->syncScheduleCheckpoints($schedule, $this->allCheckpointIds());

        return response()->json([
            'success' => true,
            'message' => 'Jadwal ronda berhasil diperbarui',
            'data' => $schedule->fresh(['group.members', 'coordinator', 'checkpoints', 'attendances', 'checkpointLogs.checkpoint', 'rondaLog'])
        ]);
    }

    public function storeCheckpointLog(Request $request, string $id): JsonResponse
    {
        $schedule = RondaSchedule::with('coordinator')->findOrFail($id);

        $validated = $request->validate([
            'checkpoint_id' => 'required|exists:checkpoints,checkpoint_id',
            'scanned_at' => 'nullable|date',
        ]);

        $log = PatrolCheckpointLog::updateOrCreate(
            [
                'schedule_id' => $schedule->schedule_id,
                'checkpoint_id' => $validated['checkpoint_id'],
            ],
            [
                'scanned_by' => $schedule->coordinator_id,
                'scanned_at' => $validated['scanned_at'] ?? now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Log scan checkpoint berhasil disimpan',
            'data' => $log->load(['checkpoint', 'scanner'])
        ], 201);
    }

    public function storeRondaLog(Request $request, string $id): JsonResponse
    {
        $schedule = RondaSchedule::findOrFail($id);

        $validated = $request->validate([
            'path_data' => 'nullable|array',
            'path_data.*.lat' => 'required_with:path_data|numeric',
            'path_data.*.lng' => 'required_with:path_data|numeric',
            'path_data.*.time' => 'nullable|date',
            'distance_covered' => 'nullable|numeric|min:0',
            'duration' => 'nullable|integer|min:0',
        ]);

        $log = RondaLog::updateOrCreate(
            ['schedule_id' => $schedule->schedule_id],
            [
                'path_data' => $validated['path_data'] ?? null,
                'distance_covered' => $validated['distance_covered'] ?? 0,
                'duration' => $validated['duration'] ?? 0,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Log rute ronda berhasil disimpan',
            'data' => $log
        ], 201);
    }

    public function storeCheckpoint(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'qr_code_data' => 'nullable|string|unique:checkpoints,qr_code_data',
            'is_main_pos' => 'sometimes|boolean',
        ]);
        $validated['qr_code_data'] = $validated['qr_code_data'] ?? 'QR-RONDA-' . Str::upper(Str::slug($validated['name'])) . '-' . Str::upper(Str::random(6));

        $checkpoint = Checkpoint::create($validated);
        $this->attachCheckpointToAllSchedules($checkpoint->checkpoint_id);

        return response()->json([
            'success' => true,
            'message' => 'Checkpoint berhasil dibuat',
            'data' => $checkpoint
        ], 201);
    }

    public function updateCheckpoint(Request $request, string $id): JsonResponse
    {
        $checkpoint = Checkpoint::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'latitude' => 'sometimes|required|numeric',
            'longitude' => 'sometimes|required|numeric',
            'qr_code_data' => 'nullable|string|unique:checkpoints,qr_code_data,' . $checkpoint->checkpoint_id . ',checkpoint_id',
            'is_main_pos' => 'sometimes|boolean',
        ]);

        $checkpoint->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Checkpoint berhasil diperbarui',
            'data' => $checkpoint->fresh()
        ]);
    }

    public function destroyCheckpoint(string $id): JsonResponse
    {
        $checkpoint = Checkpoint::findOrFail($id);
        $checkpoint->delete();

        return response()->json([
            'success' => true,
            'message' => 'Checkpoint berhasil dihapus'
        ]);
    }

    private function syncGroupMembers(RondaGroup $group, array $memberIds): void
    {
        DB::table('ronda_group_members')->where('group_id', $group->group_id)->delete();

        if (empty($memberIds)) {
            return;
        }

        DB::table('ronda_group_members')->insert(array_map(
            fn ($userId) => [
                'id' => (string) Str::uuid(),
                'group_id' => $group->group_id,
                'user_id' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            array_values(array_unique($memberIds))
        ));
    }

    private function syncScheduleCheckpoints(RondaSchedule $schedule, array $checkpointIds): void
    {
        DB::table('schedule_checkpoints')->where('schedule_id', $schedule->schedule_id)->delete();

        if (empty($checkpointIds)) {
            return;
        }

        DB::table('schedule_checkpoints')->insert(array_map(
            fn ($checkpointId) => [
                'id' => (string) Str::uuid(),
                'schedule_id' => $schedule->schedule_id,
                'checkpoint_id' => $checkpointId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            array_values(array_unique($checkpointIds))
        ));
    }

    private function normalizeScheduleData(array $data, ?RondaSchedule $schedule = null): array
    {
        if (isset($data['schedule_date'])) {
            $dayOfWeek = Carbon::parse($data['schedule_date'])->isoWeekday();
        } elseif ($schedule?->schedule_date) {
            $dayOfWeek = Carbon::parse($schedule->schedule_date)->isoWeekday();
        }

        if (!isset($dayOfWeek)) {
            abort(response()->json([
                'success' => false,
                'message' => 'Hari jadwal ronda wajib dipilih.',
            ], 422));
        }

        $baseDate = $this->dateForWeekday((int) $dayOfWeek);
        $data['schedule_date'] = $baseDate->toDateString();

        if (array_key_exists('shift_start', $data) && $data['shift_start']) {
            $start = Carbon::parse($data['shift_start'])->setDate($baseDate->year, $baseDate->month, $baseDate->day);
            $data['shift_start'] = $start;
        } else {
            $start = $schedule?->shift_start ? Carbon::parse($schedule->shift_start) : null;
        }

        if (array_key_exists('shift_end', $data) && $data['shift_end']) {
            $end = Carbon::parse($data['shift_end'])->setDate($baseDate->year, $baseDate->month, $baseDate->day);
            if ($start && $end->lessThan($start)) {
                $end->addDay();
            }
            $data['shift_end'] = $end;
        }

        return $data;
    }

    private function dateForWeekday(int $dayOfWeek): Carbon
    {
        $today = now()->startOfDay();
        $daysUntilTarget = ($dayOfWeek - (int) $today->isoWeekday() + 7) % 7;

        return $today->copy()->addDays($daysUntilTarget);
    }

    private function ensureWeekdayIsAvailable(int $dayOfWeek, ?string $ignoreScheduleId = null): void
    {
        $exists = RondaSchedule::query()
            ->when($ignoreScheduleId, fn ($query) => $query->where('schedule_id', '!=', $ignoreScheduleId))
            ->get(['schedule_id', 'schedule_date'])
            ->contains(fn (RondaSchedule $schedule) => Carbon::parse($schedule->schedule_date)->isoWeekday() === $dayOfWeek);

        if ($exists) {
            abort(response()->json([
                'success' => false,
                'message' => 'Jadwal ronda untuk hari tersebut sudah ada. Silakan edit jadwal yang sudah ada.',
            ], 422));
        }
    }

    private function allCheckpointIds(): array
    {
        return Checkpoint::orderByDesc('is_main_pos')
            ->orderBy('name')
            ->pluck('checkpoint_id')
            ->all();
    }

    private function attachCheckpointToAllSchedules(string $checkpointId): void
    {
        RondaSchedule::query()
            ->pluck('schedule_id')
            ->each(function (string $scheduleId) use ($checkpointId) {
                $exists = DB::table('schedule_checkpoints')
                    ->where('schedule_id', $scheduleId)
                    ->where('checkpoint_id', $checkpointId)
                    ->exists();

                if (!$exists) {
                    DB::table('schedule_checkpoints')->insert([
                        'id' => (string) Str::uuid(),
                        'schedule_id' => $scheduleId,
                        'checkpoint_id' => $checkpointId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            });
    }

    private function syncMissingCheckpointsForAllSchedules(): void
    {
        foreach ($this->allCheckpointIds() as $checkpointId) {
            $this->attachCheckpointToAllSchedules($checkpointId);
        }
    }
}
