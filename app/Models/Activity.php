<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Activity extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'activities';
    protected $primaryKey = 'activity_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'type', // 'RAPAT' atau 'KEGIATAN_UMUM'
        'title',
        'description',
        'activity_date',
        'location_name',
        'household_id',
        'attendance_qr_code',
        'status', // 'DRAFT', 'ANNOUNCED', 'COMPLETED'
        'created_by',
    ];

    /**
     * Relasi ke pembuat acara (Ketua RT / Admin).
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class, 'household_id', 'household_id');
    }

    /**
     * Relasi ke warga yang hadir di acara ini (Many-to-Many via Pivot).
     */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'activity_participants', 'activity_id', 'user_id')
                    ->withPivot('participant_id', 'attended_at')
                    ->withTimestamps();
    }

    public function targetGroups(): BelongsToMany
    {
        return $this->belongsToMany(CitizenGroup::class, 'activity_target_groups', 'activity_id', 'group_id')
            ->withPivot('id')
            ->withTimestamps();
    }

    public function invitedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'activity_target_users', 'activity_id', 'user_id')
            ->withPivot('id')
            ->withTimestamps();
    }
}
