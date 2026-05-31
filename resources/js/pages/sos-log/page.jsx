import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useEmergencyAlerts, useResolveEmergencyAlert } from '@/hooks/useEmergencies';
import { Activity, CheckCircle2, Clock3, ExternalLink, MapPin, Search, ShieldAlert, Siren, TriangleAlert } from 'lucide-react';

const statusLabels = {
    ALL: 'Semua status',
    ACTIVE: 'Aktif',
    RESOLVED: 'Aman',
};

const formatDateTime = (value) => value
    ? new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
    : '-';

const elapsedLabel = (value) => {
    if (!value) return '-';
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
};

function LocationMap({ latitude, longitude, label }) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return (
            <div className="grid h-72 place-items-center rounded-lg border border-dashed bg-slate-50 text-sm text-slate-500">
                Koordinat lokasi tidak tersedia.
            </div>
        );
    }

    const width = 600;
    const height = 300;
    const tileSize = 256;
    const zoom = 17;
    const project = (point) => {
        const scale = tileSize * (2 ** zoom);
        const sinLat = Math.sin((point.lat * Math.PI) / 180);

        return {
            x: ((point.lng + 180) / 360) * scale,
            y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
        };
    };
    const centerWorld = project({ lat, lng });
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

    return (
        <div className="relative h-72 overflow-hidden rounded-lg border bg-slate-100">
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2">
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
                <div className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-full place-items-center rounded-full bg-[#AD1114] text-white shadow-lg shadow-red-950/25">
                    <MapPin className="size-6" />
                </div>
            </div>
            <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] rounded-md bg-white/95 px-3 py-2 shadow-sm">
                <p className="truncate text-xs font-semibold text-slate-900">{label}</p>
                <p className="font-mono text-[11px] text-slate-500">{lat.toFixed(6)}, {lng.toFixed(6)}</p>
            </div>
        </div>
    );
}

function ResolveButton({ alert, resolveAlert }) {
    if (alert.status !== 'ACTIVE') {
        return (
            <Button size="sm" variant="outline" disabled className="h-9 min-w-[116px] justify-center border-emerald-200 bg-emerald-50 text-emerald-700 disabled:opacity-100">
                <CheckCircle2 className="mr-1 size-3" />
                Aman
            </Button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="sm" className="h-9 min-w-[116px] justify-center bg-[#00468B] text-white hover:bg-[#003366]">
                    <CheckCircle2 className="size-4" />
                    Tandai Aman
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tandai SOS sebagai aman?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Status SOS dari {alert.sender?.full_name ?? 'warga'} akan berubah menjadi aman dan waktu penyelesaian akan disimpan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={resolveAlert.isPending}
                        onClick={() => resolveAlert.mutate(alert.alert_id)}
                        className="bg-[#00468B] hover:bg-[#003366]"
                    >
                        {resolveAlert.isPending ? 'Menyimpan...' : 'Ya, tandai aman'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function SoSLogPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const { data: alerts = [], isLoading, isError } = useEmergencyAlerts();
    const resolveAlert = useResolveEmergencyAlert();

    const sortedAlerts = useMemo(() => [...alerts].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'ACTIVE' ? -1 : 1;
        return new Date(b.created_at) - new Date(a.created_at);
    }), [alerts]);
    const activeAlerts = sortedAlerts.filter((alert) => alert.status === 'ACTIVE');
    const resolvedAlerts = sortedAlerts.filter((alert) => alert.status === 'RESOLVED');
    const activeAlert = activeAlerts[0];
    const filteredAlerts = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return sortedAlerts.filter((alert) => {
            const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
            const matchesSearch = [
                alert.sender?.full_name,
                alert.sender?.phone_number,
                alert.message,
                alert.status,
                statusLabels[alert.status],
                alert.latitude,
                alert.longitude,
                formatDateTime(alert.created_at),
            ].some((value) => String(value ?? '').toLowerCase().includes(keyword));

            return matchesStatus && matchesSearch;
        });
    }, [sortedAlerts, search, statusFilter]);
    const pagination = usePagination(filteredAlerts, 8);

    return (
        <DashboardLayout>
            <Head title="SOS Log - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">SOS Log</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Pantau sinyal darurat warga, cek lokasi kejadian, dan tandai aman ketika sudah ditangani.
                        </p>
                    </div>
                    <Badge className={activeAlerts.length > 0 ? 'bg-[#AD1114] text-white' : 'bg-emerald-600 text-white'}>
                        {activeAlerts.length > 0 ? `${activeAlerts.length} SOS aktif` : 'Semua aman'}
                    </Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Siren className="size-10 rounded-lg bg-red-50 p-2 text-[#AD1114]" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">SOS aktif</p>
                                <p className="text-2xl font-semibold text-slate-900">{activeAlerts.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <CheckCircle2 className="size-10 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Sudah aman</p>
                                <p className="text-2xl font-semibold text-slate-900">{resolvedAlerts.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Activity className="size-10 rounded-lg bg-blue-50 p-2 text-[#00468B]" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total laporan</p>
                                <p className="text-2xl font-semibold text-slate-900">{alerts.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
                    <div className={`rounded-lg border p-5 ${activeAlert ? 'border-red-200 bg-red-50' : 'bg-white'}`}>
                        <div className="mb-4 flex items-center gap-3">
                            <div className={`grid size-12 place-items-center rounded-lg ${activeAlert ? 'bg-[#AD1114] text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                                {activeAlert ? <TriangleAlert className="size-6" /> : <ShieldAlert className="size-6" />}
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prioritas terbaru</p>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {activeAlert ? activeAlert.sender?.full_name ?? 'Warga' : 'Tidak ada SOS aktif'}
                                </h2>
                            </div>
                        </div>

                        {activeAlert ? (
                            <div className="space-y-4">
                                <p className="rounded-lg bg-white p-4 text-sm font-medium leading-6 text-slate-800">{activeAlert.message}</p>
                                <div className="grid gap-3 text-sm sm:grid-cols-2">
                                    <div className="rounded-lg bg-white p-3">
                                        <p className="text-xs text-slate-500">Waktu masuk</p>
                                        <p className="mt-1 font-semibold text-slate-900">{formatDateTime(activeAlert.created_at)}</p>
                                    </div>
                                    <div className="rounded-lg bg-white p-3">
                                        <p className="text-xs text-slate-500">Kontak</p>
                                        <p className="mt-1 font-semibold text-slate-900">{activeAlert.sender?.phone_number ?? '-'}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        className="bg-[#AD1114] text-white hover:bg-[#8f0e11]"
                                        onClick={() => window.open(`https://www.google.com/maps?q=${activeAlert.latitude},${activeAlert.longitude}`, '_blank')}
                                    >
                                        <ExternalLink className="size-4" />
                                        Buka Google Maps
                                    </Button>
                                    <ResolveButton alert={activeAlert} resolveAlert={resolveAlert} />
                                </div>
                            </div>
                        ) : (
                            <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                Semua sinyal darurat sudah diselesaikan. Halaman ini tetap otomatis memuat ulang data SOS terbaru dari backend.
                            </p>
                        )}
                    </div>

                    <LocationMap
                        latitude={activeAlert?.latitude}
                        longitude={activeAlert?.longitude}
                        label={activeAlert ? `${activeAlert.sender?.full_name ?? 'Warga'} - ${activeAlert.message}` : 'Lokasi SOS aktif'}
                    />
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="grid gap-3 lg:grid-cols-[1fr_190px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Cari nama warga, pesan, telepon, status, atau koordinat"
                                className="pl-9"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                {statusLabels[statusFilter] ?? 'Semua status'}
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(statusLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Warga</TableHead>
                                <TableHead>Pesan</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[260px] text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Memuat log SOS...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-red-600">Gagal memuat log SOS.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredAlerts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Tidak ada log SOS yang cocok.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((alert) => (
                                <TableRow key={alert.alert_id} className={alert.status === 'ACTIVE' ? 'bg-red-50/60' : ''}>
                                    <TableCell>
                                        <div className="font-semibold text-slate-900">{alert.sender?.full_name ?? '-'}</div>
                                        <div className="text-xs text-slate-500">{alert.sender?.phone_number ?? '-'}</div>
                                    </TableCell>
                                    <TableCell className="max-w-[360px]">
                                        <p className="line-clamp-2 text-sm text-slate-700">{alert.message}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium text-slate-900">{formatDateTime(alert.created_at)}</div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <Clock3 className="size-3" />
                                            {alert.status === 'ACTIVE' ? elapsedLabel(alert.created_at) : `Aman ${formatDateTime(alert.resolved_at)}`}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-600">
                                        {Number(alert.latitude).toFixed(6)}, {Number(alert.longitude).toFixed(6)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={alert.status === 'ACTIVE' ? 'bg-[#AD1114] text-white' : 'bg-emerald-600 text-white'}>
                                            {statusLabels[alert.status] ?? alert.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-9 min-w-[116px] justify-center border-slate-200"
                                                onClick={() => window.open(`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`, '_blank')}
                                            >
                                                <MapPin className="size-4" />
                                                Peta
                                            </Button>
                                            <ResolveButton alert={alert} resolveAlert={resolveAlert} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <DataPagination
                    from={pagination.from}
                    onPageChange={pagination.setPage}
                    page={pagination.page}
                    to={pagination.to}
                    totalItems={pagination.totalItems}
                    totalPages={pagination.totalPages}
                />
            </div>
        </DashboardLayout>
    );
}
