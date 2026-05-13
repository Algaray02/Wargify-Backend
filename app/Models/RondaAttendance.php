<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RondaAttendance extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'attendance_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'schedule_id',
        'scanned_at',
    ];

    public function schedule()
    {
        return $this->belongsTo(RondaSchedule::class, 'schedule_id', 'schedule_id');
    }

    public  function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
