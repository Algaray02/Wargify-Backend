<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RondaSchedule extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'schedule_id';
    public $incrementing = false;
    protected $keyType = 'string';

    Protected $fillable = [
        'group_id',
        'coordinator_id',
        'schedule_date',
        'shift_start',
        'shift_end',
        'status'
    ];

    public function checkpoints()
    {
        return $this->belongsToMany(Checkpoint::class, 'schedule_checkpoints', 'schedule_id', 'checkpoint_id');
    }

    public function group()
    {
        return $this->belongsTo(RondaGroup::class, 'group_id', 'group_id');
    }

    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_id', 'user_id');
    }

    public function attendances()
    {
        return $this->hasMany(RondaAttendance::class, 'schedule_id', 'schedule_id');
    }
}
