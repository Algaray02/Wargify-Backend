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
        DB::statement('TRUNCATE TABLE activity_participants CASCADE');
        DB::statement('TRUNCATE TABLE activities CASCADE');
        DB::statement('TRUNCATE TABLE treasury_logs CASCADE');
        DB::statement('TRUNCATE TABLE iuran_payments CASCADE');
        DB::statement('TRUNCATE TABLE iuran_periods CASCADE');
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
            ['nama' => 'Rizky Warga', 'telepon' => '08111111111', 'blok' => 'A', 'nomor' => '3'],
            ['nama' => 'Siti Nurhaliza', 'telepon' => '08112222222', 'blok' => 'A', 'nomor' => '4'],
            ['nama' => 'Rahmat Hidayat', 'telepon' => '08113333333', 'blok' => 'B', 'nomor' => '1'],
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
                'user_id' => $uId, 'family_id' => $fId, 'username' => strtolower(explode(' ', $warga['nama'])[0]),
                'password' => Hash::make('password123'), 'full_name' => $warga['nama'],
                'phone_number' => $warga['telepon'], 'role' => 'WARGA',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $wargaIds[] = $uId;
        }

        // 4. IURAN PERIODS & PAYMENTS
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

        // 5. EMERGENCY ALERTS
        DB::table('emergency_alerts')->insert([
            'alert_id' => Str::uuid(), 'sender_id' => $wargaIds[0],
            'latitude' => -7.0483, 'longitude' => 110.4381,
            'message' => 'Ada orang mencurigakan di area blok A',
            'status' => 'ACTIVE', 'created_at' => now(), 'updated_at' => now(),
        ]);
    }
}