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
        // 1. Buat Data Rumah (Household)
        $householdId = Str::uuid();
        DB::table('households')->insert([
            'household_id' => $householdId,
            'block_number' => 'A',
            'house_number' => '12',
            'qr_code_data' => 'QR-HOUSE-A12',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Buat Data Keluarga (Family)
        $familyId = Str::uuid();
        DB::table('families')->insert([
            'family_id' => $familyId,
            'household_id' => $householdId,
            'head_of_family_id' => null, // Akan diupdate setelah user dibuat
            'qr_code_data' => 'QR-FAM-A12',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Buat User: Ketua RT (Contoh: Vian)
        $userId = Str::uuid();
        DB::table('users')->insert([
            'user_id' => $userId,
            'family_id' => $familyId,
            'username' => 'vian_rt',
            'password' => Hash::make('password123'),
            'full_name' => 'Vian Maulana Ramadhan',
            'phone_number' => '08123456789',
            'role' => 'KETUA_RT',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Update Kepala Keluarga di tabel families
        DB::table('families')->where('family_id', $familyId)->update([
            'head_of_family_id' => $userId
        ]);

        // 4. Buat Master Data Checkpoint Ronda
        DB::table('checkpoints')->insert([
            [
                'checkpoint_id' => Str::uuid(),
                'name' => 'Pos Kamling Utama',
                'latitude' => -7.0483, // Contoh koordinat Semarang
                'longitude' => 110.4381,
                'qr_code_data' => 'QR-CHECK-POS-1',
                'is_main_pos' => true,
                'created_at' => now(),
            ],
            [
                'checkpoint_id' => Str::uuid(),
                'name' => 'Gapura Blok A',
                'latitude' => -7.0485,
                'longitude' => 110.4385,
                'qr_code_data' => 'QR-CHECK-A',
                'is_main_pos' => false,
                'created_at' => now(),
            ]
        ]);
        
        // 5. Buat Periode Iuran
        DB::table('iuran_periods')->insert([
            'period_id' => Str::uuid(),
            'period_name' => 'Iuran Wajib Mei 2026',
            'month' => 5,
            'year' => 2026,
            'amount_per_family' => 50000,
            'payment_qr_code' => 'QR-PAY-MEI26',
            'created_at' => now(),
        ]);
    }
}