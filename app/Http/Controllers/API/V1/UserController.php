<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();

        return response()->json([
            'success' => true,
            'message' => 'User index',
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {    
        $validated = $request->validate([
            'family_id' => 'nullable|exists:families,family_id',
            'username' => 'required|unique:users,username',
            'full_name' => 'required|string',
            'password' => 'required|min:6',
            'role' => 'required|in:KETUA_RT,BENDAHARA,WARGA',
            'phone_number' => 'required|string|unique:users,phone_number',
            'profile_picture' => 'nullable|image|max:4096',
        ]);

        $userId = (string) Str::uuid();
        $profilePictureUrl = $request->hasFile('profile_picture')
            ? $this->uploadProfilePicture($request, $userId)
            : null;

        $user = User::create([
            'user_id' => $userId, // Generate UUID manual jika HasUuids belum otomatis
            'family_id' => $validated['family_id'] ?? null,
            'username' => $validated['username'],
            'full_name' => $validated['full_name'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone_number' => $validated['phone_number'] ?? null,
            'profile_picture_url' => $profilePictureUrl,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Warga berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'message' => 'User detail',
            'data' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'family_id' => 'nullable|exists:families,family_id',
            'username' => 'unique:users,username,' . $user->user_id . ',user_id',
            'full_name' => 'string',
            'phone_number' => 'nullable|string|unique:users,phone_number,' . $user->user_id . ',user_id',
            'role' => 'in:KETUA_RT,BENDAHARA,WARGA',
            'password' => 'nullable|min:6',
            'profile_picture' => 'nullable|image|max:4096',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('profile_picture')) {
            $validated['profile_picture_url'] = $this->uploadProfilePicture($request, $user->user_id);
        }

        unset($validated['profile_picture']);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated',
            'data' => $user
        ]);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted'
        ]);
    }

    private function uploadProfilePicture(Request $request, string $userId): string
    {
        $file = $request->file('profile_picture');
        $supabaseUrl = rtrim((string) config('services.supabase.url'), '/');
        $serviceRoleKey = config('services.supabase.service_role_key');
        $bucket = config('services.supabase.buckets.profile');

        if (!$supabaseUrl || !$serviceRoleKey || !$bucket) {
            abort(500, 'Konfigurasi Supabase Storage belum lengkap.');
        }

        $extension = $file->getClientOriginalExtension() ?: $file->extension();
        $path = 'users/' . $userId . '/' . now()->timestamp . '-' . Str::random(10) . '.' . $extension;
        $uploadUrl = "{$supabaseUrl}/storage/v1/object/{$bucket}/{$path}";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$serviceRoleKey}",
            'apikey' => $serviceRoleKey,
            'Content-Type' => $file->getMimeType(),
            'x-upsert' => 'true',
        ])->withBody(
            file_get_contents($file->getRealPath()),
            $file->getMimeType()
        )->post($uploadUrl);

        if ($response->failed()) {
            abort(500, 'Gagal mengunggah foto profil ke Supabase Storage.');
        }

        return "{$supabaseUrl}/storage/v1/object/public/{$bucket}/{$path}";
    }
}
