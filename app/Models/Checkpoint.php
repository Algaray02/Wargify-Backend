<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Testing\Fluent\Concerns\Has;

class Checkpoint extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'checkpoint_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'latitude',
        'longitude',
        'qr_code_data',
        'is_main_pos',
    ];

    // Relasi ke jadwal yang menyertakan checkpoint ini
    public function schedules()
    {
        return $this->belongsToMany(RondaSchedule::class, 'schedule_checkpoints', 'checkpoint_id', 'schedule_id');
    }
}
