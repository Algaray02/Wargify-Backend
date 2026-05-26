<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gallery extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'galleries';
    protected $primaryKey = 'gallery_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['album_name', 'event_date', 'activity_id'];

    public function images(): HasMany
    {
        return $this->hasMany(GalleryImage::class, 'gallery_id', 'gallery_id');
    }
}
