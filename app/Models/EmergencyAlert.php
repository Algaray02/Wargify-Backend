<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
Use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmergencyAlert extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'emergency_alerts';
    protected $primaryKey = 'alert_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'sender_id',
        'latitude',
        'longitude',
        'message',
        'status', // 'ACTIVE', 'RESOLVED'
        'resolved_at',
    ];

    /**
     * Relasi ke warga yang menekan tombol SOS panic button.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id', 'user_id');
    }
}
