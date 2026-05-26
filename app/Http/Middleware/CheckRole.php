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
        $roles = array_values(array_filter($roles, fn ($role) => filled($role)));

        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda belum login.'
            ], 401);
        }

        if (empty($roles)) {
            return $next($request);
        }

        // Jika role user tidak ada di dalam daftar yang diizinkan
        if (!in_array($request->user()->role, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Peran Anda tidak memiliki izin untuk mengakses modul ini.'
            ], 403);
        }

        return $next($request);
    }
}
