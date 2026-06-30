<?php

namespace Database\Seeders;

use App\Models\Checkpoint;
use App\Models\RondaGroup;
use App\Models\RondaSchedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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

        DB::table('checkpoints')->insert([
            [
                'checkpoint_id' => '019f113a-711c-71f9-9405-9b4cb7182b65',
                'name' => 'Pos Utama',
                'latitude' => -7.05397191,
                'longitude' => 110.43446323,
                'qr_code_data' => 'QR-RONDA-POS-UTAMA',
                'is_main_pos' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'checkpoint_id' => '019f113d-9a7e-70b1-bf34-8cc7904e9881',
                'name' => 'Pos Kantin Kodok',
                'latitude' => -7.05344781,
                'longitude' => 110.43469464,
                'qr_code_data' => 'QR-RONDA-POS-KANTIN-KODOK-AXYCNO',
                'is_main_pos' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'checkpoint_id' => '019f113d-e299-707c-9acd-3e034c637751',
                'name' => 'Pos Magister Terapan',
                'latitude' => -7.05311488,
                'longitude' => 110.43482041,
                'qr_code_data' => 'QR-RONDA-POS-MAGISTER-TERAPAN-M2NFOW',
                'is_main_pos' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'checkpoint_id' => '019f113e-20dc-713c-9195-9516759da295',
                'name' => 'Pos Kantin Sipil',
                'latitude' => -7.05276957,
                'longitude' => 110.43487567,
                'qr_code_data' => 'QR-RONDA-POS-KANTIN-SIPIL-XCOAD9',
                'is_main_pos' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'checkpoint_id' => '019f113e-ecc3-70e0-bd4f-70dd3d5e74b0',
                'name' => 'Pos Parkiran Elektro',
                'latitude' => -7.05373724,
                'longitude' => 110.43406075,
                'qr_code_data' => 'QR-RONDA-POS-PARKIRAN-ELEKTRO-N5FLS3',
                'is_main_pos' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $warga = User::where('role', 'WARGA')
            ->orderBy('created_at')
            ->limit(5)
            ->get(['user_id']);

        if ($warga->isEmpty()) {
            return;
        }

        $group = RondaGroup::create(['name' => 'Regu Ronda A']);
        foreach ($warga as $member) {
            DB::table('ronda_group_members')->insert([
                'id' => Str::uuid(),
                'group_id' => $group->group_id,
                'user_id' => $member->user_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $monday = Carbon::now('Asia/Jakarta')->previous(Carbon::MONDAY)->startOfDay();
        $checkpointIds = [
            '019f113a-711c-71f9-9405-9b4cb7182b65', '019f113d-9a7e-70b1-bf34-8cc7904e9881', '019f113d-e299-707c-9acd-3e034c637751', '019f113e-20dc-713c-9195-9516759da295', '019f113e-ecc3-70e0-bd4f-70dd3d5e74b0',
        ];

        $schedules = collect();
        for ($dayOffset = 0; $dayOffset < 7; $dayOffset++) {
            $date = $monday->copy()->addDays($dayOffset);
            $coordinator = $warga[$dayOffset % $warga->count()];
            $schedule = RondaSchedule::create([
                'group_id' => $group->group_id,
                'coordinator_id' => $coordinator->user_id,
                'schedule_date' => $date->toDateString(),
                'shift_start' => $date->copy()->setTime(22, 0),
                'shift_end' => $date->copy()->addDay()->setTime(1, 0),
                'status' => $dayOffset === 0 ? 'COMPLETED' : 'ONGOING',
            ]);
            $schedules->push($schedule);

            foreach ($checkpointIds as $checkpointId) {
                DB::table('schedule_checkpoints')->insert([
                    'id' => Str::uuid(),
                    'schedule_id' => $schedule->schedule_id,
                    'checkpoint_id' => $checkpointId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $completedSchedule = $schedules->first();
        $completedDate = $completedSchedule->schedule_date;
        $completedUserId = $completedSchedule->coordinator_id;

        DB::table('ronda_attendances')->insert([
            'attendance_id' => Str::uuid(),
            'schedule_id' => $completedSchedule->schedule_id,
            'session_date' => $completedDate,
            'user_id' => $completedUserId,
            'scanned_at' => Carbon::parse($completedDate . ' 13:07:29'),
            'created_at' => Carbon::parse($completedDate . ' 13:07:29'),
            'updated_at' => Carbon::parse($completedDate . ' 13:07:29'),
        ]);

        foreach ([
            ['019f113a-711c-71f9-9405-9b4cb7182b65', '13:07:29'],
            ['019f113d-9a7e-70b1-bf34-8cc7904e9881', '14:19:24'],
            ['019f113d-e299-707c-9acd-3e034c637751', '14:19:14'],
            ['019f113e-20dc-713c-9195-9516759da295', '14:18:38'],
            ['019f113e-ecc3-70e0-bd4f-70dd3d5e74b0', '14:19:59'],
        ] as [$checkpointId, $time]) {
            DB::table('patrol_checkpoint_logs')->insert([
                'log_id' => Str::uuid(),
                'schedule_id' => $completedSchedule->schedule_id,
                'session_date' => $completedDate,
                'checkpoint_id' => $checkpointId,
                'scanned_by' => $completedUserId,
                'scanned_at' => Carbon::parse($completedDate . ' ' . $time),
                'created_at' => Carbon::parse($completedDate . ' ' . $time),
                'updated_at' => Carbon::parse($completedDate . ' ' . $time),
            ]);
        }

        $pathData = <<<'JSON'
[{"lat":-7.0526478,"lng":110.4356382,"time":"2026-06-29T16:46:47.217290"},{"lat":-7.0526478,"lng":110.4356382,"time":"2026-06-29T16:46:47.218869"},{"lat":-7.052659,"lng":110.4356049,"time":"2026-06-29T16:46:47.218942"},{"lat":-7.0526477,"lng":110.4356308,"time":"2026-06-29T16:46:47.218973"},{"lat":-7.0526232,"lng":110.4356433,"time":"2026-06-29T16:46:47.218990"},{"lat":-7.052615,"lng":110.4356723,"time":"2026-06-29T16:46:47.219003"},{"lat":-7.0526422,"lng":110.4357023,"time":"2026-06-29T16:46:47.219024"},{"lat":-7.0526524,"lng":110.4356344,"time":"2026-06-29T16:46:47.219041"},{"lat":-7.0526524,"lng":110.4356344,"time":"2026-06-29T16:46:47.219065"},{"lat":-7.0526464,"lng":110.4356335,"time":"2026-06-29T16:46:47.219082"},{"lat":-7.0526464,"lng":110.4356335,"time":"2026-06-29T16:46:47.219096"},{"lat":-7.052664,"lng":110.435645,"time":"2026-06-29T16:46:47.219108"},{"lat":-7.052664,"lng":110.435645,"time":"2026-06-29T16:46:47.219120"},{"lat":-7.0526481,"lng":110.435636,"time":"2026-06-29T16:46:47.219139"},{"lat":-7.0526481,"lng":110.435636,"time":"2026-06-29T16:46:47.219154"},{"lat":-7.052652,"lng":110.4356372,"time":"2026-06-29T16:46:47.219166"},{"lat":-7.052608,"lng":110.4356107,"time":"2026-06-29T16:46:47.219178"},{"lat":-7.05258,"lng":110.435595,"time":"2026-06-29T16:46:47.219191"},{"lat":-7.0526357,"lng":110.4356278,"time":"2026-06-29T16:46:47.219209"},{"lat":-7.0526437,"lng":110.4356309,"time":"2026-06-29T16:46:47.219226"},{"lat":-7.0526437,"lng":110.4356309,"time":"2026-06-29T16:46:47.219238"},{"lat":-7.0526482,"lng":110.4356359,"time":"2026-06-29T16:46:47.219251"},{"lat":-7.0526482,"lng":110.4356359,"time":"2026-06-29T16:46:47.219264"},{"lat":-7.0526522,"lng":110.4356398,"time":"2026-06-29T16:46:47.219282"},{"lat":-7.0526522,"lng":110.4356398,"time":"2026-06-29T16:46:47.219401"},{"lat":-7.0526584,"lng":110.4356395,"time":"2026-06-29T16:46:47.219436"},{"lat":-7.0526584,"lng":110.4356395,"time":"2026-06-29T16:46:47.219452"},{"lat":-7.0526584,"lng":110.4356395,"time":"2026-06-29T16:46:47.219513"},{"lat":-7.0526872,"lng":110.4356372,"time":"2026-06-29T16:46:47.219546"},{"lat":-7.0527107,"lng":110.4356673,"time":"2026-06-29T16:46:47.219566"},{"lat":-7.0527321,"lng":110.4357198,"time":"2026-06-29T16:46:47.219579"},{"lat":-7.0527617,"lng":110.4357456,"time":"2026-06-29T16:46:47.219593"},{"lat":-7.0528205,"lng":110.4357393,"time":"2026-06-29T16:46:47.219605"},{"lat":-7.0528094,"lng":110.4358323,"time":"2026-06-29T16:46:47.219623"},{"lat":-7.0528187,"lng":110.4358859,"time":"2026-06-29T16:46:47.219640"},{"lat":-7.0528466,"lng":110.4358663,"time":"2026-06-29T16:46:47.219653"},{"lat":-7.0528125,"lng":110.4358564,"time":"2026-06-29T16:46:47.219665"},{"lat":-7.0527884,"lng":110.4358094,"time":"2026-06-29T16:46:47.219677"},{"lat":-7.0527487,"lng":110.4357711,"time":"2026-06-29T16:46:47.219694"},{"lat":-7.0527252,"lng":110.4357242,"time":"2026-06-29T16:46:47.219712"},{"lat":-7.052709,"lng":110.4356701,"time":"2026-06-29T16:46:47.219726"},{"lat":-7.0526856,"lng":110.4356396,"time":"2026-06-29T16:46:47.219739"},{"lat":-7.0526331,"lng":110.4356314,"time":"2026-06-29T16:46:47.219751"},{"lat":-7.0526574,"lng":110.435645,"time":"2026-06-29T16:46:47.219768"},{"lat":-7.0526655,"lng":110.4356732,"time":"2026-06-29T16:46:47.219787"},{"lat":-7.0526498,"lng":110.4357364,"time":"2026-06-29T16:46:47.219802"},{"lat":-7.0526932,"lng":110.4357714,"time":"2026-06-29T16:46:47.219814"},{"lat":-7.0527638,"lng":110.435766,"time":"2026-06-29T16:46:47.219826"},{"lat":-7.0527901,"lng":110.43581,"time":"2026-06-29T16:46:47.219838"},{"lat":-7.0527372,"lng":110.4358541,"time":"2026-06-29T16:46:47.219859"},{"lat":-7.0527093,"lng":110.4358557,"time":"2026-06-29T16:46:47.219874"},{"lat":-7.0527004,"lng":110.4358603,"time":"2026-06-29T16:46:47.219887"},{"lat":-7.0527384,"lng":110.4358637,"time":"2026-06-29T16:46:47.219899"},{"lat":-7.0527791,"lng":110.4358526,"time":"2026-06-29T16:46:47.219910"},{"lat":-7.0528015,"lng":110.4358314,"time":"2026-06-29T16:46:47.219929"},{"lat":-7.0528312,"lng":110.4358334,"time":"2026-06-29T16:46:47.219943"},{"lat":-7.0528139,"lng":110.4359244,"time":"2026-06-29T16:46:47.219955"},{"lat":-7.0527657,"lng":110.4360318,"time":"2026-06-29T16:46:47.219968"},{"lat":-7.0522117,"lng":110.436005,"time":"2026-06-29T16:46:47.219980"},{"lat":-7.0519317,"lng":110.43601,"time":"2026-06-29T16:46:47.219999"},{"lat":-7.0517939,"lng":110.435781,"time":"2026-06-29T16:46:47.220017"},{"lat":-7.0515542,"lng":110.4353824,"time":"2026-06-29T16:46:47.220030"},{"lat":-7.0513228,"lng":110.4349943,"time":"2026-06-29T16:46:47.220043"},{"lat":-7.0511106,"lng":110.4346086,"time":"2026-06-29T16:46:47.220055"},{"lat":-7.0509041,"lng":110.4341712,"time":"2026-06-29T16:46:47.220080"},{"lat":-7.0507595,"lng":110.4338733,"time":"2026-06-29T16:46:47.220098"},{"lat":-7.0507991,"lng":110.4336698,"time":"2026-06-29T16:46:47.220110"},{"lat":-7.0512594,"lng":110.4333082,"time":"2026-06-29T16:46:47.220122"},{"lat":-7.0518642,"lng":110.432954,"time":"2026-06-29T16:46:47.220136"},{"lat":-7.0524697,"lng":110.4326975,"time":"2026-06-29T16:46:47.220156"},{"lat":-7.0529806,"lng":110.4324897,"time":"2026-06-29T16:46:47.220174"},{"lat":-7.0532785,"lng":110.432377,"time":"2026-06-29T16:46:47.220188"},{"lat":-7.0535359,"lng":110.4322821,"time":"2026-06-29T16:46:47.220200"},{"lat":-7.0537341,"lng":110.4322002,"time":"2026-06-29T16:46:47.220213"},{"lat":-7.0539198,"lng":110.4322458,"time":"2026-06-29T16:46:47.220231"},{"lat":-7.0540481,"lng":110.432638,"time":"2026-06-29T16:46:47.220247"},{"lat":-7.0541593,"lng":110.43297,"time":"2026-06-29T16:46:47.220260"},{"lat":-7.0542614,"lng":110.433239,"time":"2026-06-29T16:46:47.220272"},{"lat":-7.0543551,"lng":110.4335271,"time":"2026-06-29T16:46:47.220284"},{"lat":-7.0545025,"lng":110.433898,"time":"2026-06-29T16:46:47.220302"},{"lat":-7.0547021,"lng":110.4344612,"time":"2026-06-29T16:46:47.220319"},{"lat":-7.054905,"lng":110.43504,"time":"2026-06-29T16:46:47.220332"},{"lat":-7.0550067,"lng":110.435335,"time":"2026-06-29T16:46:47.220345"},{"lat":-7.054895,"lng":110.4354233,"time":"2026-06-29T16:46:47.220357"},{"lat":-7.0546633,"lng":110.435485,"time":"2026-06-29T16:46:47.220386"},{"lat":-7.0544817,"lng":110.4355367,"time":"2026-06-29T16:46:47.220406"},{"lat":-7.0541367,"lng":110.4355933,"time":"2026-06-29T16:46:47.220420"},{"lat":-7.053735,"lng":110.435685,"time":"2026-06-29T16:46:47.220432"},{"lat":-7.0533933,"lng":110.435765,"time":"2026-06-29T16:46:47.220445"},{"lat":-7.0530717,"lng":110.435805,"time":"2026-06-29T16:46:47.220469"},{"lat":-7.052825,"lng":110.4358617,"time":"2026-06-29T16:46:47.220488"},{"lat":-7.05274,"lng":110.43582,"time":"2026-06-29T16:46:47.220501"},{"lat":-7.0527383,"lng":110.4357567,"time":"2026-06-29T16:46:47.220514"},{"lat":-7.0527167,"lng":110.4357283,"time":"2026-06-29T16:46:47.220526"},{"lat":-7.0526917,"lng":110.4357883,"time":"2026-06-29T16:46:47.220543"},{"lat":-7.0527017,"lng":110.43575,"time":"2026-06-29T16:46:47.220561"},{"lat":-7.05272,"lng":110.4357817,"time":"2026-06-29T16:46:47.220575"},{"lat":-7.0527517,"lng":110.4358417,"time":"2026-06-29T16:46:47.220587"},{"lat":-7.0526156,"lng":110.4355835,"time":"2026-06-29T16:46:47.220599"},{"lat":-7.0526449,"lng":110.4356372,"time":"2026-06-29T16:46:47.220611"},{"lat":-7.0526491,"lng":110.4356457,"time":"2026-06-29T16:46:47.220634"},{"lat":-7.0526491,"lng":110.4356457,"time":"2026-06-29T16:46:47.220648"},{"lat":-7.0526491,"lng":110.4356457,"time":"2026-06-29T16:46:47.220661"},{"lat":-7.0526659,"lng":110.4356902,"time":"2026-06-29T16:46:47.220674"},{"lat":-7.0526491,"lng":110.435637,"time":"2026-06-29T16:46:47.220686"},{"lat":-7.0526459,"lng":110.4356275,"time":"2026-06-29T16:46:47.220706"},{"lat":-7.0526502,"lng":110.4356408,"time":"2026-06-29T16:46:47.220718"},{"lat":-7.0526452,"lng":110.435636,"time":"2026-06-29T16:46:47.220758"},{"lat":-7.0526452,"lng":110.435636,"time":"2026-06-29T16:46:47.220773"},{"lat":-7.0526452,"lng":110.435636,"time":"2026-06-29T16:46:47.220785"},{"lat":-7.0526453,"lng":110.4356397,"time":"2026-06-29T16:46:47.220809"},{"lat":-7.0526453,"lng":110.4356397,"time":"2026-06-29T16:46:47.220826"},{"lat":-7.0526523,"lng":110.4356428,"time":"2026-06-29T16:46:47.220840"},{"lat":-7.0526523,"lng":110.4356428,"time":"2026-06-29T16:46:47.220852"},{"lat":-7.0526371,"lng":110.4356397,"time":"2026-06-29T16:46:47.220864"},{"lat":-7.0526461,"lng":110.435639,"time":"2026-06-29T16:46:47.220884"},{"lat":-7.0526461,"lng":110.435639,"time":"2026-06-29T16:46:47.220930"},{"lat":-7.0526406,"lng":110.4356366,"time":"2026-06-29T16:46:47.220946"},{"lat":-7.052646,"lng":110.4356366,"time":"2026-06-29T16:46:47.220959"},{"lat":-7.052646,"lng":110.4356366,"time":"2026-06-29T16:46:47.220972"},{"lat":-7.0526468,"lng":110.4356366,"time":"2026-06-29T16:46:47.220992"},{"lat":-7.0526468,"lng":110.4356366,"time":"2026-06-29T16:46:47.221010"}]
JSON;

        DB::table('ronda_logs')->insert([
            'log_id' => Str::uuid(),
            'schedule_id' => $completedSchedule->schedule_id,
            'session_date' => $completedDate,
            'path_data' => $pathData,
            'distance_covered' => 1.71,
            'duration' => 1332,
            'created_at' => Carbon::parse($completedDate . ' 10:11:16'),
            'updated_at' => Carbon::parse($completedDate . ' 16:46:47'),
        ]);
    }
}
