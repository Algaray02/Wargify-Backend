<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Checkpoint;
use App\Models\RondaGroup;
use App\Models\RondaSchedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RondaSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('TRUNCATE TABLE ronda_attendances CASCADE');
        DB::statement('TRUNCATE TABLE schedule_checkpoints CASCADE');
        DB::statement('TRUNCATE TABLE ronda_schedules CASCADE');
        DB::statement('TRUNCATE TABLE ronda_group_members CASCADE');
        DB::statement('TRUNCATE TABLE ronda_groups CASCADE');
        DB::statement('TRUNCATE TABLE checkpoints CASCADE');

        // 1. Buat Checkpoint (Titik Pantau)
        $posUtama = Checkpoint::create([
            'name' => 'Pos Ronda Utama',
            'latitude' => -7.0482, 
            'longitude' => 110.4390,
            'qr_code_data' => 'QR-CHECK-POS-01',
            'is_main_pos' => true
        ]);

        $blokC = Checkpoint::create([
            'name' => 'Portal Blok C',
            'latitude' => -7.0485,
            'longitude' => 110.4395,
            'qr_code_data' => 'QR-CHECK-BLOK-C',
            'is_main_pos' => false
        ]);

        // 2. Buat Grup Ronda
        $grupMacan = RondaGroup::create([
            'name' => 'Grup Macan (Senin)'
        ]);

        // 3. Ambil beberapa user untuk dijadikan anggota & koordinator
        // Pastikan kamu sudah punya user di database (hasil seeder User sebelumnya)
        $users = User::limit(3)->get();

        if ($users->count() > 0) {
            $koordinator = $users->first();

            // Masukkan user ke grup (tabel pivot ronda_group_members)
            foreach ($users as $user) {
                $grupMacan->members()->attach($user->user_id, ['id' => Str::uuid()]);
            }

            // 4. Buat Jadwal Ronda untuk Hari Ini
            $schedule = RondaSchedule::create([
                'group_id' => $grupMacan->group_id,
                'coordinator_id' => $koordinator->user_id,
                'schedule_date' => now()->toDateString(),
                'shift_start' => Carbon::now()->setHour(21)->setMinute(0), // Jam 9 malam
                'shift_end' => Carbon::now()->addDay()->setHour(3)->setMinute(0), // Jam 3 pagi
                'status' => 'SCHEDULED'
            ]);

            // 5. Hubungkan Jadwal dengan Checkpoint (tabel pivot schedule_checkpoints)
            $schedule->checkpoints()->attach([
                $posUtama->checkpoint_id => ['id' => (string) Str::uuid()],
                $blokC->checkpoint_id => ['id' => (string) Str::uuid()]
            ]);
        }
    }
}
