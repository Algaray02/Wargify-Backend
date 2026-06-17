<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\GalleryImage;
use App\Services\SupabaseStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GalleryController extends Controller
{
    /**
     * Mengambil daftar album galeri.
     * GET /api/v1/galleries
     */
    public function index(): JsonResponse
    {
        $galleries = Gallery::with(['images', 'activity:activity_id,type,title,activity_date,location_name,status'])
            ->withCount('images')
            ->latest('event_date')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar album galeri berhasil diambil.',
            'data' => $galleries,
        ]);
    }

    /**
     * Membuat wadah album acara baru.
     * POST /api/v1/galleries
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'album_name'  => 'required|string|max:255',
            'event_date'  => 'required|date',
            'activity_id' => 'nullable|exists:activities,activity_id',
        ]);

        $gallery = Gallery::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Album galeri baru berhasil dibuat.',
            'data'    => $gallery->load(['images', 'activity:activity_id,type,title,activity_date,location_name,status'])
        ], 201);
    }

    /**
     * Melihat detail isi album beserta array foto di dalamnya.
     * GET /api/v1/galleries/{id}
     */
    public function show($id): JsonResponse
    {
        $gallery = Gallery::with(['images', 'activity:activity_id,type,title,activity_date,location_name,status'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Isi album galeri berhasil diambil.',
            'data'    => $gallery
        ]);
    }

    /**
     * Mengubah metadata album galeri.
     * PATCH /api/v1/galleries/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $gallery = Gallery::findOrFail($id);

        $validated = $request->validate([
            'album_name'  => 'sometimes|required|string|max:255',
            'event_date'  => 'sometimes|required|date',
            'activity_id' => 'nullable|exists:activities,activity_id',
        ]);

        $gallery->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Album galeri berhasil diperbarui.',
            'data'    => $gallery->fresh(['images', 'activity:activity_id,type,title,activity_date,location_name,status']),
        ]);
    }

    /**
     * Mengunggah foto secara kolektif (Multiple Upload) ke dalam album.
     * POST /api/v1/galleries/{id}/images
     */
    public function uploadImages(Request $request, $id): JsonResponse
    {
        $gallery = Gallery::findOrFail($id);

        $request->validate([
            'images'   => 'required|array',
            'images.*' => 'required|image|max:8192',
        ]);

        $uploadedImages = [];
        foreach ($request->file('images') as $image) {
            $url = $this->uploadGalleryImage($image, $gallery->gallery_id);

            $uploadedImages[] = GalleryImage::create([
                'gallery_id' => $gallery->gallery_id,
                'image_url'  => $url,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto-foto berhasil ditambahkan ke dalam album.',
            'data'    => $uploadedImages
        ], 201);
    }

    /**
     * Menghapus satu foto spesifik dari database.
     * DELETE /api/v1/gallery-images/{id}
     */
    public function destroyImage($id): JsonResponse
    {
        $image = GalleryImage::findOrFail($id);
        $imageUrl = $image->image_url;
        $image->delete();
        app(SupabaseStorageService::class)->deletePublicUrl($imageUrl);

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil dihapus dari album.'
        ]);
    }

    /**
     * Menghapus album beserta foto di database.
     * DELETE /api/v1/galleries/{id}
     */
    public function destroy($id): JsonResponse
    {
        $gallery = Gallery::findOrFail($id);
        $imageUrls = $gallery->images()->pluck('image_url');
        $gallery->delete();
        app(SupabaseStorageService::class)->deletePublicUrls($imageUrls);

        return response()->json([
            'success' => true,
            'message' => 'Album galeri berhasil dihapus.'
        ]);
    }

    private function uploadGalleryImage($file, string $galleryId): string
    {
        $supabaseUrl = rtrim((string) config('services.supabase.url'), '/');
        $serviceRoleKey = config('services.supabase.service_role_key');
        $bucket = config('services.supabase.buckets.gallery');

        if (!$supabaseUrl || !$serviceRoleKey || !$bucket) {
            abort(500, 'Konfigurasi Supabase Storage untuk galeri belum lengkap.');
        }

        $extension = $file->getClientOriginalExtension() ?: $file->extension();
        $path = 'galleries/' . $galleryId . '/' . now()->timestamp . '-' . Str::random(12) . '.' . $extension;
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
            abort(500, 'Gagal mengunggah foto galeri ke Supabase Storage.');
        }

        return app(SupabaseStorageService::class)->publicUrl($bucket, $path);
    }
}
