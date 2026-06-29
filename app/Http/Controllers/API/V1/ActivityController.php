<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Announcement;
use App\Models\CitizenGroup;
use App\Models\Household;
use App\Services\FirebaseCloudMessagingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityController extends Controller
{
    /**
     * Mengambil daftar kegiatan untuk warga dan pengurus.
     * GET /api/v1/activities
     */
    public function index(Request $request): JsonResponse
    {
        $query = Activity::with([
                'creator:user_id,full_name',
                'household:household_id,block_number,house_number,qr_code_data',
                'targetGroups.members:user_id,full_name,role,phone_number,profile_picture_url',
                'invitedUsers:user_id,full_name,role',
            ])
            ->withCount(['participants', 'targetGroups', 'invitedUsers'])
            ->latest('activity_date');

        if ($request->user()?->role === 'WARGA') {
            $userId = $request->user()->user_id;

            $query->whereIn('status', ['ANNOUNCED', 'COMPLETED'])
                ->where(function ($targetQuery) use ($userId) {
                    $targetQuery
                        ->whereDoesntHave('targetGroups')
                        ->whereDoesntHave('invitedUsers')
                        ->orWhereHas('invitedUsers', fn ($userQuery) => $userQuery->where('users.user_id', $userId))
                        ->orWhereHas('targetGroups.members', fn ($userQuery) => $userQuery->where('users.user_id', $userId));
                });
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar kegiatan berhasil diambil.',
            'data' => $query->get(),
        ]);
    }

    /**
     * Mengambil detail satu kegiatan.
     * GET /api/v1/activities/{id}
     */
    public function show($id): JsonResponse
    {
        $activity = Activity::with([
                'creator:user_id,full_name',
                'household:household_id,block_number,house_number,qr_code_data',
                'targetGroups:citizen_groups.group_id,name',
                'invitedUsers:user_id,full_name,role,phone_number',
                'participants:user_id,full_name,role',
            ])
            ->withCount(['participants', 'targetGroups', 'invitedUsers'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail kegiatan berhasil diambil.',
            'data' => $activity,
        ]);
    }

    /**
     * Membuat draft kegiatan baru.
     * POST /api/v1/activities
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'          => 'required|in:RAPAT,KEGIATAN_UMUM',
            'title'         => 'required|string|max:255',
            'description'   => 'required|string',
            'activity_date' => 'required|date',
            'location_name' => 'required|string|max:255',
            'household_id'  => 'nullable|exists:households,household_id',
            'target_group_ids' => 'array',
            'target_group_ids.*' => 'exists:citizen_groups,group_id',
            'target_user_ids' => 'array',
            'target_user_ids.*' => 'exists:users,user_id',
        ]);

        // Status awal otomatis DRAFT sesuai spesifikasi
        $activityData = collect($validated)->except(['target_group_ids', 'target_user_ids'])->all();
        $activityData['status'] = 'DRAFT';
        $activityData['created_by'] = $request->user()->user_id;
        $activityData['attendance_qr_code'] = $this->makeAttendanceQrCode($activityData);

        $activity = Activity::create($activityData);
        $this->syncTargets($activity, $validated['target_group_ids'] ?? [], $validated['target_user_ids'] ?? []);

        return response()->json([
            'success' => true,
            'message' => 'Draft kegiatan baru berhasil dibuat.',
            'data'    => $activity->fresh(['targetGroups:citizen_groups.group_id,name', 'invitedUsers:user_id,full_name,role'])
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $validated = $request->validate([
            'type'          => 'required|in:RAPAT,KEGIATAN_UMUM',
            'title'         => 'required|string|max:255',
            'description'   => 'required|string',
            'activity_date' => 'required|date',
            'location_name' => 'required|string|max:255',
            'household_id'  => 'nullable|exists:households,household_id',
            'target_group_ids' => 'array',
            'target_group_ids.*' => 'exists:citizen_groups,group_id',
            'target_user_ids' => 'array',
            'target_user_ids.*' => 'exists:users,user_id',
        ]);

        $activityData = collect($validated)->except(['target_group_ids', 'target_user_ids'])->all();
        $activityData['attendance_qr_code'] = $this->makeAttendanceQrCode($activityData, $activity);

        $activity->update($activityData);
        $this->syncTargets($activity, $validated['target_group_ids'] ?? [], $validated['target_user_ids'] ?? []);

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil diperbarui.',
            'data'    => $activity->fresh([
                'creator:user_id,full_name',
                'household:household_id,block_number,house_number,qr_code_data',
                'targetGroups:citizen_groups.group_id,name',
                'invitedUsers:user_id,full_name,role',
            ])
        ]);
    }

    /**
     * Mengubah status ke ANNOUNCED (Siap dipublish ke warga).
     * POST /api/v1/activities/{id}/announce
     */
    public function announce(Request $request, $id): JsonResponse
    {
        $activity = Activity::with(['targetGroups:citizen_groups.group_id,name', 'invitedUsers:user_id,full_name,role'])
            ->findOrFail($id);
        
        $activity->update(['status' => 'ANNOUNCED']);
        $announcement = $this->publishActivityAnnouncement($activity, $request->user()->user_id);
        $notification = app(FirebaseCloudMessagingService::class)->notifyActivity($activity);

        return response()->json([
            'success' => true,
            'message' => $activity->targetGroups()->exists() || $activity->invitedUsers()->exists()
                ? 'Kegiatan telah diumumkan ke target undangan.'
                : 'Kegiatan telah diumumkan ke seluruh warga.',
            'data'    => $activity,
            'announcement' => $announcement,
            'notification' => $notification,
        ]);
    }

    /**
     * Mengubah status menjadi COMPLETED (Acara selesai).
     * POST /api/v1/activities/{id}/complete
     */
    public function complete($id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        
        $activity->update(['status' => 'COMPLETED']);

        return response()->json([
            'success' => true,
            'message' => 'Status kegiatan berhasil diubah menjadi SELESAI (COMPLETED).',
            'data'    => $activity
        ]);
    }

    /**
     * Mencatat presensi warga yang hadir melalui scan QR acara.
     * POST /api/v1/activities/{id}/attendance
     */
    public function attendance(Request $request, $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        if ($activity->type !== 'RAPAT') {
            return response()->json([
                'success' => false,
                'message' => 'Absensi hanya tersedia untuk kegiatan berjenis rapat.'
            ], 400);
        }

        if ($activity->status !== 'ANNOUNCED') {
            return response()->json([
                'success' => false,
                'message' => 'Presensi ditolak. Acara belum dimulai atau sudah selesai.'
            ], 400);
        }

        $userId = $request->user()->user_id;

        if (!$this->isInvited($activity, $userId)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak termasuk daftar undangan rapat ini.'
            ], 403);
        }

        // Cek apakah warga ini sudah melakukan scan sebelumnya
        $alreadyAttended = $activity->participants()->where('activity_participants.user_id', $userId)->exists();

        if ($alreadyAttended) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah melakukan presensi di kegiatan ini.'
            ], 400);
        }

        // Catat kehadiran ke tabel pivot
        $activity->participants()->attach($userId, [
            'participant_id' => (string) Str::uuid(),
            'attended_at'    => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Presensi berhasil dicatat. Terima kasih atas kehadiran Anda!'
        ]);
    }

    /**
     * Mengambil daftar warga yang hadir di kegiatan tersebut.
     * GET /api/v1/activities/{id}/participants
     */
    public function participants($id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        
        // Mengambil daftar user yang terikat di pivot activity_participants
        $participants = $activity->participants()
            ->select('users.user_id', 'users.full_name', 'users.role')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar warga yang hadir berhasil diambil.',
            'data'    => [
                'activity_title' => $activity->title,
                'total_present'  => $participants->count(),
                'warga'          => $participants
            ]
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        $activity->participants()->detach();
        $activity->targetGroups()->detach();
        $activity->invitedUsers()->detach();
        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil dihapus.'
        ]);
    }

    private function makeAttendanceQrCode(array $data, ?Activity $activity = null): ?string
    {
        if (($data['type'] ?? $activity?->type) !== 'RAPAT') {
            return null;
        }

        return $activity?->attendance_qr_code ?: 'QR-ACT-' . (string) Str::uuid();
    }

    private function syncTargets(Activity $activity, array $groupIds, array $userIds): void
    {
        $uniqueGroupIds = collect($groupIds)->unique()->values();
        $groupMemberIds = CitizenGroup::whereIn('group_id', $uniqueGroupIds)
            ->with('members:user_id')
            ->get()
            ->flatMap(fn (CitizenGroup $group) => $group->members->pluck('user_id'))
            ->unique()
            ->values();

        $groupPayload = $uniqueGroupIds
            ->unique()
            ->mapWithKeys(fn ($groupId) => [$groupId => ['id' => (string) Str::uuid()]])
            ->all();

        $userPayload = collect($userIds)
            ->unique()
            ->diff($groupMemberIds)
            ->mapWithKeys(fn ($userId) => [$userId => ['id' => (string) Str::uuid()]])
            ->all();

        $activity->targetGroups()->sync($groupPayload);
        $activity->invitedUsers()->sync($userPayload);
    }

    private function publishActivityAnnouncement(Activity $activity, string $createdBy): Announcement
    {
        $announcement = Announcement::updateOrCreate(
            ['activity_id' => $activity->activity_id],
            [
                'title' => 'Kegiatan: ' . $activity->title,
                'content' => $activity->description,
                'category' => 'KEGIATAN',
                'banner_url' => null,
                'status' => 'PUBLISHED',
                'created_by' => $createdBy,
            ]
        );

        return $announcement->fresh();
    }

    private function isInvited(Activity $activity, string $userId): bool
    {
        if (
            !$activity->targetGroups()->exists()
            && !$activity->invitedUsers()->exists()
        ) {
            return true;
        }

        return $activity->invitedUsers()->where('users.user_id', $userId)->exists()
            || $activity->targetGroups()
                ->whereHas('members', fn ($query) => $query->where('users.user_id', $userId))
                ->exists();
    }
}
