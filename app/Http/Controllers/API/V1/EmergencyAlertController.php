<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\EmergencyAlert;
use App\Services\FirebaseCloudMessagingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmergencyAlertController extends Controller
{
    /**
     * Memantau daftar semua riwayat SOS dan tanda bahaya yang masuk.
     * GET /api/v1/emergency-alerts
     */
    public function index(): JsonResponse
    {
        // Mengambil semua alert darurat diurutkan dari yang paling terbaru
        $alerts = EmergencyAlert::with('sender:user_id,full_name,phone_number')
            ->orderByRaw("case when status = 'ACTIVE' then 0 else 1 end")
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar log tanda bahaya darurat berhasil diambil.',
            'data'    => $alerts
        ]);
    }

    /**
     * Warga menekan tombol darurat (Panic Button) dari aplikasi mobile.
     * POST /api/v1/emergency-alerts
     */
    public function trigger(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
            'message'   => 'required|string|max:255',
        ]);

        // Status awal otomatis ACTIVE saat tombol darurat ditekan
        $validated['status'] = 'ACTIVE';
        $validated['sender_id'] = $request->user()->user_id;

        $alert = EmergencyAlert::create($validated);
        $notification = app(FirebaseCloudMessagingService::class)->notifyEmergencyAlert($alert);

        return response()->json([
            'success' => true,
            'message' => 'Sinyal darurat SOS berhasil dikirim! Bantuan akan segera menuju lokasi Anda.',
            'data'    => $alert->load('sender:user_id,full_name,phone_number'),
            'notification' => $notification,
        ], 201);
    }

    /**
     * Pengurus atau warga berwenang mematikan peringatan darurat (Menandai aman).
     * POST /api/v1/emergency-alerts/{id}/resolve
     */
    public function resolve($id): JsonResponse
    {
        $alert = EmergencyAlert::with('sender:user_id,full_name,phone_number')->findOrFail($id);

        if ($alert->status === 'RESOLVED') {
            return response()->json([
                'success' => false,
                'message' => 'Tanda bahaya ini memang sudah berstatus aman (RESOLVED).'
            ], 400);
        }

        $alert->update([
            'status'      => 'RESOLVED',
            'resolved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Peringatan darurat berhasil dinonaktifkan. Keadaan dinyatakan aman.',
            'data'    => $alert->fresh('sender:user_id,full_name,phone_number')
        ]);
    }
}
