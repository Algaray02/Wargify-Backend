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
        DB::statement('TRUNCATE TABLE ronda_logs CASCADE');
        DB::statement('TRUNCATE TABLE patrol_checkpoint_logs CASCADE');
        DB::statement('TRUNCATE TABLE ronda_attendances CASCADE');
        DB::statement('TRUNCATE TABLE schedule_checkpoints CASCADE');
        DB::statement('TRUNCATE TABLE ronda_schedules CASCADE');
        DB::statement('TRUNCATE TABLE ronda_group_members CASCADE');
        DB::statement('TRUNCATE TABLE ronda_groups CASCADE');
        DB::statement('TRUNCATE TABLE checkpoints CASCADE');

        $posUtama = Checkpoint::create([
            'name' => 'Pos Ronda Utama',
            'latitude' => -7.04830000,
            'longitude' => 110.43810000,
            'qr_code_data' => 'QR-RONDA-POS-UTAMA',
            'is_main_pos' => true,
        ]);

        $gerbangBlokA = Checkpoint::create([
            'name' => 'Gerbang Blok A',
            'latitude' => -7.04795000,
            'longitude' => 110.43905000,
            'qr_code_data' => 'QR-RONDA-GERBANG-A',
            'is_main_pos' => false,
        ]);

        $tamanWarga = Checkpoint::create([
            'name' => 'Taman Warga',
            'latitude' => -7.04885000,
            'longitude' => 110.43960000,
            'qr_code_data' => 'QR-RONDA-TAMAN',
            'is_main_pos' => false,
        ]);

        $group = RondaGroup::create([
            'name' => 'Regu Ronda A',
        ]);

        $users = User::whereIn('role', ['KETUA_RT', 'WARGA', 'BENDAHARA'])
            ->orderByRaw("case role when 'KETUA_RT' then 0 when 'WARGA' then 1 when 'BENDAHARA' then 2 else 3 end")
            ->limit(4)
            ->get();

        if ($users->isEmpty()) {
            return;
        }

        $coordinator = $users->firstWhere('role', 'KETUA_RT') ?? $users->first();
        $memberIds = $users->pluck('user_id')->values();

        foreach ($memberIds as $userId) {
            DB::table('ronda_group_members')->insert([
                'id' => (string) Str::uuid(),
                'group_id' => $group->group_id,
                'user_id' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $checkpoints = collect([$posUtama, $gerbangBlokA, $tamanWarga]);
        $schedules = collect(range(1, 6))->map(function (int $offset) use ($group, $coordinator) {
            $date = Carbon::today()->addDays($offset);

            return RondaSchedule::create([
                'group_id' => $group->group_id,
                'coordinator_id' => $coordinator->user_id,
                'schedule_date' => $date->toDateString(),
                'shift_start' => $date->copy()->setTime(21, 0),
                'shift_end' => $date->copy()->addDay()->setTime(0, 30),
                'status' => 'SCHEDULED',
            ]);
        });

        foreach ($schedules as $schedule) {
            DB::table('schedule_checkpoints')->insert($checkpoints->map(fn (Checkpoint $checkpoint) => [
                'id' => (string) Str::uuid(),
                'schedule_id' => $schedule->schedule_id,
                'checkpoint_id' => $checkpoint->checkpoint_id,
                'created_at' => now(),
                'updated_at' => now(),
            ])->all());
        }
    }
}
