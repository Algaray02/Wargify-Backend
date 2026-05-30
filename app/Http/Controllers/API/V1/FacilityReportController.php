<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\FacilityReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'image_url'   => 'nullable|string', // Berupa path string foto kerusakan dari storage
        ]);

        // Status awal otomatis di-set SUBMITTED sesuai arahan spesifikasi bisnis logismu
        $validated['status'] = 'SUBMITTED';
        $validated['reporter_id'] = $request->user()->user_id;

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
            'resolved_photo_url' => 'nullable|string', // Opsional bukti foto kalau pengerjaan sudah kelar
        ]);

        // Jika RT mengirim respons balasan, idealnya status juga ikut disesuaikan menjadi teratasi
        $report->update([
            'response_message'   => $validated['response_message'],
            'resolved_photo_url' => $validated['resolved_photo_url'],
            'status'             => 'RESOLVED' 
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tanggapan perbaikan berhasil dikirim ke pelapor.',
            'data'    => $report
        ]);
    }
}
