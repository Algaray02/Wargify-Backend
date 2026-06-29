import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import RondaRouteMap from '@/components/ronda/RondaRouteMap';
import { useRondaSchedules } from '@/hooks/useRonda';
import { ArrowLeft, CheckCircle2, Clock3, MapPin, QrCode, Users } from 'lucide-react';

const formatDate = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : '-';

const formatTime = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
    : '-';

const durationLabel = (start, end) => {
    if (!start || !end) return '-';
    const minutes = Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000));
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${hours}j ${rest}m`;
};

const pathPointsFromSchedule = (schedule) => {
    const pathData = schedule?.ronda_log?.path_data ?? schedule?.rondaLog?.path_data;
    return Array.isArray(pathData)
        ? pathData.map((point, index) => ({
            id: `path-${index}`,
            name: point.name ?? `Rute ${index + 1}`,
            lat: Number(point.lat),
            lng: Number(point.lng),
        }))
        : [];
};

const checkpointPointsFromSchedule = (schedule) => {
    const checkpointLogs = schedule?.checkpoint_logs ?? schedule?.checkpointLogs ?? [];
    const scannedIds = new Set(checkpointLogs.map((log) => log.checkpoint_id));

    return (schedule?.checkpoints ?? []).map((checkpoint) => ({
        id: checkpoint.checkpoint_id,
        name: checkpoint.name,
        lat: Number(checkpoint.latitude),
        lng: Number(checkpoint.longitude),
        scanned: scannedIds.has(checkpoint.checkpoint_id),
    }));
};

export default function MonitoringRondaPage() {
    const scheduleId = new URLSearchParams(window.location.search).get('id');
    const { data: schedules = [], isLoading, isError } = useRondaSchedules();
    const schedule = useMemo(() => (
        schedules.find((item) => item.schedule_id === scheduleId) ?? schedules.find((item) => item.status === 'ONGOING') ?? schedules[0]
    ), [scheduleId, schedules]);

    const members = schedule?.group?.members ?? [];
    const attendances = schedule?.attendances ?? [];
    const attendedIds = new Set(attendances.map((attendance) => attendance.user_id));
    const checkpoints = schedule?.checkpoints ?? [];
    const checkpointLogs = schedule?.checkpoint_logs ?? schedule?.checkpointLogs ?? [];
    const rondaLog = schedule?.ronda_log ?? schedule?.rondaLog;
    const pathPoints = pathPointsFromSchedule(schedule);
    const checkpointPoints = checkpointPointsFromSchedule(schedule);

    return (
        <DashboardLayout>
            <Head title="Monitoring Ronda - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex items-start gap-3">
                    <Link href="/ronda/jadwal" className="rounded-full p-2 transition-colors hover:bg-gray-100">
                        <ArrowLeft className="size-5 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Monitoring Ronda</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Pantau jadwal, kehadiran anggota, dan checkpoint yang harus discan.
                        </p>
                    </div>
                </div>

                {isLoading && <p className="rounded-lg border bg-white p-6 text-sm text-slate-500">Memuat monitoring ronda...</p>}
                {isError && <p className="rounded-lg border bg-white p-6 text-sm text-red-600">Gagal memuat monitoring ronda.</p>}
                {!isLoading && !isError && !schedule && <p className="rounded-lg border bg-white p-6 text-sm text-slate-500">Tidak ada jadwal ronda untuk dimonitor.</p>}

                {schedule && (
                    <>
                        <div className="grid gap-3 md:grid-cols-4">
                            <Card className="rounded-lg">
                                <CardContent className="flex items-center gap-3">
                                    <Clock3 className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Jadwal</p>
                                        <p className="text-lg font-semibold text-slate-900">{formatDate(schedule.schedule_date)}</p>
                                        <p className="text-xs text-slate-500">{formatTime(schedule.shift_start)} - {formatTime(schedule.shift_end)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-lg">
                                <CardContent className="flex items-center gap-3">
                                    <Users className="size-9 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Presensi</p>
                                        <p className="text-2xl font-semibold text-slate-900">{attendances.length}/{members.length}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-lg">
                                <CardContent className="flex items-center gap-3">
                                    <MapPin className="size-9 rounded-lg bg-amber-50 p-2 text-amber-700" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Checkpoint</p>
                                        <p className="text-2xl font-semibold text-slate-900">{checkpointLogs.length}/{checkpoints.length}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-lg">
                                <CardContent className="flex items-center gap-3">
                                    <CheckCircle2 className="size-9 rounded-lg bg-slate-100 p-2 text-slate-700" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">Durasi rencana</p>
                                        <p className="text-2xl font-semibold text-slate-900">{rondaLog?.duration ? `${rondaLog.duration}m` : durationLabel(schedule.shift_start, schedule.shift_end)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <div className="overflow-hidden rounded-lg border bg-white">
                                <div className="border-b p-4">
                                    <p className="font-semibold text-slate-900">{schedule.group?.name ?? '-'}</p>
                                    <p className="text-sm text-slate-500">Koordinator: {schedule.coordinator?.full_name ?? '-'}</p>
                                </div>
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Anggota</TableHead>
                                            <TableHead>Telepon</TableHead>
                                            <TableHead className="w-28 text-center">Hadir</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {members.map((member) => (
                                            <TableRow key={member.user_id}>
                                                <TableCell className="font-medium">{member.full_name}</TableCell>
                                                <TableCell>{member.phone_number ?? '-'}</TableCell>
                                                <TableCell className="text-center">
                                                    <Checkbox checked={attendedIds.has(member.user_id)} disabled />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {members.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="py-8 text-center text-slate-500">Kelompok belum punya anggota.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="overflow-hidden rounded-lg border bg-white">
                                <div className="border-b p-4">
                                    <p className="font-semibold text-slate-900">Checkpoint Ronda</p>
                                    <p className="text-sm text-slate-500">Daftar titik yang menjadi rute patroli.</p>
                                </div>
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Lokasi</TableHead>
                                            <TableHead>Tipe</TableHead>
                                            <TableHead>QR</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {checkpoints.map((checkpoint) => (
                                            <TableRow key={checkpoint.checkpoint_id}>
                                                <TableCell className="font-medium">{checkpoint.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={checkpoint.is_main_pos ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}>
                                                        {checkpoint.is_main_pos ? 'Pos utama' : 'Titik patroli'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[220px] truncate font-mono text-xs">
                                                    <QrCode className="mr-1 inline size-3" />
                                                    {checkpoint.qr_code_data}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {checkpoints.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="py-8 text-center text-slate-500">Belum ada checkpoint di jadwal ini.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-white p-4">
                            <div className="mb-4 flex items-center gap-2">
                                <MapPin className="size-5 text-[#00468B]" />
                                <div>
                                    <p className="font-semibold text-slate-900">Rute yang Dilalui</p>
                                    <p className="text-sm text-slate-500">
                                        Jarak {Number(rondaLog?.distance_covered ?? 0).toFixed(2)} km · {pathPoints.length} titik path · {checkpointPoints.length} checkpoint
                                    </p>
                                </div>
                            </div>
                            <RondaRouteMap pathPoints={pathPoints} checkpointPoints={checkpointPoints} />
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
