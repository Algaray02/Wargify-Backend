<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TreasuryLog extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'treasury_logs';
    protected $primaryKey = 'log_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'type', // 'INCOME' atau 'EXPENSE'
        'source', // Asal pemasukan / tujuan pengeluaran
        'amount',
        'description',
        'receipt_url', // Path foto nota/bukti transaksi
        'recorded_by', // ID User (Bendahara) yang menginput
    ];

    /**
     * Relasi ke user yang mencatat transaksi (Bendahara).
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by', 'user_id');
    }
}