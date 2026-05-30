<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\GalleryImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
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
            'data'    => $gallery
        ], 201);
    }

    /**
     * Melihat detail isi album beserta array foto di dalamnya.
     * GET /api/v1/galleries/{id}
     */
    public function show($id): JsonResponse
    {
        $gallery = Gallery::with('images')->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Isi album galeri berhasil diambil.',
            'data'    => $gallery
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
            'images.*' => 'required|string', // Sementara menerima array string URL/path foto dari storage
        ]);

        $uploadedImages = [];
        foreach ($request->images as $url) {
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
        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil dihapus dari album.'
        ]);
    }
}
