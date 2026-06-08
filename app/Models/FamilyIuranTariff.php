<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FamilyIuranTariff extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'family_iuran_tariffs';
    protected $primaryKey = 'tariff_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'family_id',
        'category_id',
        'amount', // Nominal kustom khusus keluarga ini
    ];

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class, 'family_id', 'family_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(IuranCategory::class, 'category_id', 'category_id');
    }
}
