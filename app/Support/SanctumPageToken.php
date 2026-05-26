<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class SanctumPageToken
{
    public static function userFromCookie(Request $request): ?User
    {
        $plainTextToken = $request->cookie('wargify_token');

        if (! $plainTextToken) {
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($plainTextToken);

        if (! $accessToken || self::isExpired($accessToken)) {
            return null;
        }

        return $accessToken->tokenable instanceof User
            ? $accessToken->tokenable
            : null;
    }

    private static function isExpired(PersonalAccessToken $accessToken): bool
    {
        if ($accessToken->expires_at && $accessToken->expires_at->isPast()) {
            return true;
        }

        $expiration = config('sanctum.expiration');

        return $expiration
            && $accessToken->created_at
            && $accessToken->created_at->lte(now()->subMinutes($expiration));
    }
}
