import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRondaSchedules } from '@/hooks/useRonda';
import { ArrowLeft, MapPin, QrCode, Users } from 'lucide-react';

const formatDate = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : '-';

const formatTime = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
    : '-';

const statusLabels = {
    SCHEDULED: 'Terjadwal',
    ONGOING: 'Berlangsung',
    COMPLETED: 'Selesai',
    MISSED: 'Terlewat',
};

const routePointsFromSchedule = (schedule) => {
    const pathData = schedule?.ronda_log?.path_data ?? schedule?.rondaLog?.path_data;
    if (Array.isArray(pathData) && pathData.length > 0) {
        return pathData
            .map((point, index) => ({
                id: `path-${index}`,
                name: point.name ?? `Titik ${index + 1}`,
                lat: Number(point.lat),
                lng: Number(point.lng),
            }))
            .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
    }

    const checkpointLogs = schedule?.checkpoint_logs ?? schedule?.checkpointLogs ?? [];
    if (checkpointLogs.length > 0) {
        return [...checkpointLogs]
            .sort((a, b) => new Date(a.scanned_at) - new Date(b.scanned_at))
            .map((log, index) => ({
                id: log.log_id ?? `log-${index}`,
                name: log.checkpoint?.name ?? `Checkpoint ${index + 1}`,
                lat: Number(log.checkpoint?.latitude),
                lng: Number(log.checkpoint?.longitude),
            }))
            .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
    }

    return (schedule?.checkpoints ?? [])
        .map((checkpoint) => ({
            id: checkpoint.checkpoint_id,
            name: checkpoint.name,
            lat: Number(checkpoint.latitude),
            lng: Number(checkpoint.longitude),
        }))
        .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
};

function RouteMap({ points }) {
    if (points.length === 0) {
        return (
            <div className="grid h-80 place-items-center rounded-lg border border-dashed bg-slate-50 text-sm text-slate-500">
                Belum ada data koordinat untuk digambar.
            </div>
        );
    }

    const width = 600;
    const height = 320;
    const tileSize = 256;
    const minLat = Math.min(...points.map((point) => point.lat));
    const maxLat = Math.max(...points.map((point) => point.lat));
    const minLng = Math.min(...points.map((point) => point.lng));
    const maxLng = Math.max(...points.map((point) => point.lng));
    const center = {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2,
    };
    const project = (point, zoom) => {
        const scale = tileSize * (2 ** zoom);
        const sinLat = Math.sin((point.lat * Math.PI) / 180);

        return {
            x: ((point.lng + 180) / 360) * scale,
            y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
        };
    };
    const zoom = (() => {
        for (let nextZoom = 18; nextZoom >= 12; nextZoom -= 1) {
            const topLeft = project({ lat: maxLat, lng: minLng }, nextZoom);
            const bottomRight = project({ lat: minLat, lng: maxLng }, nextZoom);
            if (Math.abs(bottomRight.x - topLeft.x) <= width - 96 && Math.abs(bottomRight.y - topLeft.y) <= height - 96) {
                return nextZoom;
            }
        }

        return 12;
    })();
    const centerWorld = project(center, zoom);
    const maxTile = 2 ** zoom;
    const centerTileX = Math.floor(centerWorld.x / tileSize);
    const centerTileY = Math.floor(centerWorld.y / tileSize);
    const tiles = [];

    for (let x = centerTileX - 2; x <= centerTileX + 2; x++) {
        for (let y = centerTileY - 2; y <= centerTileY + 2; y++) {
            if (y < 0 || y >= maxTile) continue;
            const wrappedX = ((x % maxTile) + maxTile) % maxTile;
            tiles.push({
                key: `${zoom}-${x}-${y}`,
                src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
                left: width / 2 + (x * tileSize - centerWorld.x),
                top: height / 2 + (y * tileSize - centerWorld.y),
            });
        }
    }
    const projected = points.map((point) => ({
        ...point,
        x: width / 2 + (project(point, zoom).x - centerWorld.x),
        y: height / 2 + (project(point, zoom).y - centerWorld.y),
    }));
    const polyline = projected.map((point) => `${point.x},${point.y}`).join(' ');

    return (
        <div className="overflow-hidden rounded-lg border bg-slate-100">
            <div className="relative h-80">
                <div className="absolute left-1/2 top-1/2 h-[320px] w-[600px] -translate-x-1/2 -translate-y-1/2">
                    {tiles.map((tile) => (
                        <img
                            key={tile.key}
                            src={tile.src}
                            alt=""
                            draggable={false}
                            className="absolute max-w-none select-none"
                            style={{ width: tileSize, height: tileSize, left: tile.left, top: tile.top }}
                        />
                    ))}
                </div>
                <svg viewBox={`0 0 ${width} ${height}`} className="absolute left-1/2 top-1/2 h-[320px] w-[600px] -translate-x-1/2 -translate-y-1/2">
                    <polyline points={polyline} fill="none" stroke="#00468B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={polyline} fill="none" stroke="white" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {projected.map((point, index) => (
                        <g key={point.id}>
                            <circle cx={point.x} cy={point.y} r="11" fill="#00468B" />
                            <circle cx={point.x} cy={point.y} r="5" fill="white" />
                            <text x={point.x + 13} y={point.y - 10} fontSize="12" fontWeight="700" fill="#0f172a" paintOrder="stroke" stroke="white" strokeWidth="3">
                                {index + 1}. {point.name}
                            </text>
                        </g>
                    ))}
                </svg>
                <div className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
                    OpenStreetMap · Zoom {zoom}
                </div>
            </div>
            <div className="border-t bg-white p-3 text-xs text-slate-500">
                Rute digambar dari `ronda_logs.path_data`; jika belum ada, memakai urutan scan checkpoint, lalu fallback ke checkpoint jadwal.
            </div>
        </div>
    );
}

export default function DetailPelaksanaanRondaPage() {
    const scheduleId = new URLSearchParams(window.location.search).get('id');
    const { data: schedules = [], isLoading, isError } = useRondaSchedules();
    const schedule = useMemo(() => schedules.find((item) => item.schedule_id === scheduleId), [scheduleId, schedules]);
    const members = schedule?.group?.members ?? [];
    const attendances = schedule?.attendances ?? [];
    const attendedIds = new Set(attendances.map((attendance) => attendance.user_id));
    const checkpoints = schedule?.checkpoints ?? [];
    const routePoints = routePointsFromSchedule(schedule);

    return (
        <DashboardLayout>
            <Head title="Detail Pelaksanaan Ronda - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex items-start gap-3">
                    <Link href="/ronda/riwayat" className="rounded-full p-2 transition-colors hover:bg-gray-100">
                        <ArrowLeft className="size-5 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Pelaksanaan Ronda</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Detail jadwal, petugas hadir, dan checkpoint yang ditugaskan.
                        </p>
                    </div>
                </div>

                {isLoading && <p className="rounded-lg border bg-white p-6 text-sm text-slate-500">Memuat detail ronda...</p>}
                {isError && <p className="rounded-lg border bg-white p-6 text-sm text-red-600">Gagal memuat detail ronda.</p>}
                {!isLoading && !isError && !schedule && <p className="rounded-lg border bg-white p-6 text-sm text-slate-500">Jadwal ronda tidak ditemukan.</p>}

                {schedule && (
                    <>
                        <div className="grid gap-4 rounded-lg border bg-white p-4 md:grid-cols-4">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Tanggal</p>
                                <p className="mt-1 font-semibold text-slate-900">{formatDate(schedule.schedule_date)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Waktu</p>
                                <p className="mt-1 font-semibold text-slate-900">{formatTime(schedule.shift_start)} - {formatTime(schedule.shift_end)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Koordinator</p>
                                <p className="mt-1 font-semibold text-slate-900">{schedule.coordinator?.full_name ?? '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500">Status</p>
                                <Badge variant="outline" className="mt-1">{statusLabels[schedule.status] ?? schedule.status}</Badge>
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <div className="overflow-hidden rounded-lg border bg-white">
                                <div className="flex items-center gap-2 border-b p-4">
                                    <Users className="size-5 text-[#00468B]" />
                                    <div>
                                        <p className="font-semibold text-slate-900">Anggota Ronda</p>
                                        <p className="text-sm text-slate-500">{attendances.length}/{members.length} anggota hadir</p>
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Telepon</TableHead>
                                            <TableHead className="w-24 text-center">Hadir</TableHead>
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
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="overflow-hidden rounded-lg border bg-white">
                                <div className="flex items-center gap-2 border-b p-4">
                                    <MapPin className="size-5 text-[#00468B]" />
                                    <div>
                                        <p className="font-semibold text-slate-900">Checkpoint</p>
                                        <p className="text-sm text-slate-500">{checkpoints.length} titik pada jadwal ini</p>
                                    </div>
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
                                                <TableCell>{checkpoint.is_main_pos ? 'Pos utama' : 'Titik patroli'}</TableCell>
                                                <TableCell className="max-w-[220px] truncate font-mono text-xs">
                                                    <QrCode className="mr-1 inline size-3" />
                                                    {checkpoint.qr_code_data}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-white p-4">
                            <div className="mb-4 flex items-center gap-2">
                                <MapPin className="size-5 text-[#00468B]" />
                                <div>
                                    <p className="font-semibold text-slate-900">Peta Rute Ronda</p>
                                    <p className="text-sm text-slate-500">
                                        Jarak {schedule.ronda_log?.distance_covered ?? schedule.rondaLog?.distance_covered ?? 0} km · Durasi {schedule.ronda_log?.duration ?? schedule.rondaLog?.duration ?? 0} menit
                                    </p>
                                </div>
                            </div>
                            <RouteMap points={routePoints} />
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
