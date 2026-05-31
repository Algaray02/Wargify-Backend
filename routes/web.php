<?php

use App\Http\Middleware\EnsureSanctumPageAuthenticated;
use App\Http\Middleware\RedirectIfSanctumPageAuthenticated;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::view('/api/documentation', 'api-docs')->name('api.documentation');

Route::inertia('/login', 'auth/login/page')
    ->middleware(RedirectIfSanctumPageAuthenticated::class)
    ->name('login');

Route::middleware(EnsureSanctumPageAuthenticated::class)->group(function () {
    Route::get('/', function () {
        return Inertia::render('dashboard/page');
    });

    // Warga
    Route::inertia('/warga/per-kepala', 'warga/per-kepala/page');
    Route::inertia('/warga/per-kepala/kelola', 'warga/per-kepala/kelola/page');
    Route::inertia('/warga/per-kepala/anggota', 'warga/per-kepala/anggota/page');
    Route::inertia('/warga/per-kepala/anggota/tambah', 'warga/per-kepala/anggota/tambah/page');

    Route::inertia('/warga/per-warga', 'warga/per-warga/page');
    Route::inertia('/warga/per-warga/create', 'warga/per-warga/create/page');
    Route::inertia('/warga/per-warga/edit', 'warga/per-warga/edit/page');
    Route::inertia('/warga/kelompok', 'warga/kelompok/page');

    // Gallery
    Route::inertia('/gallery', 'gallery/page');
    Route::inertia('/gallery/detail', 'gallery/detail/page');

    // Kegiatan
    Route::inertia('/kegiatan', 'kegiatan/page');
    Route::inertia('/kegiatan/create', 'kegiatan/create/page');
    Route::inertia('/kegiatan/edit', 'kegiatan/edit/page');

    // Keuangan
    Route::inertia('/keuangan/catatan', 'keuangan/catatan/page');
    Route::inertia('/keuangan/iuran', 'keuangan/iuran/page');
    Route::inertia('/keuangan/iuran/create', 'keuangan/iuran/create/page');
    Route::inertia('/keuangan/iuran/edit', 'keuangan/iuran/edit/page');

    // Ronda
    Route::inertia('/ronda/jadwal', 'ronda/jadwal/page');
    Route::inertia('/ronda/jadwal/create', 'ronda/jadwal/create/page');
    Route::inertia('/ronda/jadwal/edit', 'ronda/jadwal/edit/page');
    Route::inertia('/ronda/monitoring', 'ronda/monitoring/page');
    Route::inertia('/ronda/kelompok', 'ronda/kelompok/page');
    Route::inertia('/ronda/riwayat', 'ronda/riwayat/page');
    Route::inertia('/ronda/riwayat/detail', 'ronda/riwayat/detail/page');
    Route::inertia('/ronda/checkpoint', 'ronda/checkpoint/page');

    // Fasilitas
    Route::inertia('/fasilitas', 'fasilitas/page');
    Route::inertia('/fasilitas/detail', 'fasilitas/detail/page');

    // Pengumuman
    Route::inertia('/pengumuman', 'pengumuman/page');
    Route::inertia('/pengumuman/create', 'pengumuman/create/page');

    // SoS Log
    Route::inertia('/sos-log', 'sos-log/page');
});

Route::view('/api/documentation', 'api-docs')->name('api.documentation');
