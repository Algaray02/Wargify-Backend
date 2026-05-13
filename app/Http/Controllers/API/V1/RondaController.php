<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\RondaSchedule;
use App\Models\RondaAttendance;
use App\Models\RondaGroup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RondaController extends Controller
{
    // show schedule ronda
    public function index(): JsonResponse
    {
        $schedules = RondaSchedule::with(['group.members', 'coordinator'])
            ->whereDate('schedule_date', now()->toDateString())
            ->get();

        return response()->json([
            'success' => true,
            'data' => $schedules
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
            'name' => 'required|string|unique:ronda_groups,name'
        ]);

        $group = RondaGroup::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Grup ronda berhasil dibuat',
            'data' => $group
        ], 201);
    }
}