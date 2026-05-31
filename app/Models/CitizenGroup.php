<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CitizenGroup extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'group_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
    ];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_group_members', 'group_id', 'user_id')
            ->withPivot('id')
            ->withTimestamps();
    }

    public function activities(): BelongsToMany
    {
        return $this->belongsToMany(Activity::class, 'activity_target_groups', 'group_id', 'activity_id')
            ->withPivot('id')
            ->withTimestamps();
    }

}
