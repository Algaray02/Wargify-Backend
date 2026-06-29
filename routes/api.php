<?php

use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\FamilyController;
use App\Http\Controllers\API\V1\RondaController;
use App\Http\Controllers\API\V1\UserController;
use App\Http\Controllers\API\V1\HouseholdController;
use App\Http\Controllers\API\V1\IuranController;
use App\Http\Controllers\API\V1\IuranCategoryController;
use App\Http\Controllers\API\V1\TreasuryController;
use App\Http\Controllers\API\V1\ActivityController;
use App\Http\Controllers\API\V1\AnnouncementController;
use App\Http\Controllers\API\V1\CitizenGroupController;
use App\Http\Controllers\API\V1\FacilityReportController;
use App\Http\Controllers\API\V1\EmergencyAlertController;
use App\Http\Controllers\API\V1\GalleryController;
use App\Http\Controllers\API\V1\PublicStorageController;
use App\Http\Controllers\API\V1\QrScanController;
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
    Route::get('/storage/{bucket}/{path}', [PublicStorageController::class, 'show'])
        ->where('path', '.*')
        ->name('storage.public');

    // Protected Routes (Wajib Login / Bearer Token Sanctum)
    Route::middleware('auth:sanctum')->group(function () {

        // =====================================================
        // 1. MODUL AUTH & PROFIL
        // =====================================================
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::patch('/me', [AuthController::class, 'updateProfile']);
        Route::patch('/me/fcm-token', [AuthController::class, 'updateFcmToken']);
        Route::post('/qr/scan', [QrScanController::class, 'scan']);

        // =====================================================
        // 2. MODUL WARGA (USERS)
        // =====================================================
        Route::middleware('role:SUPERADMIN,KETUA_RT')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::apiResource('citizen-groups', CitizenGroupController::class);
        });

        // =====================================================
        // 3. MODUL KEPALA KELUARGA & RUMAH
        // =====================================================
        Route::middleware('role:SUPERADMIN,KETUA_RT')->group(function () {
            Route::apiResource('households', HouseholdController::class);
            Route::apiResource('families', FamilyController::class);
            Route::post('/families/{id}/members', [FamilyController::class, 'addMember']);
            Route::delete('/families/{id}/members/{userId}', [FamilyController::class, 'removeMember']);
            Route::patch('/families/{id}/head', [FamilyController::class, 'setHeadOfFamily']);
        });

        // =====================================================
        // 4. MODUL KEUANGAN - IURAN
        // =====================================================
        Route::middleware('role:SUPERADMIN,KETUA_RT,BENDAHARA')->group(function () {
            Route::post('/iuran-periods', [IuranController::class, 'storePeriod']);
            Route::get('/iuran-periods', [IuranController::class, 'indexPeriod']);
            Route::apiResource('iuran-categories', IuranCategoryController::class)->except(['show']);
            Route::patch('/iuran-periods/{id}', [IuranController::class, 'updatePeriod']);
            Route::delete('/iuran-periods/{id}', [IuranController::class, 'destroyPeriod']);
            Route::post('/iuran/check-arrears', [IuranController::class, 'checkArrears']);
            Route::post('/iuran/process-payments', [IuranController::class, 'processPayment']);
            Route::get('/iuran-periods/{id}/payments', [IuranController::class, 'periodPayments']);
            Route::post('/iuran-payments', [IuranController::class, 'storePayment']);
            Route::patch('/iuran-payments/{id}', [IuranController::class, 'updatePayment']);
            Route::delete('/iuran-payments/{id}', [IuranController::class, 'destroyPayment']);
        });
        Route::get('/me/iuran', [IuranController::class, 'myHistory']); // Akses Warga

        // =====================================================
        // 5. MODUL KEUANGAN - CATATAN KAS
        // =====================================================
        Route::middleware('role:SUPERADMIN,KETUA_RT,BENDAHARA')->group(function () {
            Route::get('/treasury-logs', [TreasuryController::class, 'index']);
            Route::post('/treasury-logs', [TreasuryController::class, 'store']);
            Route::patch('/treasury-logs/{id}', [TreasuryController::class, 'update']);
            Route::delete('/treasury-logs/{id}', [TreasuryController::class, 'destroy']);
            Route::get('/treasury-summary', [TreasuryController::class, 'summary']);

        });

        Route::get('/treasury-audit-summary', [TreasuryController::class, 'auditSummary']);

        // =====================================================
        // 6. MODUL RONDA
        // =====================================================
        Route::middleware('role:SUPERADMIN,KETUA_RT')->group(function () {
            Route::get('/ronda/groups', [RondaController::class, 'groups']);
            Route::post('/ronda/groups', [RondaController::class, 'storeGroup']);
            Route::patch('/ronda/groups/{id}', [RondaController::class, 'updateGroup']);
            Route::post('/ronda/groups/{id}/members', [RondaController::class, 'addGroupMember']);
            Route::post('/ronda/schedules', [RondaController::class, 'storeSchedule']);
            Route::get('/ronda/history', [RondaController::class, 'history']);
            Route::get('/ronda/history/{id}', [RondaController::class, 'historyShow']);
            Route::post('/ronda/checkpoints', [RondaController::class, 'storeCheckpoint']);
            Route::delete('/ronda/checkpoints/{id}', [RondaController::class, 'destroyCheckpoint']);
            });
            Route::get('/ronda/schedules', [RondaController::class, 'index']);      // Akses Umum
            Route::patch('/ronda/schedules/{id}', [RondaController::class, 'updateSchedule']);
            Route::post('/ronda/schedules/{id}/logs', [RondaController::class, 'storeRondaLog']);
            Route::get('/ronda/checkpoints', [RondaController::class, 'checkpoints']);
            Route::patch('/ronda/checkpoints/{id}', [RondaController::class, 'updateCheckpoint']);
            Route::post('/ronda/attendance', [RondaController::class, 'attendance']); // Akses Umum
            Route::post('/ronda/schedules/{id}/checkpoint-logs', [RondaController::class, 'storeCheckpointLog']);

        // =====================================================
        // 7. MODUL KEGIATAN
        // =====================================================
        Route::get('/activities', [ActivityController::class, 'index']);
        Route::get('/activities/{id}', [ActivityController::class, 'show']);
        Route::post('/activities/{id}/attendance', [ActivityController::class, 'attendance']);
        Route::middleware('role:SUPERADMIN,KETUA_RT')->group(function () {
            Route::post('/activities', [ActivityController::class, 'store']);
            Route::patch('/activities/{id}', [ActivityController::class, 'update']);
            Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);
            Route::post('/activities/{id}/announce', [ActivityController::class, 'announce']);
            Route::post('/activities/{id}/complete', [ActivityController::class, 'complete']);
            Route::get('/activities/{id}/participants', [ActivityController::class, 'participants']);
        });

        // =====================================================
        // 8. MODUL PENGUMUMAN
        // =====================================================
        Route::middleware('role:SUPERADMIN,KETUA_RT')->group(function () {
            Route::post('/announcements', [AnnouncementController::class, 'store']);
            Route::patch('/announcements/{id}', [AnnouncementController::class, 'update']);
            Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
            Route::post('/announcements/{id}/publish', [AnnouncementController::class, 'publish']);
        });
        Route::get('/announcements', [AnnouncementController::class, 'index']); // Akses Umum

        // =====================================================
        // 9. MODUL FASILITAS / LAPORAN WARGA
        // =====================================================
        Route::middleware('role:SUPERADMIN,KETUA_RT')->group(function () {
            Route::patch('/facility-reports/{id}/status', [FacilityReportController::class, 'updateStatus']);
            Route::patch('/facility-reports/{id}/response', [FacilityReportController::class, 'respond']);
            });
        Route::get('/facility-reports', [FacilityReportController::class, 'index']);
        Route::post('/facility-reports', [FacilityReportController::class, 'store']); // Akses Warga

        // =====================================================
        // 10. MODUL SOS (KEADAAN DARURAT)
        // =====================================================
        Route::middleware('role:SUPERADMIN,KETUA_RT')->group(function () {
            Route::post('/emergency-alerts/{id}/resolve', [EmergencyAlertController::class, 'resolve']);
        });
        Route::post('/emergency-alerts', [EmergencyAlertController::class, 'trigger']); // Akses Warga
        Route::get('/emergency-alerts', [EmergencyAlertController::class, 'index']);   // Akses Umum

        // =====================================================
        // 11. MODUL GALLERY / DOKUMENTASI
        // =====================================================
        Route::get('/galleries', [GalleryController::class, 'index']); // Akses Umum
        Route::middleware('role:SUPERADMIN,KETUA_RT')->group(function () {
            Route::post('/galleries', [GalleryController::class, 'store']);
            Route::patch('/galleries/{id}', [GalleryController::class, 'update']);
            Route::delete('/galleries/{id}', [GalleryController::class, 'destroy']);
            Route::post('/galleries/{id}/images', [GalleryController::class, 'uploadImages']);
            Route::delete('/gallery-images/{id}', [GalleryController::class, 'destroyImage']);
        });
        Route::get('/galleries/{id}', [GalleryController::class, 'show']); // Akses Umum
    });
});
