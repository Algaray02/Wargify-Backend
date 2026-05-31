<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Services\FirebaseCloudMessagingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Mengambil daftar pengumuman yang sudah terbit untuk beranda warga.
     * GET /api/v1/announcements
     */
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::with([
                'creator:user_id,full_name',
                'activity:activity_id,title,type,activity_date',
            ])
            ->latest();

        if ($request->user()?->role === 'WARGA') {
            $query->where('status', 'PUBLISHED');
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengumuman berhasil diambil.',
            'data'    => $query->get()
        ]);
    }

    /**
     * Membuat draf konten pengumuman baru (Oleh Pengurus).
     * POST /api/v1/announcements
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'content'    => 'required|string',
            'banner_url' => 'nullable|string', // Berupa path string dari file storage
        ]);

        // Status awal otomatis diset DRAFT sebelum siap dipublish resmi
        $validated['status'] = 'DRAFT';
        $validated['created_by'] = $request->user()->user_id;

        $announcement = Announcement::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Draf pengumuman berhasil disimpan.',
            'data'    => $announcement
        ], 201);
    }

    /**
     * Menerbitkan pengumuman ke warga.
     * POST /api/v1/announcements/{id}/publish
     */
    public function publish($id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);

        $announcement->update(['status' => 'PUBLISHED']);
        $notification = app(FirebaseCloudMessagingService::class)->notifyAnnouncement($announcement);

        // NOTE: Di sini tempat memicu Push Notification FCM ke aplikasi mobile seluruh warga

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman resmi diterbitkan dan disiarkan ke seluruh pengguna.',
            'data'    => $announcement,
            'notification' => $notification,
        ]);
    }
}
