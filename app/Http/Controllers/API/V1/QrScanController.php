<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Family;
use App\Models\IuranPayment;
use App\Models\IuranPeriod;
use App\Models\TreasuryLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QrScanController extends Controller
{
    public function scan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $code = trim($validated['code']);

        if ($activity = Activity::where('attendance_qr_code', $code)->first()) {
            return $this->recordActivityAttendance($request, $activity);
        }

        if ($family = Family::with(['headOfFamily', 'members'])->where('qr_code_data', $code)->first()) {
            return $this->recordFamilyIuranPayment($request, $family);
        }

        if (str_starts_with($code, 'QR-PAY-')) {
            $family = $this->familyFromPaymentQrCode($code);
            if ($family) {
                return $this->recordFamilyIuranPayment($request, $family);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'QR tidak dikenali untuk presensi atau pembayaran iuran.',
        ], 422);
    }

    private function recordActivityAttendance(Request $request, Activity $activity): JsonResponse
    {
        if ($activity->type !== 'RAPAT') {
            return response()->json([
                'success' => false,
                'message' => 'QR ini bukan QR presensi rapat.',
            ], 400);
        }

        if ($activity->status !== 'ANNOUNCED') {
            return response()->json([
                'success' => false,
                'message' => 'Presensi ditolak. Acara belum dimulai atau sudah selesai.',
            ], 400);
        }

        $user = $request->user();
        $userId = $user->user_id;

        if (!$this->isInvited($activity, $userId)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak termasuk daftar undangan rapat ini.',
            ], 403);
        }

        $alreadyAttended = $activity->participants()
            ->where('activity_participants.user_id', $userId)
            ->exists();

        if ($alreadyAttended) {
            $message = 'Presensi sudah pernah tercatat.';

            return response()->json([
                'success' => true,
                'type' => 'attendance',
                'message' => $message,
                'data' => [
                    'type' => 'attendance',
                    'message' => $message,
                    'activity_title' => $activity->title,
                    'attendee_name' => $user->full_name,
                ],
            ]);
        }

        $activity->participants()->attach($userId, [
            'participant_id' => (string) Str::uuid(),
            'attended_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $message = 'Presensi berhasil dicatat.';

        return response()->json([
            'success' => true,
            'type' => 'attendance',
            'message' => $message,
            'data' => [
                'type' => 'attendance',
                'message' => $message,
                'activity_title' => $activity->title,
                'attendee_name' => $user->full_name,
            ],
        ]);
    }

    private function recordFamilyIuranPayment(Request $request, Family $family): JsonResponse
    {
        $period = IuranPeriod::latest()->first();

        if (!$period) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada periode iuran aktif.',
            ], 422);
        }

        $payer = $family->headOfFamily ?: $family->members->first();

        if (!$payer) {
            return response()->json([
                'success' => false,
                'message' => 'Keluarga ini belum memiliki anggota pembayar.',
            ], 422);
        }

        $payment = IuranPayment::firstOrNew([
            'period_id' => $period->period_id,
            'family_id' => $family->family_id,
        ]);

        $wasPaid = (float) ($payment->amount_paid ?? 0) > 0;

        $payment->fill([
            'period_id' => $period->period_id,
            'family_id' => $family->family_id,
            'paid_by_user_id' => $payer->user_id,
            'amount_paid' => $period->amount_per_family,
            'paid_at' => $payment->paid_at ?? now(),
        ])->save();

        $this->syncPeriodTreasuryLog($period, $request->user()->user_id);

        $message = $wasPaid
            ? 'Iuran keluarga ini sudah tercatat lunas.'
            : 'Pembayaran iuran keluarga berhasil dicatat.';

        return response()->json([
            'success' => true,
            'type' => 'iuran',
            'message' => $message,
            'data' => [
                'type' => 'iuran',
                'message' => $message,
                'period_name' => $period->period_name,
                'family_id' => $family->family_id,
                'family_qr_code' => $family->qr_code_data,
                'payer_name' => $payer->full_name,
                'amount_paid' => (float) $payment->amount_paid,
                'paid_at' => $payment->paid_at,
                'already_paid' => $wasPaid,
            ],
        ]);
    }

    private function familyFromPaymentQrCode(string $code): ?Family
    {
        $period = IuranPeriod::get()
            ->first(fn (IuranPeriod $period) => str_starts_with($code, $period->payment_qr_code . '-FAM-'));

        if (!$period) {
            return null;
        }

        $familyPrefix = Str::lower(Str::after($code, $period->payment_qr_code . '-FAM-'));

        return Family::with(['headOfFamily', 'members'])
            ->get()
            ->first(fn (Family $family) => Str::startsWith(Str::lower($family->family_id), $familyPrefix));
    }

    private function isInvited(Activity $activity, string $userId): bool
    {
        if (!$activity->targetGroups()->exists() && !$activity->invitedUsers()->exists()) {
            return true;
        }

        if ($activity->invitedUsers()->where('users.user_id', $userId)->exists()) {
            return true;
        }

        return User::where('user_id', $userId)
            ->whereHas('citizenGroups', fn ($query) => $query
                ->whereIn('citizen_groups.group_id', $activity->targetGroups()->pluck('citizen_groups.group_id')))
            ->exists();
    }

    private function syncPeriodTreasuryLog(IuranPeriod $period, string $recordedBy): void
    {
        $payments = IuranPayment::where('period_id', $period->period_id)
            ->where('amount_paid', '>', 0)
            ->get(['payment_id', 'amount_paid']);

        $description = $this->iuranSummaryDescription($period);
        $totalPaid = (float) $payments->sum('amount_paid');

        if ($totalPaid <= 0) {
            TreasuryLog::where('source', 'IURAN_WARGA')
                ->where('description', $description)
                ->delete();
            return;
        }

        TreasuryLog::updateOrCreate(
            [
                'source' => 'IURAN_WARGA',
                'description' => $description,
            ],
            [
                'type' => 'INCOME',
                'amount' => $totalPaid,
                'receipt_url' => null,
                'recorded_by' => $recordedBy,
            ]
        );
    }

    private function iuranSummaryDescription(IuranPeriod $period): string
    {
        $months = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        $month = $months[(int) $period->month] ?? $period->period_name;

        return "Rekap pembayaran iuran warga bulan {$month} {$period->year}";
    }
}
