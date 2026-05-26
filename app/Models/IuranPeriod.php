<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IuranPeriod extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'iuran_periods';
    protected $primaryKey = 'period_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'period_name',
        'month',
        'year',
        'amount_per_family',
        'payment_qr_code',
    ];

    /**
     * Relasi ke daftar pembayaran tagihan per keluarga di periode ini.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(IuranPayment::class, 'period_id', 'period_id');
    }
}