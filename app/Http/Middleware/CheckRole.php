<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Jika user belum login atau role-nya tidak ada di dalam daftar yang diizinkan
        if (!$request->user() || !in_array($request->user()->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Peran Anda tidak memiliki izin untuk mengakses modul ini.'
            ], 403);
        }

        return $next($request);
    }
}