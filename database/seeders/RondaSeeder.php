<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Checkpoint;
use App\Models\PatrolCheckpointLog;
use App\Models\RondaGroup;
use App\Models\RondaLog;
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
        $completedSchedule = RondaSchedule::create([
            'group_id' => $group->group_id,
            'coordinator_id' => $coordinator->user_id,
            'schedule_date' => now()->subDay()->toDateString(),
            'shift_start' => Carbon::yesterday()->setTime(21, 0),
            'shift_end' => Carbon::today()->setTime(0, 30),
            'status' => 'COMPLETED',
        ]);
        $ongoingSchedule = RondaSchedule::create([
            'group_id' => $group->group_id,
            'coordinator_id' => $coordinator->user_id,
            'schedule_date' => now()->toDateString(),
            'shift_start' => Carbon::today()->setTime(21, 0),
            'shift_end' => Carbon::tomorrow()->setTime(0, 30),
            'status' => 'ONGOING',
        ]);

        foreach ([$completedSchedule, $ongoingSchedule] as $schedule) {
            DB::table('schedule_checkpoints')->insert($checkpoints->map(fn (Checkpoint $checkpoint) => [
                'id' => (string) Str::uuid(),
                'schedule_id' => $schedule->schedule_id,
                'checkpoint_id' => $checkpoint->checkpoint_id,
                'created_at' => now(),
                'updated_at' => now(),
            ])->all());
        }

        DB::table('ronda_attendances')->insert($memberIds->take(3)->map(fn (string $userId, int $index) => [
            'attendance_id' => (string) Str::uuid(),
            'schedule_id' => $completedSchedule->schedule_id,
            'user_id' => $userId,
            'scanned_at' => Carbon::yesterday()->setTime(20, 55)->addMinutes($index * 4),
            'created_at' => now(),
            'updated_at' => now(),
        ])->all());

        DB::table('ronda_attendances')->insert($memberIds->take(2)->map(fn (string $userId, int $index) => [
            'attendance_id' => (string) Str::uuid(),
            'schedule_id' => $ongoingSchedule->schedule_id,
            'user_id' => $userId,
            'scanned_at' => Carbon::today()->setTime(20, 55)->addMinutes($index * 5),
            'created_at' => now(),
            'updated_at' => now(),
        ])->all());

        $this->seedRondaProgress($completedSchedule, $checkpoints, $coordinator->user_id, Carbon::yesterday()->setTime(21, 12), 1.85, 90);
        $this->seedRondaProgress($ongoingSchedule, $checkpoints->take(2), $coordinator->user_id, Carbon::today()->setTime(21, 10), 0.92, 38);
    }

    private function seedRondaProgress(RondaSchedule $schedule, $checkpoints, string $coordinatorId, Carbon $startedAt, float $distance, int $duration): void
    {
        $pathData = $checkpoints->values()->map(function (Checkpoint $checkpoint, int $index) use ($startedAt) {
            return [
                'lat' => (float) $checkpoint->latitude,
                'lng' => (float) $checkpoint->longitude,
                'time' => $startedAt->copy()->addMinutes($index * 18)->toIso8601String(),
                'name' => $checkpoint->name,
            ];
        })->all();

        foreach ($checkpoints->values() as $index => $checkpoint) {
            PatrolCheckpointLog::create([
                'schedule_id' => $schedule->schedule_id,
                'checkpoint_id' => $checkpoint->checkpoint_id,
                'scanned_by' => $coordinatorId,
                'scanned_at' => $startedAt->copy()->addMinutes($index * 18),
            ]);
        }

        RondaLog::create([
            'schedule_id' => $schedule->schedule_id,
            'path_data' => $pathData,
            'distance_covered' => $distance,
            'duration' => $duration,
        ]);
    }
}
