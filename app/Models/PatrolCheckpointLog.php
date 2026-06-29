<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatrolCheckpointLog extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'patrol_checkpoint_logs';
    protected $primaryKey = 'log_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'schedule_id',
        'session_date',
        'checkpoint_id',
        'scanned_by',
        'scanned_at',
    ];

    public function schedule()
    {
        return $this->belongsTo(RondaSchedule::class, 'schedule_id', 'schedule_id');
    }

    public function checkpoint()
    {
        return $this->belongsTo(Checkpoint::class, 'checkpoint_id', 'checkpoint_id');
    }

    public function scanner()
    {
        return $this->belongsTo(User::class, 'scanned_by', 'user_id');
    }
}
