<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids; // Untuk Handle UUID Otomatis
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes; // Sesuai migrasi kita kemarin
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Untuk createToken()

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids, SoftDeletes;

    // Beritahu Laravel bahwa Primary Key kita bukan 'id' tapi 'user_id'
    protected $primaryKey = 'user_id';
    
    // Beritahu Laravel bahwa Primary Key kita string (UUID), bukan auto-increment
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Kolom yang boleh diisi secara massal (Mass Assignment).
     */
    protected $fillable = [
        'family_id',
        'username',
        'password',
        'full_name',
        'phone_number',
        'role',
        'fcm_token',
        'profile_picture_url',
    ];

    /**
     * Kolom yang disembunyikan saat data dikonversi ke JSON (untuk API).
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Konfigurasi casting tipe data.
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}