<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/halo', function (Request $request) {
    return response()->json([
        'status' => 'success',
        'message' => 'Berhasil cok API ne'
    ]);
});
// ->middleware('auth:sanctum')