<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryImage extends Model
{
    use HasUuids;

    protected $table = 'gallery_images';
    protected $primaryKey = 'image_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['gallery_id', 'image_url'];

    public function gallery(): BelongsTo
    {
        return $this->belongsTo(Gallery::class, 'gallery_id', 'gallery_id');
    }
}
