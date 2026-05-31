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
        // 0. CLEAR DATA LAMA (Kecuali Ronda, karena akan diurus RondaSeeder)
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
        DB::statement('TRUNCATE TABLE iuran_periods CASCADE');
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
        DB::statement('TRUNCATE TABLE users CASCADE');
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
        $ketuaRTFamily = Str::uuid();
        $ketuaRTHousehold = Str::uuid();

        DB::table('households')->insert([
            'household_id' => $ketuaRTHousehold,
            'block_number' => 'A', 'house_number' => '1',
            'qr_code_data' => 'QR-HOUSE-A-1',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('families')->insert([
            'family_id' => $ketuaRTFamily,
            'household_id' => $ketuaRTHousehold,
            'head_of_family_id' => $ketuaRTId,
            'qr_code_data' => 'QR-FAM-A-1',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'user_id' => $ketuaRTId,
            'family_id' => $ketuaRTFamily,
            'username' => 'vian_rt',
            'password' => Hash::make('password123'),
            'full_name' => 'Vian Maulana Ramadhan',
            'phone_number' => '08123456789',
            'role' => 'KETUA_RT',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $bendaharaId = Str::uuid();
        $bendaharaFamily = Str::uuid();
        $bendaharaHousehold = Str::uuid();

        DB::table('households')->insert([
            'household_id' => $bendaharaHousehold,
            'block_number' => 'A', 'house_number' => '2',
            'qr_code_data' => 'QR-HOUSE-A-2',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('families')->insert([
            'family_id' => $bendaharaFamily,
            'household_id' => $bendaharaHousehold,
            'head_of_family_id' => $bendaharaId,
            'qr_code_data' => 'QR-FAM-A-2',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'user_id' => $bendaharaId,
            'family_id' => $bendaharaFamily,
            'username' => 'abi_bendahara',
            'password' => Hash::make('password123'),
            'full_name' => 'Abimanyu',
            'phone_number' => '08234567890',
            'role' => 'BENDAHARA',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        // 3. DATA WARGA
        $wargaIds = [];
        $wargaData = [
            ['nama' => 'Rizky Warga', 'username' => 'rizky_warga', 'telepon' => '08111111111', 'blok' => 'A', 'nomor' => '3'],
            ['nama' => 'Siti Nurhaliza', 'username' => 'siti', 'telepon' => '08112222222', 'blok' => 'A', 'nomor' => '4'],
            ['nama' => 'Rahmat Hidayat', 'username' => 'rahmat', 'telepon' => '08113333333', 'blok' => 'B', 'nomor' => '1'],
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
        }

        // 4. KELOMPOK WARGA
        $bapakGroupId = Str::uuid();
        $ibuGroupId = Str::uuid();
        $pemudaGroupId = Str::uuid();

        DB::table('citizen_groups')->insert([
            [
                'group_id' => $bapakGroupId,
                'name' => 'Bapak-Bapak',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group_id' => $ibuGroupId,
                'name' => 'Ibu-Ibu PKK',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group_id' => $pemudaGroupId,
                'name' => 'Pemuda',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('user_group_members')->insert([
            [
                'id' => Str::uuid(),
                'group_id' => $bapakGroupId,
                'user_id' => $ketuaRTId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'group_id' => $bapakGroupId,
                'user_id' => $wargaIds[0],
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'group_id' => $ibuGroupId,
                'user_id' => $wargaIds[1],
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'group_id' => $pemudaGroupId,
                'user_id' => $wargaIds[2],
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 5. IURAN PERIODS & PAYMENTS
        $periodId = Str::uuid();
        DB::table('iuran_periods')->insert([
            'period_id' => $periodId, 'period_name' => 'Iuran Mei 2026',
            'month' => 5, 'year' => 2026, 'amount_per_family' => 50000,
            'payment_qr_code' => 'QR-PAY-MEI',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        foreach ($wargaIds as $wId) {
            DB::table('iuran_payments')->insert([
                'payment_id' => Str::uuid(), 'period_id' => $periodId,
                'family_id' => DB::table('users')->where('user_id', $wId)->value('family_id'),
                'paid_by_user_id' => $wId, 'amount_paid' => 50000,
                'paid_at' => now(), 'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // 6. CATATAN KAS
        DB::table('treasury_logs')->insert([
            [
                'log_id' => Str::uuid(),
                'type' => 'INCOME',
                'source' => 'IURAN_WARGA',
                'amount' => 150000,
                'description' => 'Rekap pembayaran iuran warga bulan Mei 2026',
                'receipt_url' => null,
                'recorded_by' => $bendaharaId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'log_id' => Str::uuid(),
                'type' => 'EXPENSE',
                'source' => 'PENGELUARAN_RUTIN',
                'amount' => 35000,
                'description' => 'Pembelian lampu pos ronda',
                'receipt_url' => '/storage/receipts/lampu-pos-ronda.jpg',
                'recorded_by' => $bendaharaId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 7. RONDA
        $checkpointMainId = Str::uuid();
        $checkpointGateId = Str::uuid();
        $checkpointParkId = Str::uuid();
        $rondaGroupId = Str::uuid();
        $rondaScheduleCompletedId = Str::uuid();
        $rondaScheduleUpcomingId = Str::uuid();

        DB::table('checkpoints')->insert([
            [
                'checkpoint_id' => $checkpointMainId,
                'name' => 'Pos Ronda Utama',
                'latitude' => -7.04830000,
                'longitude' => 110.43810000,
                'qr_code_data' => 'QR-RONDA-POS-UTAMA',
                'is_main_pos' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'checkpoint_id' => $checkpointGateId,
                'name' => 'Gerbang Blok A',
                'latitude' => -7.04795000,
                'longitude' => 110.43905000,
                'qr_code_data' => 'QR-RONDA-GERBANG-A',
                'is_main_pos' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'checkpoint_id' => $checkpointParkId,
                'name' => 'Taman Warga',
                'latitude' => -7.04885000,
                'longitude' => 110.43960000,
                'qr_code_data' => 'QR-RONDA-TAMAN',
                'is_main_pos' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('ronda_groups')->insert([
            'group_id' => $rondaGroupId,
            'name' => 'Regu Ronda A',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ([$ketuaRTId, $wargaIds[0], $wargaIds[2]] as $memberId) {
            DB::table('ronda_group_members')->insert([
                'id' => Str::uuid(),
                'group_id' => $rondaGroupId,
                'user_id' => $memberId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('ronda_schedules')->insert([
            [
                'schedule_id' => $rondaScheduleCompletedId,
                'group_id' => $rondaGroupId,
                'coordinator_id' => $ketuaRTId,
                'schedule_date' => now()->subDay()->toDateString(),
                'shift_start' => now()->subDay()->setTime(22, 0),
                'shift_end' => now()->setTime(1, 0),
                'status' => 'COMPLETED',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'schedule_id' => $rondaScheduleUpcomingId,
                'group_id' => $rondaGroupId,
                'coordinator_id' => $wargaIds[0],
                'schedule_date' => now()->addDay()->toDateString(),
                'shift_start' => now()->addDay()->setTime(22, 0),
                'shift_end' => now()->addDays(2)->setTime(1, 0),
                'status' => 'SCHEDULED',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        foreach ([$rondaScheduleCompletedId, $rondaScheduleUpcomingId] as $scheduleId) {
            foreach ([$checkpointMainId, $checkpointGateId, $checkpointParkId] as $checkpointId) {
                DB::table('schedule_checkpoints')->insert([
                    'id' => Str::uuid(),
                    'schedule_id' => $scheduleId,
                    'checkpoint_id' => $checkpointId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        foreach ([$ketuaRTId, $wargaIds[0]] as $attendeeId) {
            DB::table('ronda_attendances')->insert([
                'attendance_id' => Str::uuid(),
                'schedule_id' => $rondaScheduleCompletedId,
                'user_id' => $attendeeId,
                'scanned_at' => now()->subDay()->setTime(22, 5),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        foreach ([
            [$checkpointMainId, now()->subDay()->setTime(22, 10)],
            [$checkpointGateId, now()->subDay()->setTime(22, 40)],
            [$checkpointParkId, now()->subDay()->setTime(23, 20)],
        ] as [$checkpointId, $scannedAt]) {
            DB::table('patrol_checkpoint_logs')->insert([
                'log_id' => Str::uuid(),
                'schedule_id' => $rondaScheduleCompletedId,
                'checkpoint_id' => $checkpointId,
                'scanned_by' => $ketuaRTId,
                'scanned_at' => $scannedAt,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('ronda_logs')->insert([
            'log_id' => Str::uuid(),
            'schedule_id' => $rondaScheduleCompletedId,
            'path_data' => json_encode([
                ['lat' => -7.04830000, 'lng' => 110.43810000, 'time' => now()->subDay()->setTime(22, 10)->toISOString(), 'name' => 'Pos Ronda Utama'],
                ['lat' => -7.04795000, 'lng' => 110.43905000, 'time' => now()->subDay()->setTime(22, 40)->toISOString(), 'name' => 'Gerbang Blok A'],
                ['lat' => -7.04885000, 'lng' => 110.43960000, 'time' => now()->subDay()->setTime(23, 20)->toISOString(), 'name' => 'Taman Warga'],
            ]),
            'distance_covered' => 1.85,
            'duration' => 90,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 8. KEGIATAN, GALERI, DAN PENGUMUMAN
        $rapatId = Str::uuid();
        $kerjaBaktiId = Str::uuid();

        DB::table('activities')->insert([
            [
                'activity_id' => $rapatId,
                'type' => 'RAPAT',
                'title' => 'Rapat Anggaran RT Mei 2026',
                'description' => 'Pembahasan alokasi kas RT untuk perawatan fasilitas umum.',
                'activity_date' => now()->addDays(3),
                'location_name' => 'Blok A No. 1',
                'household_id' => $ketuaRTHousehold,
                'attendance_qr_code' => 'QR-HOUSE-A-1',
                'status' => 'ANNOUNCED',
                'created_by' => $ketuaRTId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'activity_id' => $kerjaBaktiId,
                'type' => 'KEGIATAN_UMUM',
                'title' => 'Kerja Bakti Minggu Pagi',
                'description' => 'Membersihkan selokan dan area taman warga.',
                'activity_date' => now()->subDays(7),
                'location_name' => 'Taman Blok A',
                'household_id' => null,
                'attendance_qr_code' => null,
                'status' => 'COMPLETED',
                'created_by' => $ketuaRTId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('activity_target_groups')->insert([
            [
                'id' => Str::uuid(),
                'activity_id' => $rapatId,
                'group_id' => $bapakGroupId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('activity_target_users')->insert([
            [
                'id' => Str::uuid(),
                'activity_id' => $rapatId,
                'user_id' => $wargaIds[1],
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'activity_id' => $kerjaBaktiId,
                'user_id' => $wargaIds[0],
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'activity_id' => $kerjaBaktiId,
                'user_id' => $wargaIds[1],
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        foreach ($wargaIds as $index => $wId) {
            if ($index >= 2) {
                continue;
            }

            DB::table('activity_participants')->insert([
                'participant_id' => Str::uuid(),
                'activity_id' => $rapatId,
                'user_id' => $wId,
                'attended_at' => now()->addDays(3)->setTime(19, 5 + $index),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('activity_galleries')->insert([
            [
                'photo_id' => Str::uuid(),
                'activity_id' => $kerjaBaktiId,
                'uploaded_by' => $ketuaRTId,
                'photo_url' => '/storage/activity-galleries/kerja-bakti-1.jpg',
                'caption' => 'Warga membersihkan area taman Blok A',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'photo_id' => Str::uuid(),
                'activity_id' => $kerjaBaktiId,
                'uploaded_by' => $ketuaRTId,
                'photo_url' => '/storage/activity-galleries/kerja-bakti-2.jpg',
                'caption' => 'Koordinasi pembagian tugas kerja bakti',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $rapatAnnouncementId = Str::uuid();
        $iuranAnnouncementId = Str::uuid();

        DB::table('announcements')->insert([
            [
                'announcement_id' => $rapatAnnouncementId,
                'title' => 'Jadwal Rapat Warga Bulan Mei',
                'content' => 'Seluruh warga diundang menghadiri rapat bulanan di Balai RT pada pukul 19.00 WIB.',
                'image_url' => '/storage/announcements/rapat-mei.jpg',
                'is_important' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'announcement_id' => $iuranAnnouncementId,
                'title' => 'Pembayaran Iuran Mei Dibuka',
                'content' => 'Pembayaran iuran warga bulan Mei dapat dilakukan melalui QR bendahara atau saat jadwal piket.',
                'image_url' => null,
                'is_important' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 9. EMERGENCY ALERTS & LAPORAN FASILITAS
        DB::table('emergency_alerts')->insert([
            'alert_id' => Str::uuid(), 'sender_id' => $wargaIds[0],
            'latitude' => -7.0483, 'longitude' => 110.4381,
            'message' => 'Ada orang mencurigakan di area blok A',
            'status' => 'ACTIVE', 'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('facility_reports')->insert([
            [
                'report_id' => Str::uuid(),
                'reporter_id' => $wargaIds[1],
                'title' => 'Lampu Jalan Mati',
                'category' => 'Penerangan',
                'description' => 'Lampu jalan depan rumah A-4 mati sejak dua hari lalu.',
                'image_url' => '/storage/facility-reports/lampu-mati.jpg',
                'status' => 'IN_PROGRESS',
                'response_message' => 'Pengurus sudah menghubungi teknisi untuk pengecekan.',
                'resolved_photo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'report_id' => Str::uuid(),
                'reporter_id' => $wargaIds[2],
                'title' => 'Selokan Tersumbat',
                'category' => 'Kebersihan',
                'description' => 'Selokan di Blok B-1 tersumbat sampah daun.',
                'image_url' => '/storage/facility-reports/selokan.jpg',
                'status' => 'SUBMITTED',
                'response_message' => null,
                'resolved_photo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
