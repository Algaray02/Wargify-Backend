<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string', // Pakai username sesuai skema
                'password' => 'required|string',
            ]);

            // Cari user secara manual karena kita pakai custom username & UUID
            $user = User::where('username', $request->username)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username atau password salah.',
                ], 401);
            }

            // Hapus token lama (opsional: agar 1 akun 1 device)
            $user->tokens()->delete();
            
            // Create token via Sanctum
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'user_id' => $user->user_id, // Gunakan user_id (UUID)
                        'full_name' => $user->full_name,
                        'username' => $user->username,
                        'role' => $user->role,
                    ],
                    'token' => $token,
                ],
            ])->cookie(
                'wargify_token',
                $token,
                0,
                null,
                null,
                $request->isSecure(),
                true,
                false,
                'lax'
            );
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            // Hapus token saat ini
            if ($request->user()) {
                $request->user()->currentAccessToken()->delete();
            } elseif ($request->cookie('wargify_token')) {
                PersonalAccessToken::findToken($request->cookie('wargify_token'))?->delete();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Logged out'
            ])->withoutCookie('wargify_token');
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal logout'
            ], 500)->withoutCookie('wargify_token');
        }
    }

    public function me(Request $request)
    {
        $user = $request->user()?->load('family.household');

        return response()->json([
            'success' => true,
            'message' => 'User aktif',
            'data' => $user,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'phone_number' => 'sometimes|required|string|max:30|unique:users,phone_number,' . $user->user_id . ',user_id',
            'profile_picture_url' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data' => $user->fresh()->load('family.household'),
        ]);
    }

    public function updateFcmToken(Request $request)
    {
        $validated = $request->validate([
            'fcm_token' => 'required|string',
        ]);

        $request->user()->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'FCM token berhasil diperbarui',
        ]);
    }
}
