<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\Response as HttpResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class PublicStorageController extends Controller
{
    public function show(string $bucket, string $path): Response
    {
        abort_unless($this->isPublicBucket($bucket), 404);

        $supabaseUrl = rtrim((string) config('services.supabase.url'), '/');
        abort_if(blank($supabaseUrl), 503, 'Supabase Storage belum dikonfigurasi.');

        $encodedBucket = rawurlencode($bucket);
        $encodedPath = collect(explode('/', $path))
            ->map(fn (string $segment) => rawurlencode($segment))
            ->implode('/');

        $storageResponse = Http::get(
            "{$supabaseUrl}/storage/v1/object/public/{$encodedBucket}/{$encodedPath}"
        );

        $this->abortForStorageFailure($storageResponse);

        return response($storageResponse->body(), 200, array_filter([
            'Content-Type' => $storageResponse->header('Content-Type'),
            'Content-Length' => $storageResponse->header('Content-Length'),
            'Cache-Control' => 'public, max-age=86400',
            'ETag' => $storageResponse->header('ETag'),
        ]));
    }

    private function isPublicBucket(string $bucket): bool
    {
        return in_array($bucket, array_values(config('services.supabase.buckets', [])), true);
    }

    private function abortForStorageFailure(HttpResponse $response): void
    {
        if ($response->status() === 404) {
            abort(404);
        }

        if ($response->failed()) {
            abort(502, 'Gagal mengambil file dari Supabase Storage.');
        }
    }
}
