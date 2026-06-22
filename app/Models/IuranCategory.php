<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IuranCategory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'iuran_categories';
    protected $primaryKey = 'category_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'slug',
        'type', // MONTHLY atau INCIDENTAL
        'default_amount', // Tarif dasar standar warga
    ];

    /**
     * Relasi ke seluruh periode bulanan yang menggunakan kategori ini
     */
    public function periods(): HasMany
    {
        return $this->hasMany(IuranPeriod::class, 'category_id', 'category_id');
    }

    /**
     * Relasi ke daftar tarif kustom warga pada kategori ini
     */
    public function customTariffs(): HasMany
    {
        return $this->hasMany(FamilyIuranTariff::class, 'category_id', 'category_id');
    }
}
