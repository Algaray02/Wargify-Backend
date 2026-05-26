<?php

namespace App\Http\Middleware;

use App\Support\SanctumPageToken;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfSanctumPageAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = SanctumPageToken::userFromCookie($request);

        if ($user) {
            Auth::setUser($user);
            $request->setUserResolver(fn () => $user);

            return redirect('/');
        }

        $response = $next($request);

        return $request->cookie('wargify_token')
            ? $response->withoutCookie('wargify_token')
            : $response;
    }
}
