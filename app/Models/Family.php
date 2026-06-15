<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Family extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'family_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'household_id',
        'head_of_family_id',
        'qr_code_data',
    ];

    public function headOfFamily()
    {
        return $this->belongsTo(User::class, 'head_of_family_id', 'user_id');
    }
    
    // Relasi: Satu Keluarga punya banyak Warga (Users)
    public function members()
    {
        return $this->hasMany(User::class, 'family_id', 'family_id');
    }

    // Relasi: Satu Keluarga tinggal di satu Rumah (Household)
    public function household()
    {
        return $this->belongsTo(Household::class, 'household_id', 'household_id');
    }
}
