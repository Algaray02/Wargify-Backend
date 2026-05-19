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
        $users = User::all();

        return response()->json([
            'success' => true,
            'message' => 'User index',
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {
        $user = User::create($request->all());

        $request->validate([
            'family_id' => 'required|exists:families,family_id',
            'username' => 'required|unique:users,username',
            'full_name' => 'required|string',
            'password' => 'required|min:6',
            'role' => 'required|in:KETUA_RT,WARGA',
        ]);

        $user = User::create([
            'user_id' => (string) Str::uuid(), // Generate UUID manual jika HasUuids belum otomatis
            'family_id' => $request->family_id,
            'username' => $request->username,
            'full_name' => $request->full_name,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone_number' => $request->phone_number,
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
            'family_id' => 'exists:families,family_id',
            'username' => 'unique:users,username,' . $user->user_id . ',user_id',
            'full_name' => 'string',
            'phone_number' => 'nullable|string',
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
