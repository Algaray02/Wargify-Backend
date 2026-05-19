<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('family')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'User index',
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'family_id' => 'required|exists:families,family_id',
            'username' => 'required|unique:users,username',
            'full_name' => 'required|string',
            'password' => 'required|min:6',
            'role' => 'required|in:KETUA_RT,BENDAHARA,WARGA',
            'phone_number' => 'nullable|string|unique:users,phone_number',
        ]);

        $user = User::create([
            'user_id' => (string) Str::uuid(), // Generate UUID manual jika HasUuids belum otomatis
            'family_id' => $validated['family_id'],
            'username' => $validated['username'],
            'full_name' => $validated['full_name'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone_number' => $validated['phone_number'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Warga berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    public function show(User $user)
    {
        $user->load('family');

        return response()->json([
            'success' => true,
            'message' => 'User detail',
            'data' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'family_id' => 'exists:families,family_id',
            'username' => 'unique:users,username,' . $user->user_id . ',user_id',
            'full_name' => 'string',
            'phone_number' => 'nullable|string|unique:users,phone_number,' . $user->user_id . ',user_id',
            'role' => 'in:KETUA_RT,BENDAHARA,WARGA',
            'password' => 'nullable|min:6',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        }

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
}
