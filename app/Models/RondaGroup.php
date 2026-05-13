<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RondaGroup extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'group_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
    ];

    public function members()
    {
        return $this->belongsToMany(User::class, 'ronda_group_members', 'group_id', 'user_id');
    }

    public function schedules()
    {
        return $this->hasMany(RondaSchedule::class, 'group_id', 'group_id');
    }
}
