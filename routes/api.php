<?php

use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\FamilyController;
use App\Http\Controllers\API\V1\RondaController;
use App\Http\Controllers\API\V1\UserController;
use App\Http\Controllers\API\V1\HouseholdController;
use App\Http\Controllers\API\V1\IuranController;
use App\Http\Controllers\API\V1\TreasuryController;
use App\Http\Controllers\API\V1\ActivityController;
use App\Http\Controllers\API\V1\AnnouncementController;
use App\Http\Controllers\API\V1\FacilityReportController;
use App\Http\Controllers\API\V1\EmergencyAlertController;
use App\Http\Controllers\API\V1\GalleryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/documentation/openapi.json', function () {
    return response()->file(public_path('docs/openapi.json'), [
        'Content-Type' => 'application/json',
    ]);
})->name('api.documentation.openapi');

// Public Routes (Bisa diakses tanpa login)
Route::prefix('v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    // Protected Routes (Wajib Login / Bearer Token Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        
        // =====================================================
        // 1. MODUL AUTH & PROFIL
        // =====================================================
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::patch('/me', [AuthController::class, 'updateProfile']);
        Route::patch('/me/fcm-token', [AuthController::class, 'updateFcmToken']);

        // =====================================================
        // 2. MODUL WARGA (USERS)
        // =====================================================
        Route::middleware('role:')->group(function () {
            Route::apiResource('users', UserController::class);
        });

        // =====================================================
        // 3. MODUL KEPALA KELUARGA & RUMAH
        // =====================================================
        Route::middleware('role:')->group(function () {
            Route::apiResource('households', HouseholdController::class);
            Route::apiResource('families', FamilyController::class);
            Route::post('/families/{id}/members', [FamilyController::class, 'addMember']);
            Route::delete('/families/{id}/members/{userId}', [FamilyController::class, 'removeMember']);
            Route::patch('/families/{id}/head', [FamilyController::class, 'setHeadOfFamily']);
        });

        // =====================================================
        // 4. MODUL KEUANGAN - IURAN
        // =====================================================
        Route::middleware('role:')->group(function () {
            Route::post('/iuran-periods', [IuranController::class, 'storePeriod']);
            Route::get('/iuran-periods', [IuranController::class, 'indexPeriod']);
            Route::get('/iuran-periods/{id}/payments', [IuranController::class, 'periodPayments']);
            Route::post('/iuran-payments', [IuranController::class, 'storePayment']);
            Route::patch('/iuran-payments/{id}', [IuranController::class, 'updatePayment']);
            Route::delete('/iuran-payments/{id}', [IuranController::class, 'destroyPayment']);
        });
        Route::get('/me/iuran', [IuranController::class, 'myHistory']); // Akses Warga

        // =====================================================
        // 5. MODUL KEUANGAN - CATATAN KAS
        // =====================================================
        Route::middleware('role:')->group(function () {
            Route::get('/treasury-logs', [TreasuryController::class, 'index']);
            Route::post('/treasury-logs', [TreasuryController::class, 'store']);
            Route::patch('/treasury-logs/{id}', [TreasuryController::class, 'update']);
            Route::delete('/treasury-logs/{id}', [TreasuryController::class, 'destroy']);
            Route::get('/treasury-summary', [TreasuryController::class, 'summary']);
        });

        // =====================================================
        // 6. MODUL RONDA
        // =====================================================
        Route::middleware('role:')->group(function () {
            Route::post('/ronda/groups', [RondaController::class, 'storeGroup']);
            Route::post('/ronda/groups/{id}/members', [RondaController::class, 'addGroupMember']);
            Route::post('/ronda/schedules', [RondaController::class, 'storeSchedule']);
            Route::post('/ronda/checkpoints', [RondaController::class, 'storeCheckpoint']);
        });
        Route::get('/ronda/schedules', [RondaController::class, 'index']);      // Akses Umum
        Route::post('/ronda/attendance', [RondaController::class, 'attendance']); // Akses Umum

        // =====================================================
        // 7. MODUL KEGIATAN
        // =====================================================
        Route::middleware('role:')->group(function () {
            Route::post('/activities', [ActivityController::class, 'store']);
            Route::post('/activities/{id}/announce', [ActivityController::class, 'announce']);
            Route::post('/activities/{id}/complete', [ActivityController::class, 'complete']);
            Route::post('/activities/{id}/attendance', [ActivityController::class, 'attendance']);
            Route::get('/activities/{id}/participants', [ActivityController::class, 'participants']);
        });

        // =====================================================
        // 8. MODUL PENGUMUMAN
        // =====================================================
        Route::middleware('role:')->group(function () {
            Route::post('/announcements', [AnnouncementController::class, 'store']);
            Route::post('/announcements/{id}/publish', [AnnouncementController::class, 'publish']);
        });
        Route::get('/announcements', [AnnouncementController::class, 'index']); // Akses Umum

        // =====================================================
        // 9. MODUL FASILITAS / LAPORAN WARGA
        // =====================================================
        Route::middleware('role:')->group(function () {
            Route::get('/facility-reports', [FacilityReportController::class, 'index']);
            Route::patch('/facility-reports/{id}/status', [FacilityReportController::class, 'updateStatus']);
            Route::patch('/facility-reports/{id}/response', [FacilityReportController::class, 'respond']);
        });
        Route::post('/facility-reports', [FacilityReportController::class, 'store']); // Akses Warga

        // =====================================================
        // 10. MODUL SOS (KEADAAN DARURAT)
        // =====================================================
        Route::middleware('role:')->group(function () {
            Route::post('/emergency-alerts/{id}/resolve', [EmergencyAlertController::class, 'resolve']);
        });
        Route::post('/emergency-alerts', [EmergencyAlertController::class, 'trigger']); // Akses Warga
        Route::get('/emergency-alerts', [EmergencyAlertController::class, 'index']);   // Akses Umum

        // =====================================================
        // 11. MODUL GALLERY / DOKUMENTASI
        // =====================================================
        Route::middleware('role:')->group(function () {
            Route::post('/galleries', [GalleryController::class, 'store']);
            Route::post('/galleries/{id}/images', [GalleryController::class, 'uploadImages']);
            Route::delete('/gallery-images/{id}', [GalleryController::class, 'destroyImage']);
        });
        Route::get('/galleries/{id}', [GalleryController::class, 'show']); // Akses Umum
    });
});