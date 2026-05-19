<?php

use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\FamilyController;
use App\Http\Controllers\API\V1\RondaController;
use App\Http\Controllers\API\V1\UserController;
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
    
    // Protected Routes (Harus pakai Token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Contoh Route untuk cek data user yang sedang login
        Route::get('/me', function (Request $request) {
            return response()->json([
                'success' => true,
                'data' => $request->user()
            ]);
        });

        // Get all Users
        Route::apiResource('users', UserController::class);

        // Tambahkan route untuk resource lainnya seperti Family, Household, dll
        Route::apiResource('families', FamilyController::class);

        // Ronda Route
        Route::get('/ronda/schedules', [RondaController::class, 'index']);
        Route::post('/ronda/attendance', [RondaController::class, 'attendance']);
        Route::post('/ronda/groups', [RondaController::class, 'storeGroup']);
    });
});
