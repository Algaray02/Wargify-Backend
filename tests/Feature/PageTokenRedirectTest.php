<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class PageTokenRedirectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('The pdo_sqlite extension is required for token redirect feature tests.');
        }

        parent::setUp();
    }

    public function test_login_page_redirects_to_dashboard_when_cookie_token_is_valid(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('api-token', ['*'], now()->addDay())->plainTextToken;

        $response = $this->withCookie('wargify_token', $token)->get('/login');

        $response->assertRedirect('/');
    }

    public function test_protected_page_redirects_to_login_when_cookie_token_is_expired(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('api-token', ['*'], now()->subMinute())->plainTextToken;

        $response = $this->withCookie('wargify_token', $token)->get('/');

        $response->assertRedirect('/login');
        $response->assertCookieExpired('wargify_token');
    }

    public function test_protected_page_redirects_to_login_when_cookie_token_was_replaced(): void
    {
        $user = $this->createUser();
        $oldToken = $user->createToken('api-token', ['*'], now()->addDay())->plainTextToken;

        $user->tokens()->delete();
        $user->createToken('api-token', ['*'], now()->addDay());

        $response = $this->withCookie('wargify_token', $oldToken)->get('/');

        $response->assertRedirect('/login');
        $response->assertCookieExpired('wargify_token');
    }

    public function test_login_creates_non_expiring_token_and_replaces_existing_tokens(): void
    {
        $user = $this->createUser();
        $oldToken = $user->createToken('api-token')->plainTextToken;

        $response = $this->postJson('/api/v1/login', [
            'username' => 'superadmin',
            'password' => 'password123',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => (int) Str::before($oldToken, '|'),
        ]);
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->user_id,
            'expires_at' => null,
        ]);
    }

    private function createUser(): User
    {
        $householdId = (string) Str::uuid();
        $familyId = (string) Str::uuid();
        $userId = (string) Str::uuid();

        DB::table('households')->insert([
            'household_id' => $householdId,
            'block_number' => 'A',
            'house_number' => '1',
            'qr_code_data' => 'QR-HOUSE-A-1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('families')->insert([
            'family_id' => $familyId,
            'household_id' => $householdId,
            'head_of_family_id' => $userId,
            'qr_code_data' => 'QR-FAM-A-1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return User::create([
            'user_id' => $userId,
            'family_id' => $familyId,
            'username' => 'superadmin',
            'password' => Hash::make('password123'),
            'full_name' => 'Admin Sistem',
            'phone_number' => '08999999999',
            'role' => 'SUPERADMIN',
        ]);
    }
}
