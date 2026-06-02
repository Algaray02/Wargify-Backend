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
        Schema::create('announcements', function (Blueprint $table) {
            $table->uuid('announcement_id')->primary();
            $table->string('title');
            $table->text('content');
            $table->string('category')->default('HIMBAUAN');
            $table->string('banner_url')->nullable();
            $table->string('status')->default('DRAFT'); // DRAFT, PUBLISHED
            $table->uuid('created_by');
            $table->foreignUuid('activity_id')->nullable()->constrained('activities', 'activity_id')->nullOnDelete();
            $table->timestamps();

            //Asinc to users table
            $table->foreign('created_by')->references('user_id')->on('users')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
