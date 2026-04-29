<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // A. MANAJEMEN PENGGUNA, RUMAH & KELUARGA
        Schema::create('households', function (Blueprint $table) {
            $table->uuid('household_id')->primary();
            $table->string('block_number');
            $table->string('house_number');
            $table->text('qr_code_data', 255)->unique();
            $table->timestamps();
        });

        Schema::create('families', function (Blueprint $table) {
            $table->uuid('family_id')->primary();
            $table->foreignUuid('household_id')->constrained('households', 'household_id');
            $table->uuid('head_of_family_id')->nullable(); // Nanti diisi user_id kepala keluarga
            $table->text('qr_code_data', 255)->unique();
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('user_id')->primary();
            $table->foreignUuid('family_id')->nullable()->constrained('families', 'family_id');
            $table->string('username')->unique();
            $table->string('password');
            $table->string('full_name');
            $table->string('phone_number')->unique();
            $table->enum('role', ['SUPERADMIN', 'KETUA_RT', 'BENDAHARA', 'WARGA'])->default('WARGA');
            $table->text('fcm_token')->nullable();
            $table->string('profile_picture_url')->nullable();
            $table->softDeletes(); // Keamanan data warga
            $table->timestamps();
        });

        // B. KEUANGAN (IURAN)
        Schema::create('iuran_periods', function (Blueprint $table) {
            $table->uuid('period_id')->primary();
            $table->string('period_name');
            $table->integer('month');
            $table->integer('year');
            $table->decimal('amount_per_family', 15, 2);
            $table->text('payment_qr_code', 255)->unique();
            $table->timestamps();
        });

        Schema::create('iuran_payments', function (Blueprint $table) {
            $table->uuid('payment_id')->primary();
            $table->foreignUuid('period_id')->constrained('iuran_periods', 'period_id');
            $table->foreignUuid('family_id')->constrained('families', 'family_id');
            $table->foreignUuid('paid_by_user_id')->constrained('users', 'user_id');
            $table->decimal('amount_paid', 15, 2);
            $table->timestamp('paid_at');
            $table->timestamps();
        });

        Schema::create('treasury_logs', function (Blueprint $table) {
            $table->uuid('log_id')->primary();
            $table->enum('type', ['INCOME', 'EXPENSE']);
            $table->enum('source', ['IURAN_WARGA', 'DONASI_SPONSOR', 'DANA_DESA_PEMERINTAH', 'PENGELUARAN_RUTIN', 'PENGELUARAN_DARURAT', 'LAINNYA']);
            $table->decimal('amount', 15, 2);
            $table->text('description');
            $table->string('receipt_url')->nullable();
            $table->foreignUuid('recorded_by')->constrained('users', 'user_id');
            $table->softDeletes();
            $table->timestamps();
        });

        // C. KEAMANAN & RONDA
        Schema::create('checkpoints', function (Blueprint $table) {
            $table->uuid('checkpoint_id')->primary();
            $table->string('name');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->text('qr_code_data', 255)->unique();
            $table->boolean('is_main_pos')->default(false);
            $table->timestamps();
        });

        Schema::create('ronda_groups', function (Blueprint $table) {
            $table->uuid('group_id')->primary();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('ronda_group_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('group_id')->constrained('ronda_groups', 'group_id');
            $table->foreignUuid('user_id')->constrained('users', 'user_id');
            $table->timestamps();
        });

        Schema::create('ronda_schedules', function (Blueprint $table) {
            $table->uuid('schedule_id')->primary();
            $table->foreignUuid('group_id')->constrained('ronda_groups', 'group_id');
            $table->foreignUuid('coordinator_id')->constrained('users', 'user_id');
            $table->date('schedule_date');
            $table->timestamp('shift_start')->nullable();
            $table->timestamp('shift_end')->nullable();
            $table->enum('status', ['SCHEDULED', 'ONGOING', 'COMPLETED', 'MISSED'])->default('SCHEDULED');
            $table->timestamps();
        });

        Schema::create('schedule_checkpoints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('checkpoint_id')->constrained('checkpoints', 'checkpoint_id');
            $table->foreignUuid('schedule_id')->constrained('ronda_schedules', 'schedule_id');
            $table->timestamps();
        });

        Schema::create('ronda_attendances', function (Blueprint $table) {
            $table->uuid('attendance_id')->primary();
            $table->foreignUuid('schedule_id')->constrained('ronda_schedules', 'schedule_id');
            $table->foreignUuid('user_id')->constrained('users', 'user_id');
            $table->timestamp('scanned_at');
            $table->timestamps();
        });

        // D. KEGIATAN & PENGUMUMAN
        Schema::create('activities', function (Blueprint $table) {
            $table->uuid('activity_id')->primary();
            $table->enum('type', ['RAPAT', 'KEGIATAN_UMUM']);
            $table->string('title');
            $table->text('description');
            $table->timestamp('activity_date');
            $table->string('location_name');
            $table->text('attendance_qr_code', 255)->unique()->nullable();
            $table->enum('status', ['DRAFT', 'ANNOUNCED', 'COMPLETED'])->default('DRAFT');
            $table->foreignUuid('created_by')->constrained('users', 'user_id');
            $table->timestamps();
        });

        Schema::create('activity_participants', function (Blueprint $table) {
            $table->uuid('participant_id')->primary();
            $table->foreignUuid('activity_id')->constrained('activities', 'activity_id');
            $table->foreignUuid('user_id')->constrained('users', 'user_id');
            $table->timestamp('attended_at')->nullable();
            $table->timestamps();
        });

        // E. SOS & LAPORAN
        Schema::create('emergency_alerts', function (Blueprint $table) {
            $table->uuid('alert_id')->primary();
            $table->foreignUuid('sender_id')->constrained('users', 'user_id');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->text('message');
            $table->enum('status', ['ACTIVE', 'RESOLVED'])->default('ACTIVE');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('facility_reports', function (Blueprint $table) {
            $table->uuid('report_id')->primary();
            $table->foreignUuid('reporter_id')->constrained('users', 'user_id');
            $table->string('title');
            $table->string('category');
            $table->text('description');
            $table->string('image_url')->nullable();
            $table->enum('status', ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'])->default('SUBMITTED');
            $table->text('response_message')->nullable();
            $table->string('resolved_photo_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        // Drop dengan urutan terbalik untuk menghindari error relasi
        Schema::dropIfExists('facility_reports');
        Schema::dropIfExists('emergency_alerts');
        Schema::dropIfExists('activity_participants');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('ronda_attendances');
        Schema::dropIfExists('schedule_checkpoints');
        Schema::dropIfExists('ronda_schedules');
        Schema::dropIfExists('ronda_group_members');
        Schema::dropIfExists('ronda_groups');
        Schema::dropIfExists('checkpoints');
        Schema::dropIfExists('treasury_logs');
        Schema::dropIfExists('iuran_payments');
        Schema::dropIfExists('iuran_periods');
        Schema::dropIfExists('users');
        Schema::dropIfExists('families');
        Schema::dropIfExists('households');
    }
};