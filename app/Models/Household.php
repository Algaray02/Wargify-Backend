<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Household extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'household_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'block_number',
        'house_number',
        'qr_code_data',
    ];

    // Relasi: Satu Rumah bisa ditempati satu atau lebih Keluarga (umumnya satu)
    public function families()
    {
        return $this->hasMany(Family::class, 'household_id', 'household_id');
    }
}
