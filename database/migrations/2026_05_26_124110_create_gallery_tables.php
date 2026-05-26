<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabel Utama Wadah Album
        Schema::create('galleries', function (Blueprint $table) {
            $table->uuid('gallery_id')->primary();
            $table->string('album_name');
            $table->date('event_date');
            $table->foreignUuid('activity_id')->nullable()->constrained('activities', 'activity_id')->onDelete('set null');
            $table->timestamps();
        });

        // Tabel Anak untuk Menampung Banyak Foto (Multiple Images)
        Schema::create('gallery_images', function (Blueprint $table) {
            $table->uuid('image_id')->primary();
            $table->foreignUuid('gallery_id')->constrained('galleries', 'gallery_id')->onDelete('cascade');
            $table->string('image_url');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gallery_images');
        Schema::dropIfExists('galleries');
    }
};
