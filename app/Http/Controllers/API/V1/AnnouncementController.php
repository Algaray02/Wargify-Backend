<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Services\FirebaseCloudMessagingService;
use App\Services\SupabaseStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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
            'category'   => 'nullable|string|in:PENTING,KEGIATAN,HIMBAUAN,KEUANGAN,LAINNYA',
            'banner_url' => 'nullable|string', // Berupa path string dari file storage
            'banner_file' => 'nullable|image|max:8192',
        ]);
        unset($validated['banner_file']);

        if ($request->hasFile('banner_file')) {
            $validated['banner_url'] = $this->uploadBanner($request);
        }

        // Status awal otomatis diset DRAFT sebelum siap dipublish resmi
        $validated['category'] = $validated['category'] ?? 'HIMBAUAN';
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
        $notification = app(FirebaseCloudMessagingService::class)->notifyAnnouncement($announcement);

        // NOTE: Di sini tempat memicu Push Notification FCM ke aplikasi mobile seluruh warga

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman resmi diterbitkan dan disiarkan ke seluruh pengguna.',
            'data'    => $announcement,
            'notification' => $notification,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);
        $this->abortIfPublished($announcement);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'content'     => 'sometimes|required|string',
            'category'    => 'sometimes|required|string|in:PENTING,KEGIATAN,HIMBAUAN,KEUANGAN,LAINNYA',
            'banner_url'  => 'nullable|string',
            'banner_file' => 'nullable|image|max:8192',
        ]);
        unset($validated['banner_file']);

        $oldBannerUrl = $announcement->banner_url;
        $shouldDeleteOldBanner = false;

        if ($request->hasFile('banner_file')) {
            $validated['banner_url'] = $this->uploadBanner($request);
            $shouldDeleteOldBanner = filled($oldBannerUrl);
        } elseif (array_key_exists('banner_url', $validated) && $validated['banner_url'] !== $oldBannerUrl) {
            $shouldDeleteOldBanner = filled($oldBannerUrl);
        }

        $announcement->update($validated);

        if ($shouldDeleteOldBanner) {
            app(SupabaseStorageService::class)->deletePublicUrl($oldBannerUrl);
        }

        return response()->json([
            'success' => true,
            'message' => 'Draf pengumuman berhasil diperbarui.',
            'data'    => $announcement->fresh('creator:user_id,full_name', 'activity:activity_id,title,type,activity_date'),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);
        $this->abortIfPublished($announcement);
        $announcement->delete();
        app(SupabaseStorageService::class)->deletePublicUrl($announcement->banner_url);

        return response()->json([
            'success' => true,
            'message' => 'Draf pengumuman berhasil dihapus.',
        ]);
    }

    private function abortIfPublished(Announcement $announcement): void
    {
        if ($announcement->status === 'PUBLISHED') {
            abort(422, 'Pengumuman yang sudah terbit tidak dapat diedit atau dihapus.');
        }
    }

    private function uploadBanner(Request $request): string
    {
        $file = $request->file('banner_file');
        $supabaseUrl = rtrim((string) config('services.supabase.url'), '/');
        $serviceRoleKey = config('services.supabase.service_role_key');
        $bucket = config('services.supabase.buckets.announcement');

        if (!$supabaseUrl || !$serviceRoleKey || !$bucket) {
            abort(500, 'Konfigurasi Supabase Storage untuk banner pengumuman belum lengkap.');
        }

        $extension = $file->getClientOriginalExtension() ?: $file->extension();
        $path = 'announcements/' . now()->format('Y/m') . '/' . Str::uuid() . '.' . $extension;
        $uploadUrl = "{$supabaseUrl}/storage/v1/object/{$bucket}/{$path}";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$serviceRoleKey}",
            'apikey' => $serviceRoleKey,
            'Content-Type' => $file->getMimeType(),
            'x-upsert' => 'true',
        ])->withBody(
            file_get_contents($file->getRealPath()),
            $file->getMimeType()
        )->post($uploadUrl);

        if ($response->failed()) {
            abort(500, 'Gagal mengunggah banner pengumuman ke Supabase Storage.');
        }

        return app(SupabaseStorageService::class)->publicUrl($bucket, $path);
    }
}
