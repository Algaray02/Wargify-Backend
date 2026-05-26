<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IuranPayment extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'iuran_payments';
    protected $primaryKey = 'payment_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'period_id',
        'family_id',
        'paid_by_user_id',
        'amount_paid',
        'status', // Contoh: 'paid', 'unpaid'
        'paid_at',
    ];

    public function period(): BelongsTo
    {
        return $this->belongsTo(IuranPeriod::class, 'period_id', 'period_id');
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class, 'family_id', 'family_id');
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by_user_id', 'user_id');
    }
}