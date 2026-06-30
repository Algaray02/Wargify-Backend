<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class WargifySeeder extends Seeder
{
    public function run(): void
    {
        // 0. CLEAR DATA LAMA
        DB::statement('TRUNCATE TABLE emergency_alerts CASCADE');
        DB::statement('TRUNCATE TABLE facility_reports CASCADE');
        DB::statement('TRUNCATE TABLE announcements CASCADE');
        DB::statement('TRUNCATE TABLE gallery_images CASCADE');
        DB::statement('TRUNCATE TABLE galleries CASCADE');
        DB::statement('TRUNCATE TABLE activity_target_users CASCADE');
        DB::statement('TRUNCATE TABLE activity_target_groups CASCADE');
        DB::statement('TRUNCATE TABLE activity_participants CASCADE');
        DB::statement('TRUNCATE TABLE activities CASCADE');
        DB::statement('TRUNCATE TABLE treasury_logs CASCADE');
        DB::statement('TRUNCATE TABLE iuran_payments CASCADE');
        DB::statement('TRUNCATE TABLE family_iuran_tariffs CASCADE'); 
        DB::statement('TRUNCATE TABLE iuran_periods CASCADE');
        DB::statement('TRUNCATE TABLE iuran_categories CASCADE'); 
        DB::statement('TRUNCATE TABLE ronda_logs CASCADE');
        DB::statement('TRUNCATE TABLE patrol_checkpoint_logs CASCADE');
        DB::statement('TRUNCATE TABLE ronda_attendances CASCADE');
        DB::statement('TRUNCATE TABLE schedule_checkpoints CASCADE');
        DB::statement('TRUNCATE TABLE ronda_schedules CASCADE');
        DB::statement('TRUNCATE TABLE ronda_group_members CASCADE');
        DB::statement('TRUNCATE TABLE ronda_groups CASCADE');
        DB::statement('TRUNCATE TABLE checkpoints CASCADE');
        DB::statement('TRUNCATE TABLE user_group_members CASCADE');
        DB::statement('TRUNCATE TABLE citizen_groups CASCADE');
        DB::table('users')->delete(); // Gunakan delete biasa jika softDeletes aktif di users agar truncate tidak error relasi
        DB::statement('TRUNCATE TABLE families CASCADE');
        DB::statement('TRUNCATE TABLE households CASCADE');

        // 1. DATA SUPERADMIN
        $superadminFamily = Str::uuid();
        $superadminHousehold = Str::uuid();

        DB::table('households')->insert([
            'household_id' => $superadminHousehold,
            'block_number' => 'ADM',
            'house_number' => '1',
            'qr_code_data' => 'QR-HOUSE-ADM-1',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('families')->insert([
            'family_id' => $superadminFamily,
            'household_id' => $superadminHousehold,
            'qr_code_data' => 'QR-FAM-ADM-1',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $superadminId = Str::uuid();
        DB::table('users')->insert([
            'user_id' => $superadminId,
            'family_id' => $superadminFamily,
            'username' => 'superadmin',
            'password' => Hash::make('admin123'),
            'full_name' => 'Admin Sistem',
            'phone_number' => '08999999999',
            'role' => 'SUPERADMIN',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        // 2. KETUA RT & BENDAHARA
        $ketuaRTId = Str::uuid();
        DB::table('users')->insert([
            'user_id' => $ketuaRTId,
            'family_id' => null,
            'username' => 'vian_rt',
            'password' => Hash::make('password123'),
            'full_name' => 'Vian Maulana Ramadhan',
            'phone_number' => '08123456789',
            'role' => 'KETUA_RT',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $bendaharaId = Str::uuid();
        DB::table('users')->insert([
            'user_id' => $bendaharaId,
            'family_id' => null,
            'username' => 'abi_bendahara',
            'password' => Hash::make('password123'),
            'full_name' => 'Abimanyu',
            'phone_number' => '08234567890',
            'role' => 'BENDAHARA',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        // 3. DATA WARGA
        $wargaFamilyIds = [];
        $wargaIds = [];
        $wargaData = [
            ['nama' => 'Rizky Warga', 'username' => 'rizky_warga', 'telepon' => '08111111111', 'blok' => 'A', 'nomor' => '3'],
            ['nama' => 'Siti Nurhaliza', 'username' => 'siti', 'telepon' => '08112222222', 'blok' => 'A', 'nomor' => '4'],
            ['nama' => 'Rahmat Hidayat', 'username' => 'rahmat', 'telepon' => '08113333333', 'blok' => 'B', 'nomor' => '1'],
            ['nama' => 'Dewi Lestari', 'username' => 'dewi', 'telepon' => '08114444444', 'blok' => 'B', 'nomor' => '2'],
            ['nama' => 'Agus Santoso', 'username' => 'agus', 'telepon' => '08115555555', 'blok' => 'C', 'nomor' => '1'],
        ];

        foreach ($wargaData as $warga) {
            $hId = Str::uuid(); $fId = Str::uuid(); $uId = Str::uuid();
            DB::table('households')->insert([
                'household_id' => $hId, 'block_number' => $warga['blok'], 'house_number' => $warga['nomor'],
                'qr_code_data' => 'QR-HOUSE-'.$warga['blok'].'-'.$warga['nomor'],
                'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('families')->insert([
                'family_id' => $fId, 'household_id' => $hId, 'head_of_family_id' => $uId,
                'qr_code_data' => 'QR-FAM-'.$warga['blok'].'-'.$warga['nomor'],
                'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('users')->insert([
                'user_id' => $uId, 'family_id' => $fId, 'username' => $warga['username'],
                'password' => Hash::make('password123'), 'full_name' => $warga['nama'],
                'phone_number' => $warga['telepon'], 'role' => 'WARGA',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $wargaIds[] = $uId;
            $wargaFamilyIds[] = $fId;
        }

        // 4. KELOMPOK WARGA
        $bapakGroupId = Str::uuid();
        $ibuGroupId = Str::uuid();
        $pemudaGroupId = Str::uuid();

        DB::table('citizen_groups')->insert([
            ['group_id' => $bapakGroupId, 'name' => 'Bapak-Bapak', 'created_at' => now(), 'updated_at' => now()],
            ['group_id' => $ibuGroupId, 'name' => 'Ibu-Ibu PKK', 'created_at' => now(), 'updated_at' => now()],
            ['group_id' => $pemudaGroupId, 'name' => 'Pemuda', 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('user_group_members')->insert([
            ['id' => Str::uuid(), 'group_id' => $bapakGroupId, 'user_id' => $wargaIds[0], 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid(), 'group_id' => $ibuGroupId, 'user_id' => $wargaIds[1], 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid(), 'group_id' => $pemudaGroupId, 'user_id' => $wargaIds[2], 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid(), 'group_id' => $ibuGroupId, 'user_id' => $wargaIds[3], 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid(), 'group_id' => $pemudaGroupId, 'user_id' => $wargaIds[4], 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 5. IURAN CATEGORIES, PERIODS, TARIFFS & PAYMENTS (REVISI DOSEN)
        $catArisanId = Str::uuid();
        $catSosialId = Str::uuid();
        $catLainnyaId = Str::uuid();
        $catKebersihanId = Str::uuid();
        $catKeamananId = Str::uuid();

        DB::table('iuran_categories')->insert([
            ['category_id' => $catArisanId, 'name' => 'Uang Kas Arisan', 'slug' => 'arisan', 'type' => 'MONTHLY', 'default_amount' => 20000.00, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $catSosialId, 'name' => 'Sosial', 'slug' => 'sosial', 'type' => 'MONTHLY', 'default_amount' => 10000.00, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $catLainnyaId, 'name' => 'Lainnya', 'slug' => 'lainnya', 'type' => 'MONTHLY', 'default_amount' => 5000.00, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $catKebersihanId, 'name' => 'Kebersihan', 'slug' => 'kebersihan', 'type' => 'MONTHLY', 'default_amount' => 15000.00, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $catKeamananId, 'name' => 'Keamanan', 'slug' => 'keamanan', 'type' => 'MONTHLY', 'default_amount' => 15000.00, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $periodJuniKeamanan = Str::uuid();
        $periodJuniKebersihan = Str::uuid();
        
        DB::table('iuran_periods')->insert([
            [
                'period_id' => $periodJuniKeamanan, 'category_id' => $catKeamananId, 'period_name' => 'Keamanan Juni 2026', 'month' => 6, 'year' => 2026, 'payment_qr_code' => 'QR-PAY-JUNI-KEAMANAN', 'created_at' => now(), 'updated_at' => now()
            ],
            [
                'period_id' => $periodJuniKebersihan, 'category_id' => $catKebersihanId, 'period_name' => 'Kebersihan Juni 2026', 'month' => 6, 'year' => 2026, 'payment_qr_code' => 'QR-PAY-JUNI-KEBERSIHAN', 'created_at' => now(), 'updated_at' => now()
            ]
        ]);

        DB::table('family_iuran_tariffs')->insert([
            'tariff_id' => Str::uuid(), 'family_id' => $wargaFamilyIds[2], 'category_id' => $catKeamananId, 'amount' => 50000.00, 'created_at' => now(), 'updated_at' => now()
        ]);

        DB::table('iuran_payments')->insert([
            [
                'payment_id' => Str::uuid(), 'period_id' => $periodJuniKeamanan, 'family_id' => $wargaFamilyIds[0], 'paid_by_user_id' => $wargaIds[0], 'amount_paid' => 30000.00, 'paid_at' => now(), 'created_at' => now(), 'updated_at' => now()
            ],
            [
                'payment_id' => Str::uuid(), 'period_id' => $periodJuniKeamanan, 'family_id' => $wargaFamilyIds[1], 'paid_by_user_id' => $wargaIds[1], 'amount_paid' => 30000.00, 'paid_at' => now(), 'created_at' => now(), 'updated_at' => now()
            ],
        ]);

        // 6. CATATAN KAS
        DB::table('treasury_logs')->insert([
            [
                'log_id' => Str::uuid(), 'type' => 'INCOME', 'source' => 'IURAN_WARGA', 'amount' => 60000.00, 'description' => 'Rekap setoran iuran keamanan warga bulan Juni 2026', 'receipt_url' => null, 'recorded_by' => $bendaharaId, 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'log_id' => Str::uuid(), 'type' => 'EXPENSE', 'source' => 'PENGELUARAN_RUTIN', 'amount' => 35000.00, 'description' => 'Pembelian lampu pos ronda', 'receipt_url' => '/storage/receipts/lampu-pos-ronda.jpg', 'recorded_by' => $bendaharaId, 'created_at' => now(), 'updated_at' => now(),
            ],
        ]);

        // 7. RONDA
        $checkpointMainId = Str::uuid();
        $checkpointGateId = Str::uuid();
        $checkpointParkId = Str::uuid();
        $rondaScheduleCompletedId = Str::uuid();
        $rondaScheduleUpcomingId = Str::uuid();

        DB::table('checkpoints')->insert([
            ['checkpoint_id' => $checkpointMainId, 'name' => 'Pos Ronda Utama', 'latitude' => -7.04830000, 'longitude' => 110.43810000, 'qr_code_data' => 'QR-RONDA-POS-UTAMA', 'is_main_pos' => true, 'created_at' => now(), 'updated_at' => now()],
            ['checkpoint_id' => $checkpointGateId, 'name' => 'Gerbang Blok A', 'latitude' => -7.04795000, 'longitude' => 110.43905000, 'qr_code_data' => 'QR-RONDA-GERBANG-A', 'is_main_pos' => false, 'created_at' => now(), 'updated_at' => now()],
            ['checkpoint_id' => $checkpointParkId, 'name' => 'Taman Warga', 'latitude' => -7.04885000, 'longitude' => 110.43960000, 'qr_code_data' => 'QR-RONDA-TAMAN', 'is_main_pos' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $rondaGroupId = Str::uuid();
        DB::table('ronda_groups')->insert([
            'group_id' => $rondaGroupId, 'name' => 'Regu Ronda A', 'created_at' => now(), 'updated_at' => now(),
        ]);

        foreach ([$ketuaRTId, $wargaIds[0], $wargaIds[2]] as $memberId) {
            DB::table('ronda_group_members')->insert([
                'id' => Str::uuid(), 'group_id' => $rondaGroupId, 'user_id' => $memberId, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        DB::table('ronda_schedules')->insert([
            [
                'schedule_id' => $rondaScheduleCompletedId, 'group_id' => $rondaGroupId, 'coordinator_id' => $ketuaRTId, 'schedule_date' => now()->subDay()->toDateString(), 'shift_start' => now()->subDay()->setTime(22, 0), 'shift_end' => now()->setTime(1, 0), 'status' => 'COMPLETED', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'schedule_id' => $rondaScheduleUpcomingId, 'group_id' => $rondaGroupId, 'coordinator_id' => $wargaIds[0], 'schedule_date' => now()->addDay()->toDateString(), 'shift_start' => now()->addDay()->setTime(22, 0), 'shift_end' => now()->setTime(1, 0), 'status' => 'SCHEDULED', 'created_at' => now(), 'updated_at' => now(),
            ],
        ]);

        foreach ([$rondaScheduleCompletedId, $rondaScheduleUpcomingId] as $scheduleId) {
            foreach ([$checkpointMainId, $checkpointGateId, $checkpointParkId] as $checkpointId) {
                DB::table('schedule_checkpoints')->insert([
                    'id' => Str::uuid(), 'schedule_id' => $scheduleId, 'checkpoint_id' => $checkpointId, 'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }

        foreach ([$ketuaRTId, $wargaIds[0]] as $attendeeId) {
            DB::table('ronda_attendances')->insert([
                'attendance_id' => Str::uuid(), 'schedule_id' => $rondaScheduleCompletedId, 'user_id' => $attendeeId, 'scanned_at' => now()->subDay()->setTime(22, 5), 'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        foreach ([
            [$checkpointMainId, now()->subDay()->setTime(22, 10)],
            [$checkpointGateId, now()->subDay()->setTime(22, 40)],
            [$checkpointParkId, now()->subDay()->setTime(23, 20)],
        ] as [$checkpointId, $scannedAt]) {
            DB::table('patrol_checkpoint_logs')->insert([
                'log_id' => Str::uuid(), 'schedule_id' => $rondaScheduleCompletedId, 'checkpoint_id' => $checkpointId, 'scanned_by' => $ketuaRTId, 'scanned_at' => $scannedAt, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        DB::table('ronda_logs')->insert([
            'log_id' => Str::uuid(), 'schedule_id' => $rondaScheduleCompletedId, 'path_data' => json_encode([
                ['lat' => -7.04830000, 'lng' => 110.43810000, 'time' => now()->subDay()->setTime(22, 10)->toISOString(), 'name' => 'Pos Ronda Utama'],
                ['lat' => -7.04795000, 'lng' => 110.43905000, 'time' => now()->subDay()->setTime(22, 40)->toISOString(), 'name' => 'Gerbang Blok A'],
                ['lat' => -7.04885000, 'lng' => 110.43960000, 'time' => now()->subDay()->setTime(23, 20)->toISOString(), 'name' => 'Taman Warga'],
            ]), 'distance_covered' => 1.85, 'duration' => 90, 'created_at' => now(), 'updated_at' => now(),
        ]);

        // 8. KEGIATAN, GALERI, DAN PENGUMUMAN
        $rapatId = Str::uuid();
        $kerjaBaktiId = Str::uuid();

        DB::table('activities')->insert([
            [
                'activity_id' => $rapatId, 'type' => 'RAPAT', 'title' => 'Rapat Anggaran RT Juni 2026', 'description' => 'Pembahasan alokasi kas RT untuk perawatan fasilitas umum.', 'activity_date' => now()->addDays(3), 'location_name' => 'Balai Warga', 'household_id' => null, 'attendance_qr_code' => null, 'status' => 'ANNOUNCED', 'created_by' => $ketuaRTId, 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'activity_id' => $kerjaBaktiId, 'type' => 'KEGIATAN_UMUM', 'title' => 'Kerja Bakti Minggu Pagi', 'description' => 'Membersihkan selokan dan area taman warga.', 'activity_date' => now()->subDays(7), 'location_name' => 'Taman Blok A', 'household_id' => null, 'attendance_qr_code' => null, 'status' => 'COMPLETED', 'created_by' => $ketuaRTId, 'created_at' => now(), 'updated_at' => now(),
            ],
        ]);

        DB::table('activity_target_groups')->insert([
            ['id' => Str::uuid(), 'activity_id' => $rapatId, 'group_id' => $bapakGroupId, 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('activity_target_users')->insert([
            ['id' => Str::uuid(), 'activity_id' => $rapatId, 'user_id' => $wargaIds[1], 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid(), 'activity_id' => $kerjaBaktiId, 'user_id' => $wargaIds[0], 'created_at' => now(), 'updated_at' => now()],
            ['id' => Str::uuid(), 'activity_id' => $kerjaBaktiId, 'user_id' => $wargaIds[1], 'created_at' => now(), 'updated_at' => now()],
        ]);

        foreach ($wargaIds as $index => $wId) {
            if ($index >= 2) continue;
            DB::table('activity_participants')->insert([
                'participant_id' => Str::uuid(), 'activity_id' => $rapatId, 'user_id' => $wId, 'attended_at' => now()->addDays(3)->setTime(19, 5 + $index), 'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        $albumId = Str::uuid();
        DB::table('galleries')->insert([
            'gallery_id' => $albumId, 'album_name' => 'Dokumentasi Kerja Bakti Mei 2026', 'event_date' => now()->subDays(7)->toDateString(), 'activity_id' => $kerjaBaktiId, 'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('gallery_images')->insert([
            [
                'image_id' => Str::uuid(), 'gallery_id' => $albumId, 'image_url' => '/storage/activity-galleries/kerja-bakti-1.jpg', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'image_id' => Str::uuid(), 'gallery_id' => $albumId, 'image_url' => '/storage/activity-galleries/kerja-bakti-2.jpg', 'created_at' => now(), 'updated_at' => now(),
            ],
        ]);

        // =========================================================================
        // PERUBAHAN UTAMA DI SINI: MENYESUAIKAN DENGAN SKEMA ANNOUNCEMENT MILIKMU
        // =========================================================================
        $rapatAnnouncementId = Str::uuid();
        $iuranAnnouncementId = Str::uuid();

        DB::table('announcements')->insert([
            [
                'announcement_id' => $rapatAnnouncementId, 
                'title' => 'Jadwal Rapat Warga Bulan Mei',
                'content' => 'Seluruh warga diundang menghadiri rapat bulanan di Balai RT pada pukul 19.00 WIB.',
                'banner_url' => '/storage/announcements/rapat-mei.jpg', // Diubah dari image_url -> banner_url
                'status' => 'published',                                 // Ditambahkan mengikuti default migrasimu
                'created_by' => $superadminId,                           // Hubungkan ke user_id pembuat (FK wajib)
                'activity_id' => $rapatId,                               // Hubungkan relasi opsional ke kegiatan rapat
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'announcement_id' => $iuranAnnouncementId, 
                'title' => 'Pembayaran Iuran Mei Dibuka',
                'content' => 'Pembayaran iuran warga bulan Mei dapat dilakukan melalui QR bendahara atau saat jadwal piket.',
                'banner_url' => null,                                    // Diubah dari image_url -> banner_url
                'status' => 'published',                                 // Ditambahkan mengikuti default migrasimu
                'created_by' => $bendaharaId,                            // Hubungkan ke user_id bendahara
                'activity_id' => null,
                'created_at' => now(), 'updated_at' => now(),
            ],
        ]);

        // 9. EMERGENCY ALERTS & LAPORAN FASILITAS
        DB::table('emergency_alerts')->insert([
            'alert_id' => Str::uuid(), 'sender_id' => $wargaIds[0], 'latitude' => -7.0483, 'longitude' => 110.4381, 'message' => 'Ada orang mencurigakan di area blok A', 'status' => 'ACTIVE', 'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('facility_reports')->insert([
            [
                'report_id' => Str::uuid(), 'reporter_id' => $wargaIds[1], 'title' => 'Lampu Jalan Mati', 'category' => 'Penerangan', 'description' => 'Lampu jalan depan rumah A-4 mati sejak dua hari lalu.', 'image_url' => '/storage/facility-reports/lampu-mati.jpg', 'status' => 'IN_PROGRESS', 'response_message' => 'Pengurus sudah menghubungi teknisi untuk pengecekan.', 'resolved_photo_url' => null, 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'report_id' => Str::uuid(), 'reporter_id' => $wargaIds[2], 'title' => 'Selokan Tersumbat', 'category' => 'Kebersihan', 'description' => 'Selokan di Blok B-1 tersumbat sampah daun.', 'image_url' => '/storage/facility-reports/selokan.jpg', 'status' => 'SUBMITTED', 'response_message' => null, 'resolved_photo_url' => null, 'created_at' => now(), 'updated_at' => now(),
            ],
        ]);
    }
}
