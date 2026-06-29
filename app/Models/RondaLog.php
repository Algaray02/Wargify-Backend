<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RondaLog extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ronda_logs';
    protected $primaryKey = 'log_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'schedule_id',
        'session_date',
        'path_data',
        'distance_covered',
        'duration',
    ];

    protected $casts = [
        'path_data' => 'array',
        'session_date' => 'date',
        'distance_covered' => 'float',
        'duration' => 'integer',
    ];

    public function schedule()
    {
        return $this->belongsTo(RondaSchedule::class, 'schedule_id', 'schedule_id');
    }
}
