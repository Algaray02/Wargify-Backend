<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('activities')
            ->where('type', 'RAPAT')
            ->orderBy('activity_id')
            ->each(function (object $activity): void {
                DB::table('activities')
                    ->where('activity_id', $activity->activity_id)
                    ->update([
                        'attendance_qr_code' => 'QR-ACT-'.Str::uuid(),
                    ]);
            });

        Schema::table('activities', function (Blueprint $table): void {
            $table->unique('attendance_qr_code', 'activities_attendance_qr_code_unique');
        });
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table): void {
            $table->dropUnique('activities_attendance_qr_code_unique');
        });
    }
};
