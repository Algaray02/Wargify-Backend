<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureSanctumPageAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        $plainTextToken = $request->cookie('wargify_token');

        if (! $plainTextToken) {
            return redirect()->route('login');
        }

        $accessToken = PersonalAccessToken::findToken($plainTextToken);
        $user = $accessToken?->tokenable;

        if (! $user) {
            return redirect()
                ->route('login')
                ->withoutCookie('wargify_token');
        }

        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
