<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\FacilityReport;
use App\Services\SupabaseStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FacilityReportController extends Controller
{
    /**
     * Mengambil daftar semua laporan keluhan fasilitas untuk diproses Admin/RT.
     * GET /api/v1/facility-reports
     */
    public function index(): JsonResponse
    {
        // Menampilkan seluruh keluhan diurutkan dari yang terbaru beserta data pelapornya
        $reports = FacilityReport::with('reporter:user_id,full_name,phone_number')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar keluhan fasilitas warga berhasil diambil.',
            'data'    => $reports
        ]);
    }

    /**
     * Warga mengirim laporan fasilitas rusak ke sistem.
     * POST /api/v1/facility-reports
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'category'    => 'required|string|max:100',
            'description' => 'required|string',
            'image_url'   => 'nullable|string',
            'image_file'  => 'nullable|image|max:8192',
        ]);

        // Status awal otomatis di-set SUBMITTED sesuai arahan spesifikasi bisnis logismu
        $validated['status'] = 'SUBMITTED';
        $validated['reporter_id'] = $request->user()->user_id;
        unset($validated['image_file']);

        if ($request->hasFile('image_file')) {
            $validated['image_url'] = $this->uploadReportPhoto($request, 'image_file', 'reports');
        }

        $report = FacilityReport::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Laporan fasilitas berhasil dikirim. Terima kasih atas kepedulian Anda!',
            'data'    => $report
        ], 201);
    }

    /**
     * Pengurus RT mengubah progres status penanganan laporan.
     * PATCH /api/v1/facility-reports/{id}/status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $report = FacilityReport::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:SUBMITTED,IN_PROGRESS,RESOLVED',
        ]);

        $report->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => "Progres laporan berhasil diubah menjadi: {$validated['status']}.",
            'data'    => $report
        ]);
    }

    /**
     * Pengurus RT menyisipkan pesan balasan dan foto bukti hasil perbaikan fisik.
     * PATCH /api/v1/facility-reports/{id}/response
     */
    public function respond(Request $request, $id): JsonResponse
    {
        $report = FacilityReport::findOrFail($id);

        $validated = $request->validate([
            'response_message'   => 'required|string',
            'resolved_photo_url' => 'nullable|string',
            'resolved_photo_file' => 'nullable|image|max:8192',
        ]);
        unset($validated['resolved_photo_file']);

        $oldResolvedPhotoUrl = $report->resolved_photo_url;

        if ($request->hasFile('resolved_photo_file')) {
            $validated['resolved_photo_url'] = $this->uploadReportPhoto($request, 'resolved_photo_file', 'resolved');
        }

        $resolvedPhotoUrl = array_key_exists('resolved_photo_url', $validated)
            ? $validated['resolved_photo_url']
            : $oldResolvedPhotoUrl;

        // Jika RT mengirim respons balasan, idealnya status juga ikut disesuaikan menjadi teratasi
        $report->update([
            'response_message'   => $validated['response_message'],
            'resolved_photo_url' => $resolvedPhotoUrl,
            'status'             => 'RESOLVED' 
        ]);

        if (
            array_key_exists('resolved_photo_url', $validated)
            && filled($oldResolvedPhotoUrl)
            && $oldResolvedPhotoUrl !== $validated['resolved_photo_url']
        ) {
            app(SupabaseStorageService::class)->deletePublicUrl($oldResolvedPhotoUrl);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tanggapan perbaikan berhasil dikirim ke pelapor.',
            'data'    => $report
        ]);
    }

    private function uploadReportPhoto(Request $request, string $field, string $directory): string
    {
        $file = $request->file($field);
        $supabaseUrl = rtrim((string) config('services.supabase.url'), '/');
        $serviceRoleKey = config('services.supabase.service_role_key');
        $bucket = config('services.supabase.buckets.report');

        if (!$supabaseUrl || !$serviceRoleKey || !$bucket) {
            abort(500, 'Konfigurasi Supabase Storage untuk laporan fasilitas belum lengkap.');
        }

        $extension = $file->getClientOriginalExtension() ?: $file->extension();
        $path = $directory . '/' . now()->format('Y/m') . '/' . Str::uuid() . '.' . $extension;
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
            abort(500, 'Gagal mengunggah foto laporan fasilitas ke Supabase Storage.');
        }

        return app(SupabaseStorageService::class)->publicUrl($bucket, $path);
    }
}
