import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import RondaRouteMap from '@/components/ronda/RondaRouteMap';
import { useRondaHistoryDetail } from '@/hooks/useRonda';
import { ArrowLeft, MapPin, QrCode, Users } from 'lucide-react';

const formatDate = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : '-';

const formatTime = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
    : '-';

const formatDuration = (value) => {
    const seconds = Number(value ?? 0);

    if (!seconds) return '-';

    const minutes = Math.floor(seconds / 60);
    const remainSeconds = seconds % 60;

    if (minutes && remainSeconds) return `${minutes}m ${remainSeconds}d`;
    if (minutes) return `${minutes}m`;

    return `${remainSeconds}d`;
};

const userName = (user) => user?.full_name ?? user?.name ?? '-';

const pathPointsFromLog = (detail) => {
    if (Array.isArray(detail?.path_data) && detail.path_data.length > 0) {
        return detail.path_data
            .map((point, index) => ({
                id: `path-${index}`,
                name: point.name ?? `Titik ${index + 1}`,
                lat: Number(point.lat),
                lng: Number(point.lng),
                time: point.time,
            }))
            .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
    }

    return [];
};

const checkpointPointsFromLog = (detail) => {
    const scannedIds = new Set((detail?.checkpoint_logs ?? []).map((log) => log.checkpoint_id));

    return (detail?.checkpoints ?? []).map((checkpoint) => ({
        id: checkpoint.checkpoint_id,
        name: checkpoint.name,
        lat: Number(checkpoint.latitude),
        lng: Number(checkpoint.longitude),
        scanned: scannedIds.has(checkpoint.checkpoint_id),
    }));
};

export default function DetailRiwayatRondaPage() {
    const params = new URLSearchParams(window.location.search);
    const logId = params.get('id');
    const { data: detail, isLoading, isError } = useRondaHistoryDetail(logId);
    const pathPoints = useMemo(() => pathPointsFromLog(detail), [detail]);
    const checkpointPoints = useMemo(() => checkpointPointsFromLog(detail), [detail]);

    return (
        <DashboardLayout>
            <Head title="Detail Riwayat Ronda - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Riwayat Ronda</h1>
                        <p className="mt-2 text-sm font-medium text-gray-500">Data detail dari ronda log terpilih.</p>
                    </div>
                    <Link href="/ronda/riwayat">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 size-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                {isLoading && <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">Memuat detail riwayat ronda...</div>}
                {isError && <div className="rounded-lg border bg-white p-6 text-sm text-red-600">Gagal memuat detail riwayat ronda.</div>}

                {!isLoading && !isError && detail && (
                    <>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-lg border bg-white p-4">
                                <div className="text-sm text-slate-500">Tanggal</div>
                                <div className="mt-1 font-semibold text-slate-900">{formatDate(detail.session_date)}</div>
                            </div>
                            <div className="rounded-lg border bg-white p-4">
                                <div className="text-sm text-slate-500">Kelompok</div>
                                <div className="mt-1 font-semibold text-slate-900">{detail.group?.name ?? '-'}</div>
                            </div>
                            <div className="rounded-lg border bg-white p-4">
                                <div className="text-sm text-slate-500">Koordinator</div>
                                <div className="mt-1 font-semibold text-slate-900">{userName(detail.coordinator)}</div>
                            </div>
                            <div className="rounded-lg border bg-white p-4">
                                <div className="text-sm text-slate-500">Status</div>
                                <Badge className="mt-1 bg-[#00468B]">Selesai</Badge>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border bg-white p-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500"><Users className="size-4" /> Kehadiran</div>
                                <div className="mt-1 text-2xl font-bold text-slate-900">{detail.attendances?.length ?? 0}</div>
                            </div>
                            <div className="rounded-lg border bg-white p-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500"><QrCode className="size-4" /> Checkpoint</div>
                                <div className="mt-1 text-2xl font-bold text-slate-900">{detail.checkpoint_logs?.length ?? 0}/{detail.checkpoints?.length ?? 0}</div>
                            </div>
                            <div className="rounded-lg border bg-white p-4">
                                <div className="text-sm text-slate-500">Jarak / Durasi</div>
                                <div className="mt-1 text-2xl font-bold text-slate-900">{Number(detail.distance_covered ?? 0).toFixed(2)} km · {formatDuration(detail.duration)}</div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-white p-4">
                            <div className="mb-4 flex items-center gap-2">
                                <MapPin className="size-5 text-[#00468B]" />
                                <div>
                                    <p className="font-semibold text-slate-900">Rute Ronda</p>
                                    <p className="text-sm text-slate-500">Path jadi garis, checkpoint jadi titik. Map bisa digeser.</p>
                                </div>
                            </div>
                            <RondaRouteMap pathPoints={pathPoints} checkpointPoints={checkpointPoints} />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded-lg border bg-white">
                                <div className="border-b p-4 font-semibold text-slate-900">Presensi</div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Waktu Scan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(detail.attendances ?? []).map((attendance) => (
                                            <TableRow key={attendance.attendance_id}>
                                                <TableCell>{userName(attendance.user)}</TableCell>
                                                <TableCell>{formatTime(attendance.scanned_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {(detail.attendances ?? []).length === 0 && (
                                            <TableRow><TableCell colSpan={2} className="py-6 text-center text-slate-500">Belum ada presensi.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="rounded-lg border bg-white">
                                <div className="border-b p-4 font-semibold text-slate-900">Scan Checkpoint</div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Checkpoint</TableHead>
                                            <TableHead>Petugas</TableHead>
                                            <TableHead>Waktu</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(detail.checkpoint_logs ?? []).map((log) => (
                                            <TableRow key={log.log_id}>
                                                <TableCell>{log.checkpoint?.name ?? '-'}</TableCell>
                                                <TableCell>{userName(log.scanner)}</TableCell>
                                                <TableCell>{formatTime(log.scanned_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {(detail.checkpoint_logs ?? []).length === 0 && (
                                            <TableRow><TableCell colSpan={3} className="py-6 text-center text-slate-500">Belum ada scan checkpoint.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
