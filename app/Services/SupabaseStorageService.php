<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupabaseStorageService
{
    public function deletePublicUrl(?string $publicUrl): void
    {
        if (blank($publicUrl)) {
            return;
        }

        $object = $this->extractObjectPath($publicUrl);

        if (!$object) {
            return;
        }

        $supabaseUrl = rtrim((string) config('services.supabase.url'), '/');
        $serviceRoleKey = config('services.supabase.service_role_key');

        if (!$supabaseUrl || !$serviceRoleKey) {
            Log::warning('Supabase delete skipped because storage config is incomplete.', [
                'url' => $publicUrl,
            ]);

            return;
        }

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$serviceRoleKey}",
            'apikey' => $serviceRoleKey,
        ])->delete("{$supabaseUrl}/storage/v1/object/{$object['bucket']}/{$object['path']}");

        if ($response->failed() && $response->status() !== 404) {
            Log::warning('Failed deleting Supabase storage object.', [
                'bucket' => $object['bucket'],
                'path' => $object['path'],
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }
    }

    public function deletePublicUrls(iterable $publicUrls): void
    {
        foreach ($publicUrls as $publicUrl) {
            $this->deletePublicUrl($publicUrl);
        }
    }

    private function extractObjectPath(string $publicUrl): ?array
    {
        $path = parse_url($publicUrl, PHP_URL_PATH);

        if (!$path) {
            return null;
        }

        $prefix = '/storage/v1/object/public/';

        if (!str_starts_with($path, $prefix)) {
            return null;
        }

        $relativePath = substr($path, strlen($prefix));
        $segments = explode('/', $relativePath, 2);

        if (count($segments) !== 2 || blank($segments[0]) || blank($segments[1])) {
            return null;
        }

        return [
            'bucket' => rawurlencode(rawurldecode($segments[0])),
            'path' => collect(explode('/', rawurldecode($segments[1])))
                ->map(fn (string $segment) => rawurlencode($segment))
                ->implode('/'),
        ];
    }
}
