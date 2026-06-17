<?php

namespace Tests\Feature;

use App\Models\GalleryImage;
use App\Models\Announcement;
use App\Models\FacilityReport;
use App\Models\TreasuryLog;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PublicStorageTest extends TestCase
{
    public function test_it_proxies_a_public_supabase_file_without_authentication(): void
    {
        config()->set('services.supabase.url', 'http://supabase.internal');
        config()->set('services.supabase.buckets.gallery', 'gallery-images');

        Http::fake([
            'http://supabase.internal/storage/v1/object/public/gallery-images/*' => Http::response(
                'image-bytes',
                200,
                ['Content-Type' => 'image/jpeg']
            ),
        ]);

        $response = $this->get('/api/v1/storage/gallery-images/galleries/album/photo.jpg');

        $response->assertOk()
            ->assertHeader('Content-Type', 'image/jpeg')
            ->assertContent('image-bytes');
    }

    public function test_gallery_image_rewrites_an_old_local_supabase_url(): void
    {
        config()->set('services.supabase.public_url', 'https://wargify.example/api/v1/storage');

        $image = new GalleryImage([
            'image_url' => 'http://127.0.0.1:54321/storage/v1/object/public/gallery-images/galleries/album/photo.jpg',
        ]);

        $this->assertSame(
            'https://wargify.example/api/v1/storage/gallery-images/galleries/album/photo.jpg',
            $image->image_url
        );
    }

    public function test_all_supabase_backed_model_urls_use_the_configured_public_url(): void
    {
        config()->set('services.supabase.public_url', 'https://wargify.example/api/v1/storage');

        $cases = [
            [new User(['profile_picture_url' => $this->localUrl('profile-pictures/profiles/user.jpg')]), 'profile_picture_url', 'profile-pictures/profiles/user.jpg'],
            [new TreasuryLog(['receipt_url' => $this->localUrl('treasury-receipts/receipts/note.jpg')]), 'receipt_url', 'treasury-receipts/receipts/note.jpg'],
            [new Announcement(['banner_url' => $this->localUrl('announcement-banners/announcements/banner.jpg')]), 'banner_url', 'announcement-banners/announcements/banner.jpg'],
            [new FacilityReport(['image_url' => $this->localUrl('facility-reports/reports/damage.jpg')]), 'image_url', 'facility-reports/reports/damage.jpg'],
            [new FacilityReport(['resolved_photo_url' => $this->localUrl('facility-reports/resolved/fixed.jpg')]), 'resolved_photo_url', 'facility-reports/resolved/fixed.jpg'],
        ];

        foreach ($cases as [$model, $attribute, $path]) {
            $this->assertSame(
                "https://wargify.example/api/v1/storage/{$path}",
                $model->{$attribute}
            );
        }
    }

    private function localUrl(string $path): string
    {
        return "http://127.0.0.1:54321/storage/v1/object/public/{$path}";
    }
}
