<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacilityReport extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'facility_reports';
    protected $primaryKey = 'report_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'reporter_id',
        'title',
        'category',
        'description',
        'image_url',
        'status', // 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED'
        'response_message',
        'resolved_photo_url',
    ];

    /**
     * Relasi ke warga yang membuat laporan.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id', 'user_id');
    }
}
