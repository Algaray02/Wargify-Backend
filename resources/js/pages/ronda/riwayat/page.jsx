import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useRondaHistory } from '@/hooks/useRonda';

export default function RiwayatRondaPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const { data: history = [], isLoading, isError } = useRondaHistory();

    const formatDate = (value) => value
        ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
        : '-';

    const formatTime = (value) => value
        ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
        : '-';

    const formatDuration = (value) => {
        const seconds = Number(value ?? 0);

        if (!seconds) {
            return '-';
        }

        const minutes = Math.floor(seconds / 60);
        const remainSeconds = seconds % 60;

        if (minutes && remainSeconds) {
            return `${minutes}m ${remainSeconds}d`;
        }

        if (minutes) {
            return `${minutes}m`;
        }

        return `${remainSeconds}d`;
    };

    const statusOptions = [
        { value: 'ALL', label: 'Semua status' },
        { value: 'COMPLETED', label: 'Selesai' },
    ];

    const riwayatData = useMemo(() => {
        return history
            .map((item) => ({
                id: item.log_id ?? `${item.schedule_id}-${item.session_date}`,
                tanggal: formatDate(item.session_date),
                kehadiran: item.attendance_count ?? 0,
                checkpoint: item.checkpoint_logs_count ?? 0,
                kelompok: item.group_name ?? '-',
                waktu: formatTime(item.created_at),
                status: 'Selesai',
                statusRaw: 'COMPLETED',
                jarak: `${Number(item.distance_covered ?? 0).toFixed(2)} km`,
                durasi: formatDuration(item.duration),
            }))
            .filter((riwayat) => {
                const keyword = search.toLowerCase();
                const matchesSearch = [riwayat.tanggal, riwayat.kelompok, riwayat.status, riwayat.jarak, riwayat.durasi, riwayat.checkpoint, riwayat.kehadiran]
                    .some((value) => String(value).toLowerCase().includes(keyword));
                const matchesStatus = statusFilter === 'ALL' || riwayat.statusRaw === statusFilter;

                return matchesSearch && matchesStatus;
            });
    }, [history, search, statusFilter]);

    const pagination = usePagination(riwayatData, 10);

    return (
        <DashboardLayout>
            <Head title="Riwayat Ronda - Wargify" />

            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Riwayat Pelaksanaan Ronda</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                        Data ambil dari ronda logs yang sudah benar-benar berjalan.
                    </p>
                </div>

                <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_190px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari tanggal, kelompok, status, checkpoint, jarak, atau durasi"
                            className="bg-white pl-9"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-white">
                            {statusOptions.find((option) => option.value === statusFilter)?.label ?? 'Semua status'}
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground">Tanggal</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Kehadiran</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Checkpoint</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Jarak</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Durasi</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Kelompok</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Waktu</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-8 text-center text-slate-500">Memuat riwayat ronda...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-8 text-center text-red-600">Gagal memuat riwayat ronda.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && riwayatData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-8 text-center text-slate-500">Tidak ada riwayat ronda.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((riwayat) => (
                                <TableRow key={riwayat.id}>
                                    <TableCell className="font-medium">{riwayat.tanggal}</TableCell>
                                    <TableCell>{riwayat.kehadiran}</TableCell>
                                    <TableCell>{riwayat.checkpoint}</TableCell>
                                    <TableCell>{riwayat.jarak}</TableCell>
                                    <TableCell>{riwayat.durasi}</TableCell>
                                    <TableCell>{riwayat.kelompok}</TableCell>
                                    <TableCell>{riwayat.waktu}</TableCell>
                                    <TableCell>
                                        <Badge variant="default" className="bg-[#00468B]">
                                            {riwayat.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/ronda/riwayat/detail?id=${riwayat.id}`}>
                                            <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Lihat
                                            </Button>
                                        </Link>
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
