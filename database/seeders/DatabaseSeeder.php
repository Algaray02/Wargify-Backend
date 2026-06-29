<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\SupabaseStorageService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        app(SupabaseStorageService::class)->clearConfiguredBuckets();

        // User::factory(10)->create();
        $this->call([
            WargifySeeder::class,
            RondaSeeder::class,
        ]);

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
