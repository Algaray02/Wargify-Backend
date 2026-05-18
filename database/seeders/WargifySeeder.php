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
        // =====================================================
        // 0. CLEAR SEMUA DATA LAMA (Truncate dengan urutan terbalik)
        // =====================================================
        DB::statement('TRUNCATE TABLE emergency_alerts CASCADE');
        DB::statement('TRUNCATE TABLE facility_reports CASCADE');
        DB::statement('TRUNCATE TABLE activity_participants CASCADE');
        DB::statement('TRUNCATE TABLE activities CASCADE');
        DB::statement('TRUNCATE TABLE ronda_attendances CASCADE');
        DB::statement('TRUNCATE TABLE schedule_checkpoints CASCADE');
        DB::statement('TRUNCATE TABLE ronda_schedules CASCADE');
        DB::statement('TRUNCATE TABLE ronda_group_members CASCADE');
        DB::statement('TRUNCATE TABLE ronda_groups CASCADE');
        DB::statement('TRUNCATE TABLE checkpoints CASCADE');
        DB::statement('TRUNCATE TABLE treasury_logs CASCADE');
        DB::statement('TRUNCATE TABLE iuran_payments CASCADE');
        DB::statement('TRUNCATE TABLE iuran_periods CASCADE');
        DB::statement('TRUNCATE TABLE users CASCADE');
        DB::statement('TRUNCATE TABLE families CASCADE');
        DB::statement('TRUNCATE TABLE households CASCADE');

        // =====================================================
        // 1. BUAT DATA SUPERADMIN
        // =====================================================
        $superadminFamily = Str::uuid();
        $superadminHousehold = Str::uuid();

        DB::table('households')->insert([
            'household_id' => $superadminHousehold,
            'block_number' => 'ADM',
            'house_number' => '1',
            'qr_code_data' => 'QR-HOUSE-ADM-1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('families')->insert([
            'family_id' => $superadminFamily,
            'household_id' => $superadminHousehold,
            'head_of_family_id' => null,
            'qr_code_data' => 'QR-FAM-ADM-1',
            'created_at' => now(),
            'updated_at' => now(),
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
            'profile_picture_url' => 'https://ui-avatars.com/api/?name=Admin+Sistem&background=ff0000&color=fff',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('families')->where('family_id', $superadminFamily)->update([
            'head_of_family_id' => $superadminId
        ]);

        // =====================================================
        // 2. BUAT DATA KETUA RT & BENDAHARA
        // =====================================================
        $ketuaRTFamily = Str::uuid();
        $ketuaRTHousehold = Str::uuid();

        DB::table('households')->insert([
            'household_id' => $ketuaRTHousehold,
            'block_number' => 'A',
            'house_number' => '1',
            'qr_code_data' => 'QR-HOUSE-A-1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('families')->insert([
            'family_id' => $ketuaRTFamily,
            'household_id' => $ketuaRTHousehold,
            'head_of_family_id' => null,
            'qr_code_data' => 'QR-FAM-A-1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ketuaRTId = Str::uuid();
        DB::table('users')->insert([
            'user_id' => $ketuaRTId,
            'family_id' => $ketuaRTFamily,
            'username' => 'vian_rt',
            'password' => Hash::make('password123'),
            'full_name' => 'Vian Maulana Ramadhan',
            'phone_number' => '08123456789',
            'role' => 'KETUA_RT',
            'profile_picture_url' => 'https://ui-avatars.com/api/?name=Vian+Maulana&background=1e40af&color=fff',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('families')->where('family_id', $ketuaRTFamily)->update([
            'head_of_family_id' => $ketuaRTId
        ]);

        // Bendahara
        $bendaharaFamily = Str::uuid();
        $bendaharaHousehold = Str::uuid();

        DB::table('households')->insert([
            'household_id' => $bendaharaHousehold,
            'block_number' => 'A',
            'house_number' => '2',
            'qr_code_data' => 'QR-HOUSE-A-2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('families')->insert([
            'family_id' => $bendaharaFamily,
            'household_id' => $bendaharaHousehold,
            'head_of_family_id' => null,
            'qr_code_data' => 'QR-FAM-A-2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $bendaharaId = Str::uuid();
        DB::table('users')->insert([
            'user_id' => $bendaharaId,
            'family_id' => $bendaharaFamily,
            'username' => 'abi_bendahara',
            'password' => Hash::make('password123'),
            'full_name' => 'Abimanyu',
            'phone_number' => '08234567890',
            'role' => 'BENDAHARA',
            'profile_picture_url' => 'https://ui-avatars.com/api/?name=Budi+Hartono&background=16a34a&color=fff',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('families')->where('family_id', $bendaharaFamily)->update([
            'head_of_family_id' => $bendaharaId
        ]);

        // =====================================================
        // 3. BUAT DATA WARGA (HOUSEHOLDS & FAMILIES)
        // =====================================================
        $wargaIds = [];
        $blocks = ['A', 'B', 'C', 'D', 'E'];
        $wargaData = [
            ['nama' => 'Rizky Warga', 'telepon' => '08111111111', 'blok' => 'A', 'nomor' => '3'],
            ['nama' => 'Siti Nurhaliza', 'telepon' => '08112222222', 'blok' => 'A', 'nomor' => '4'],
            ['nama' => 'Rahmat Hidayat', 'telepon' => '08113333333', 'blok' => 'B', 'nomor' => '1'],
            ['nama' => 'Dewi Lestari', 'telepon' => '08114444444', 'blok' => 'B', 'nomor' => '2'],
            ['nama' => 'Hendra Wijaya', 'telepon' => '08115555555', 'blok' => 'B', 'nomor' => '3'],
            ['nama' => 'Rina Kusuma', 'telepon' => '08116666666', 'blok' => 'C', 'nomor' => '1'],
            ['nama' => 'Bambang Setiawan', 'telepon' => '08117777777', 'blok' => 'C', 'nomor' => '2'],
            ['nama' => 'Sinta Purnama', 'telepon' => '08118888888', 'blok' => 'C', 'nomor' => '3'],
            ['nama' => 'Doni Hermawan', 'telepon' => '08119999999', 'blok' => 'D', 'nomor' => '1'],
            ['nama' => 'Eka Putri', 'telepon' => '08119999998', 'blok' => 'D', 'nomor' => '2'],
        ];

        foreach ($wargaData as $index => $warga) {
            $householdId = Str::uuid();
            $familyId = Str::uuid();
            $userId = Str::uuid();

            DB::table('households')->insert([
                'household_id' => $householdId,
                'block_number' => $warga['blok'],
                'house_number' => $warga['nomor'],
                'qr_code_data' => 'QR-HOUSE-' . $warga['blok'] . '-' . $warga['nomor'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('families')->insert([
                'family_id' => $familyId,
                'household_id' => $householdId,
                'head_of_family_id' => null,
                'qr_code_data' => 'QR-FAM-' . $warga['blok'] . '-' . $warga['nomor'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('users')->insert([
                'user_id' => $userId,
                'family_id' => $familyId,
                'username' => strtolower(str_replace(' ', '_', $warga['nama'])),
                'password' => Hash::make('password123'),
                'full_name' => $warga['nama'],
                'phone_number' => $warga['telepon'],
                'role' => 'WARGA',
                'profile_picture_url' => 'https://ui-avatars.com/api/?name=' . urlencode($warga['nama']) . '&background=0891b2&color=fff',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('families')->where('family_id', $familyId)->update([
                'head_of_family_id' => $userId
            ]);

            $wargaIds[] = $userId;
        }

        // =====================================================
        // 4. BUAT MASTER DATA CHECKPOINTS (POS KAMLING)
        // =====================================================
        $checkpointIds = [];
        $checkpointData = [
            [
                'nama' => 'Pos Kamling Utama',
                'lat' => -7.0483,
                'lng' => 110.4381,
                'main' => true,
            ],
            [
                'nama' => 'Gapura Blok A',
                'lat' => -7.0485,
                'lng' => 110.4385,
                'main' => false,
            ],
            [
                'nama' => 'Gapura Blok B',
                'lat' => -7.0480,
                'lng' => 110.4388,
                'main' => false,
            ],
            [
                'nama' => 'Gapura Blok C',
                'lat' => -7.0478,
                'lng' => 110.4390,
                'main' => false,
            ],
            [
                'nama' => 'Gapura Blok D',
                'lat' => -7.0475,
                'lng' => 110.4392,
                'main' => false,
            ],
        ];

        foreach ($checkpointData as $index => $checkpoint) {
            $checkpointId = Str::uuid();
            DB::table('checkpoints')->insert([
                'checkpoint_id' => $checkpointId,
                'name' => $checkpoint['nama'],
                'latitude' => $checkpoint['lat'],
                'longitude' => $checkpoint['lng'],
                'qr_code_data' => 'QR-CHECK-' . ($index + 1),
                'is_main_pos' => $checkpoint['main'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $checkpointIds[] = $checkpointId;
        }

        // =====================================================
        // 5. BUAT RONDA GROUPS (GRUP RONDA)
        // =====================================================
        $rondaGroupIds = [];
        $rondaGroups = [
            ['nama' => 'Ronda Shift Pagi', 'members' => array_slice($wargaIds, 0, 3)],
            ['nama' => 'Ronda Shift Malam', 'members' => array_slice($wargaIds, 3, 3)],
            ['nama' => 'Ronda Hari Kerja', 'members' => array_slice($wargaIds, 6, 4)],
        ];

        foreach ($rondaGroups as $group) {
            $groupId = Str::uuid();
            DB::table('ronda_groups')->insert([
                'group_id' => $groupId,
                'name' => $group['nama'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Tambah members ke group
            foreach ($group['members'] as $memberId) {
                DB::table('ronda_group_members')->insert([
                    'id' => Str::uuid(),
                    'group_id' => $groupId,
                    'user_id' => $memberId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $rondaGroupIds[] = $groupId;
        }

        // =====================================================
        // 6. BUAT RONDA SCHEDULES
        // =====================================================
        foreach ($rondaGroupIds as $groupId) {
            for ($day = 1; $day <= 5; $day++) {
                $scheduleId = Str::uuid();
                $coordinator = $wargaIds[array_rand($wargaIds)];

                DB::table('ronda_schedules')->insert([
                    'schedule_id' => $scheduleId,
                    'group_id' => $groupId,
                    'coordinator_id' => $coordinator,
                    'schedule_date' => now()->addDays($day)->toDateString(),
                    'shift_start' => now()->addDays($day)->setHour(19)->setMinute(0),
                    'shift_end' => now()->addDays($day)->setHour(6)->setMinute(0),
                    'status' => $day <= 2 ? 'COMPLETED' : 'SCHEDULED',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Assign checkpoints ke schedule
                foreach (array_slice($checkpointIds, 0, 2) as $checkpointId) {
                    DB::table('schedule_checkpoints')->insert([
                        'id' => Str::uuid(),
                        'checkpoint_id' => $checkpointId,
                        'schedule_id' => $scheduleId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // =====================================================
        // 7. BUAT PERIODE IURAN
        // =====================================================
        $periodIds = [];
        $months = [
            ['bulan' => 'Januari 2026', 'month' => 1],
            ['bulan' => 'Februari 2026', 'month' => 2],
            ['bulan' => 'Maret 2026', 'month' => 3],
            ['bulan' => 'April 2026', 'month' => 4],
            ['bulan' => 'Mei 2026', 'month' => 5],
        ];

        foreach ($months as $periode) {
            $periodId = Str::uuid();
            DB::table('iuran_periods')->insert([
                'period_id' => $periodId,
                'period_name' => 'Iuran Wajib ' . $periode['bulan'],
                'month' => $periode['month'],
                'year' => 2026,
                'amount_per_family' => 50000,
                'payment_qr_code' => 'QR-PAY-' . strtoupper($periode['bulan']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $periodIds[] = $periodId;
        }

        // =====================================================
        // 8. BUAT IURAN PAYMENTS (DATA PEMBAYARAN)
        // =====================================================
        foreach ($periodIds as $periodId) {
            $families = DB::table('families')->limit(7)->get();
            foreach ($families as $family) {
                $paidByUser = $wargaIds[array_rand($wargaIds)];
                DB::table('iuran_payments')->insert([
                    'payment_id' => Str::uuid(),
                    'period_id' => $periodId,
                    'family_id' => $family->family_id,
                    'paid_by_user_id' => $paidByUser,
                    'amount_paid' => 50000,
                    'paid_at' => now()->subDays(rand(1, 30)),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // =====================================================
        // 9. BUAT TREASURY LOGS (CATATAN KEUANGAN)
        // =====================================================
        // Income dari iuran warga
        DB::table('treasury_logs')->insert([
            'log_id' => Str::uuid(),
            'type' => 'INCOME',
            'source' => 'IURAN_WARGA',
            'amount' => 350000,
            'description' => 'Iuran warga bulan Mei 2026 (7 keluarga)',
            'receipt_url' => null,
            'recorded_by' => $bendaharaId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Pengeluaran rutin
        DB::table('treasury_logs')->insert([
            'log_id' => Str::uuid(),
            'type' => 'EXPENSE',
            'source' => 'PENGELUARAN_RUTIN',
            'amount' => 100000,
            'description' => 'Pembelian material pembersih lapangan',
            'receipt_url' => null,
            'recorded_by' => $bendaharaId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('treasury_logs')->insert([
            'log_id' => Str::uuid(),
            'type' => 'EXPENSE',
            'source' => 'PENGELUARAN_RUTIN',
            'amount' => 50000,
            'description' => 'Biaya listrik pos kamling bulan Mei',
            'receipt_url' => null,
            'recorded_by' => $bendaharaId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // =====================================================
        // 10. BUAT ACTIVITIES (KEGIATAN & RAPAT)
        // =====================================================
        $activityIds = [];
        $activities = [
            [
                'tipe' => 'RAPAT',
                'judul' => 'Rapat Rutin Bulanan RT',
                'deskripsi' => 'Membahas program keamanan dan keuangan komunitas',
                'tanggal' => now()->addDays(7),
                'lokasi' => 'Pos Kamling Utama',
            ],
            [
                'tipe' => 'KEGIATAN_UMUM',
                'judul' => 'Kerja Bakti Bersih-Bersih Lingkungan',
                'deskripsi' => 'Kegiatan kerja bakti untuk membersihkan area lingkungan',
                'tanggal' => now()->addDays(14),
                'lokasi' => 'Lapangan Olahraga',
            ],
            [
                'tipe' => 'KEGIATAN_UMUM',
                'judul' => 'Arisan Bulanan Warga',
                'deskripsi' => 'Pertemuan sosial dan arisan bulanan warga',
                'tanggal' => now()->addDays(21),
                'lokasi' => 'Rumah Warga',
            ],
        ];

        foreach ($activities as $activity) {
            $activityId = Str::uuid();
            DB::table('activities')->insert([
                'activity_id' => $activityId,
                'type' => $activity['tipe'],
                'title' => $activity['judul'],
                'description' => $activity['deskripsi'],
                'activity_date' => $activity['tanggal'],
                'location_name' => $activity['lokasi'],
                'attendance_qr_code' => 'QR-ACT-' . Str::uuid(),
                'status' => 'ANNOUNCED',
                'created_by' => $ketuaRTId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $activityIds[] = $activityId;
        }

        // Tambah peserta ke activities
        foreach ($activityIds as $activityId) {
            $participants = array_slice($wargaIds, 0, rand(5, 8));
            foreach ($participants as $participantId) {
                DB::table('activity_participants')->insert([
                    'participant_id' => Str::uuid(),
                    'activity_id' => $activityId,
                    'user_id' => $participantId,
                    'attended_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // =====================================================
        // 11. BUAT FACILITY REPORTS (LAPORAN FASILITAS)
        // =====================================================
        $facilityIssues = [
            [
                'judul' => 'Lampu Pos Kamling Rusak',
                'kategori' => 'Listrik',
                'deskripsi' => 'Lampu di pos kamling utama sudah tidak menyala',
            ],
            [
                'judul' => 'Jalan Retak dan Berlubang',
                'kategori' => 'Jalan',
                'deskripsi' => 'Aspal jalan blok C sudah retak dan ada lubang',
            ],
            [
                'judul' => 'Saluran Air Tersumbat',
                'kategori' => 'Drainase',
                'deskripsi' => 'Saluran air di area blok D tersumbat sampah',
            ],
            [
                'judul' => 'Taman Perlu Perawatan',
                'kategori' => 'Taman',
                'deskripsi' => 'Rumput di taman warga sudah tinggi dan tidak terawat',
            ],
        ];

        foreach ($facilityIssues as $issue) {
            DB::table('facility_reports')->insert([
                'report_id' => Str::uuid(),
                'reporter_id' => $wargaIds[array_rand($wargaIds)],
                'title' => $issue['judul'],
                'category' => $issue['kategori'],
                'description' => $issue['deskripsi'],
                'image_url' => null,
                'status' => 'SUBMITTED',
                'response_message' => null,
                'resolved_photo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // =====================================================
        // 12. BUAT EMERGENCY ALERTS (ALERT DARURAT)
        // =====================================================
        DB::table('emergency_alerts')->insert([
            'alert_id' => Str::uuid(),
            'sender_id' => $wargaIds[array_rand($wargaIds)],
            'latitude' => -7.0483,
            'longitude' => 110.4381,
            'message' => 'Ada orang mencurigakan di area blok A',
            'status' => 'ACTIVE',
            'resolved_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('emergency_alerts')->insert([
            'alert_id' => Str::uuid(),
            'sender_id' => $wargaIds[array_rand($wargaIds)],
            'latitude' => -7.0480,
            'longitude' => 110.4388,
            'message' => 'Kebakaran kecil di rumah warga blok B',
            'status' => 'RESOLVED',
            'resolved_at' => now()->subDays(2),
            'created_at' => now()->subDays(2),
            'updated_at' => now(),
        ]);
    }
}