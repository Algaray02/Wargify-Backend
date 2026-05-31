<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseCloudMessagingService
{
    private const RECIPIENT_ROLES = ['WARGA', 'KETUA_RT', 'BENDAHARA'];

    public function notifyAnnouncement(Announcement $announcement): array
    {
        return $this->sendToUsers(
            $this->allRecipients(),
            $announcement->title,
            str($announcement->content)->limit(120)->toString(),
            [
                'type' => 'announcement',
                'announcement_id' => $announcement->announcement_id,
            ]
        );
    }

    public function notifyActivity(Activity $activity): array
    {
        return $this->sendToUsers(
            $this->activityRecipients($activity),
            'Kegiatan: ' . $activity->title,
            str($activity->description)->limit(120)->toString(),
            [
                'type' => 'activity',
                'activity_id' => $activity->activity_id,
                'activity_type' => $activity->type,
            ]
        );
    }

    public function activityRecipients(Activity $activity): Collection
    {
        if (
            !$activity->targetGroups()->exists()
            && !$activity->invitedUsers()->exists()
        ) {
            return $this->allRecipients();
        }

        return $this->targetedRecipients(
            $activity->invitedUsers()->select('users.*')->get(),
            $activity->targetGroups()->with('members')->get()->flatMap->members
        );
    }

    public function sendToUsers(iterable $users, string $title, string $body, array $data = []): array
    {
        $tokens = collect($users)
            ->filter(fn (User $user) => filled($user->fcm_token))
            ->unique('user_id')
            ->pluck('fcm_token')
            ->filter()
            ->unique()
            ->values();

        if ($tokens->isEmpty()) {
            return ['sent' => 0, 'failed' => 0, 'skipped' => true, 'reason' => 'Tidak ada FCM token penerima.'];
        }

        $accessToken = $this->accessToken();
        $projectId = config('services.firebase.project_id');

        if (!$accessToken || !$projectId) {
            return ['sent' => 0, 'failed' => 0, 'skipped' => true, 'reason' => 'Konfigurasi Firebase belum lengkap.'];
        }

        $sent = 0;
        $failed = 0;
        $stringData = collect($data)->map(fn ($value) => (string) $value)->all();

        foreach ($tokens as $token) {
            $response = Http::withToken($accessToken)
                ->acceptJson()
                ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", [
                    'message' => [
                        'token' => $token,
                        'notification' => [
                            'title' => $title,
                            'body' => $body,
                        ],
                        'data' => $stringData,
                    ],
                ]);

            if ($response->successful()) {
                $sent++;
            } else {
                $failed++;
                Log::warning('FCM send failed.', [
                    'status' => $response->status(),
                    'body' => $response->json() ?: $response->body(),
                ]);
            }
        }

        return ['sent' => $sent, 'failed' => $failed, 'skipped' => false];
    }

    private function allRecipients(): Collection
    {
        return User::query()
            ->whereIn('role', self::RECIPIENT_ROLES)
            ->whereNotNull('fcm_token')
            ->get();
    }

    private function targetedRecipients(iterable $directUsers, iterable $groupUsers): Collection
    {
        return collect($directUsers)
            ->merge($groupUsers instanceof EloquentCollection ? $groupUsers->all() : $groupUsers)
            ->filter(fn (User $user) => in_array($user->role, self::RECIPIENT_ROLES, true))
            ->unique('user_id')
            ->values();
    }

    private function accessToken(): ?string
    {
        return Cache::remember('firebase_messaging_access_token', now()->addMinutes(50), function () {
            $clientEmail = config('services.firebase.client_email');
            $privateKey = config('services.firebase.private_key');

            if (!$clientEmail || !$privateKey) {
                return null;
            }

            $privateKey = str_replace('\\n', "\n", $privateKey);
            $now = time();
            $jwt = $this->base64UrlEncode(json_encode([
                'alg' => 'RS256',
                'typ' => 'JWT',
            ])) . '.' . $this->base64UrlEncode(json_encode([
                'iss' => $clientEmail,
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud' => 'https://oauth2.googleapis.com/token',
                'iat' => $now,
                'exp' => $now + 3600,
            ]));

            $signed = openssl_sign($jwt, $signature, $privateKey, OPENSSL_ALGO_SHA256);

            if (!$signed) {
                Log::warning('FCM access token signing failed.');
                return null;
            }

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt . '.' . $this->base64UrlEncode($signature),
            ]);

            if ($response->failed()) {
                Log::warning('FCM access token request failed.', [
                    'status' => $response->status(),
                    'body' => $response->json() ?: $response->body(),
                ]);
                return null;
            }

            return $response->json('access_token');
        });
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
