<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityController extends Controller
{
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
        ]);

        // Status awal otomatis DRAFT sesuai spesifikasi
        $validated['status'] = 'DRAFT';
        $validated['created_by'] = $request->user()->user_id;
        $validated['attendance_qr_code'] = 'QR-ACT-' . (string) Str::uuid();

        $activity = Activity::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Draft kegiatan baru berhasil dibuat.',
            'data'    => $activity
        ], 201);
    }

    /**
     * Mengubah status ke ANNOUNCED (Siap dipublish ke warga).
     * POST /api/v1/activities/{id}/announce
     */
    public function announce($id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        
        $activity->update(['status' => 'ANNOUNCED']);

        // NOTE: Di sini kamu bisa menyisipkan fungsi Push Notification (FCM) nanti
        return response()->json([
            'success' => true,
            'message' => 'Kegiatan telah diumumkan ke seluruh warga.',
            'data'    => $activity
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

        if ($activity->status !== 'ANNOUNCED') {
            return response()->json([
                'success' => false,
                'message' => 'Presensi ditolak. Acara belum dimulai atau sudah selesai.'
            ], 400);
        }

        $userId = $request->user()->user_id;

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
}
