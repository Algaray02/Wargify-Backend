import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import DataPagination from '@/components/common/DataPagination';
import QrPreview from '@/components/common/QrPreview';
import { usePagination } from '@/hooks/usePagination';
import { useCreateRondaCheckpoint, useRondaCheckpoints } from '@/hooks/useRonda';
import { Crosshair, MapPin, Minus, Plus, QrCode, Search } from 'lucide-react';

const emptyForm = {
    name: '',
    latitude: '',
    longitude: '',
    qr_code_data: '',
    is_main_pos: false,
};

const defaultCenter = {
    lat: -7.0483,
    lng: 110.4381,
};

function CoordinatePicker({ latitude, longitude, onPick }) {
    const lat = Number(latitude) || defaultCenter.lat;
    const lng = Number(longitude) || defaultCenter.lng;
    const tileSize = 256;
    const mapRef = useRef(null);
    const dragRef = useRef(null);
    const frameRef = useRef(null);
    const pendingCenterRef = useRef(null);
    const [size, setSize] = useState({ width: 640, height: 256 });
    const [center, setCenter] = useState({ lat, lng });
    const [zoom, setZoom] = useState(16);

    useEffect(() => {
        setCenter({ lat, lng });
    }, [lat, lng]);

    useEffect(() => {
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return undefined;

        if (typeof ResizeObserver === 'undefined') {
            const rect = mapRef.current.getBoundingClientRect();
            setSize({
                width: rect.width || 640,
                height: rect.height || 256,
            });
            return undefined;
        }

        const observer = new ResizeObserver(([entry]) => {
            setSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        });

        observer.observe(mapRef.current);
        return () => observer.disconnect();
    }, []);

    const project = (point) => {
        const scale = tileSize * (2 ** zoom);
        const sinLat = Math.sin((point.lat * Math.PI) / 180);

        return {
            x: ((point.lng + 180) / 360) * scale,
            y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
        };
    };

    const unproject = (point) => {
        const scale = tileSize * (2 ** zoom);
        const lngValue = (point.x / scale) * 360 - 180;
        const n = Math.PI - (2 * Math.PI * point.y) / scale;
        const latValue = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

        return { lat: latValue, lng: lngValue };
    };

    const centerWorld = useMemo(() => project(center), [center, zoom]);
    const centerTileX = Math.floor(centerWorld.x / tileSize);
    const centerTileY = Math.floor(centerWorld.y / tileSize);
    const maxTile = 2 ** zoom;
    const tiles = useMemo(() => {
        const horizontal = Math.ceil(size.width / tileSize / 2) + 1;
        const vertical = Math.ceil(size.height / tileSize / 2) + 1;
        const nextTiles = [];

        for (let x = centerTileX - horizontal; x <= centerTileX + horizontal; x++) {
            for (let y = centerTileY - vertical; y <= centerTileY + vertical; y++) {
                if (y < 0 || y >= maxTile) continue;

                const wrappedX = ((x % maxTile) + maxTile) % maxTile;
                nextTiles.push({
                    key: `${zoom}-${x}-${y}`,
                    src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
                    left: size.width / 2 + (x * tileSize - centerWorld.x),
                    top: size.height / 2 + (y * tileSize - centerWorld.y),
                });
            }
        }

        return nextTiles;
    }, [centerTileX, centerTileY, centerWorld.x, centerWorld.y, maxTile, size.height, size.width, zoom]);

    const commitPoint = (point) => {
        onPick(point.lat.toFixed(8), point.lng.toFixed(8));
    };

    const handlePointerDown = (event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            startWorld: project(center),
            moved: false,
            lastCenter: center,
        };
    };

    const handlePointerMove = (event) => {
        if (!dragRef.current) return;
        event.preventDefault();

        const dx = event.clientX - dragRef.current.startX;
        const dy = event.clientY - dragRef.current.startY;

        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            dragRef.current.moved = true;
        }

        if (!dragRef.current.moved) return;

        const nextCenter = unproject({
            x: dragRef.current.startWorld.x - dx,
            y: dragRef.current.startWorld.y - dy,
        });
        dragRef.current.lastCenter = nextCenter;
        pendingCenterRef.current = nextCenter;

        if (!frameRef.current) {
            frameRef.current = requestAnimationFrame(() => {
                if (pendingCenterRef.current) {
                    setCenter(pendingCenterRef.current);
                }
                frameRef.current = null;
            });
        }
    };

    const handlePointerUp = (event) => {
        if (!dragRef.current) return;
        event.preventDefault();

        if (dragRef.current.moved) {
            if (pendingCenterRef.current) {
                setCenter(pendingCenterRef.current);
            }
            commitPoint(dragRef.current.lastCenter);
        } else {
            const rect = event.currentTarget.getBoundingClientRect();
            const clicked = unproject({
                x: centerWorld.x + event.clientX - rect.left - rect.width / 2,
                y: centerWorld.y + event.clientY - rect.top - rect.height / 2,
            });
            setCenter(clicked);
            commitPoint(clicked);
        }

        event.currentTarget.releasePointerCapture(event.pointerId);
        dragRef.current = null;
        pendingCenterRef.current = null;
    };
    const changeZoom = (nextZoom) => setZoom(Math.min(19, Math.max(12, nextZoom)));

    return (
        <div className="space-y-2">
            <div
                ref={mapRef}
                className="relative h-64 touch-none overflow-hidden rounded-lg border bg-slate-100"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => { dragRef.current = null; }}
            >
                {tiles.map((tile) => (
                    <img
                        key={tile.key}
                        src={tile.src}
                        alt=""
                        draggable={false}
                        className="pointer-events-none absolute max-w-none select-none"
                        style={{
                            width: tileSize,
                            height: tileSize,
                            left: tile.left,
                            top: tile.top,
                        }}
                    />
                ))}
                <div className="pointer-events-none absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#00468B] text-white shadow-lg">
                    <MapPin className="size-5" />
                </div>
                <div className="absolute right-2 top-2 flex flex-col overflow-hidden rounded-md border bg-white shadow-sm">
                    <button
                        type="button"
                        className="grid size-9 place-items-center border-b text-slate-700 hover:bg-slate-50"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => changeZoom(zoom + 1)}
                        aria-label="Zoom in"
                    >
                        <Plus className="size-4" />
                    </button>
                    <button
                        type="button"
                        className="grid size-9 place-items-center text-slate-700 hover:bg-slate-50"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => changeZoom(zoom - 1)}
                        aria-label="Zoom out"
                    >
                        <Minus className="size-4" />
                    </button>
                </div>
                <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm">
                    Zoom {zoom} · {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                </div>
            </div>
            <p className="text-xs leading-5 text-slate-500">
                Geser peta untuk memindahkan marker tengah, atau klik titik tertentu untuk memilih koordinat.
            </p>
        </div>
    );
}

export default function CheckpointRondaPage() {
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const { data: checkpoints = [], isLoading, isError } = useRondaCheckpoints();
    const createCheckpoint = useCreateRondaCheckpoint();

    const filteredCheckpoints = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return checkpoints.filter((checkpoint) => [
            checkpoint.name,
            checkpoint.qr_code_data,
            checkpoint.is_main_pos ? 'pos utama' : 'titik patroli',
            checkpoint.latitude,
            checkpoint.longitude,
        ].some((value) => String(value ?? '').toLowerCase().includes(keyword)));
    }, [checkpoints, search]);

    const pagination = usePagination(filteredCheckpoints, 10);
    const mainPosCount = checkpoints.filter((checkpoint) => checkpoint.is_main_pos).length;

    const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
    const pickCoordinate = (latitude, longitude) => setForm((current) => ({
        ...current,
        latitude,
        longitude,
    }));
    const useCurrentLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((position) => {
            pickCoordinate(position.coords.latitude.toFixed(8), position.coords.longitude.toFixed(8));
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        await createCheckpoint.mutateAsync({
            name: form.name,
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
            qr_code_data: form.qr_code_data || undefined,
            is_main_pos: form.is_main_pos,
        });

        setForm(emptyForm);
        setIsDialogOpen(false);
    };

    return (
        <DashboardLayout>
            <Head title="Checkpoint Ronda - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Checkpoint Ronda</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Kelola titik scan QR yang harus dilewati petugas saat ronda.
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#00468B] text-white hover:bg-[#003366]">
                                <Plus className="size-4" />
                                Tambah Checkpoint
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white p-6 sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Tambah Checkpoint</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama lokasi</Label>
                                    <Input id="name" value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Contoh: Pos Ronda Utama" required />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input id="latitude" inputMode="decimal" value={form.latitude} onChange={(event) => updateForm('latitude', event.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input id="longitude" inputMode="decimal" value={form.longitude} onChange={(event) => updateForm('longitude', event.target.value)} required />
                                    </div>
                                </div>
                                <CoordinatePicker latitude={form.latitude} longitude={form.longitude} onPick={pickCoordinate} />
                                <Button type="button" variant="outline" onClick={useCurrentLocation}>
                                    <Crosshair className="size-4" />
                                    Gunakan Lokasi Saya
                                </Button>
                                <div className="grid gap-2">
                                    <Label htmlFor="qr_code_data">Kode QR</Label>
                                    <Input id="qr_code_data" value={form.qr_code_data} onChange={(event) => updateForm('qr_code_data', event.target.value)} placeholder="Kosongkan untuk auto-generate" />
                                </div>
                                <label className="flex items-center justify-between rounded-lg border bg-slate-50 p-3">
                                    <span>
                                        <span className="block text-sm font-medium text-slate-900">Pos utama</span>
                                        <span className="text-xs text-slate-500">Tandai jika titik ini adalah titik kumpul/pos awal.</span>
                                    </span>
                                    <Switch checked={form.is_main_pos} onCheckedChange={(checked) => updateForm('is_main_pos', checked)} />
                                </label>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={createCheckpoint.isPending} className="bg-[#00468B] text-white hover:bg-[#003366]">
                                        {createCheckpoint.isPending ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <MapPin className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total checkpoint</p>
                                <p className="text-2xl font-semibold text-slate-900">{checkpoints.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <QrCode className="size-9 rounded-lg bg-slate-100 p-2 text-slate-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Pos utama</p>
                                <p className="text-2xl font-semibold text-slate-900">{mainPosCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Search className="size-9 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Hasil filter</p>
                                <p className="text-2xl font-semibold text-slate-900">{filteredCheckpoints.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari lokasi, QR, koordinat, atau tipe checkpoint"
                            className="pl-9"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Lokasi</TableHead>
                                <TableHead>Koordinat</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>QR</TableHead>
                                <TableHead className="w-24">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Memuat checkpoint...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-red-600">Gagal memuat checkpoint.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredCheckpoints.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Tidak ada checkpoint.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((checkpoint) => (
                                <TableRow key={checkpoint.checkpoint_id}>
                                    <TableCell className="font-semibold text-slate-900">{checkpoint.name}</TableCell>
                                    <TableCell className="font-mono text-xs text-slate-600">{checkpoint.latitude}, {checkpoint.longitude}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={checkpoint.is_main_pos ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}>
                                            {checkpoint.is_main_pos ? 'Pos utama' : 'Titik patroli'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[260px] truncate font-mono text-xs">{checkpoint.qr_code_data}</TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="outline" className="size-9" title="Lihat QR">
                                                    <QrCode className="size-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-xl bg-white">
                                                <DialogHeader>
                                                    <DialogTitle>QR Checkpoint</DialogTitle>
                                                </DialogHeader>
                                                <QrPreview label={checkpoint.name} value={checkpoint.qr_code_data} />
                                            </DialogContent>
                                        </Dialog>
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
