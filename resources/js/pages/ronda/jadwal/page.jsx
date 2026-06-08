import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useRondaSchedules } from '@/hooks/useRonda';
import { CalendarClock, CheckCircle2, MonitorPlay, Plus, Search, Shield, SquarePen, Users } from 'lucide-react';

const statusOptions = [
    { value: 'ALL', label: 'Semua status' },
    { value: 'SCHEDULED', label: 'Terjadwal' },
    { value: 'ONGOING', label: 'Berlangsung' },
    { value: 'COMPLETED', label: 'Selesai' },
    { value: 'MISSED', label: 'Terlewat' },
];

const statusMeta = {
    SCHEDULED: { label: 'Terjadwal', className: 'border-blue-200 bg-blue-50 text-blue-700' },
    ONGOING: { label: 'Berlangsung', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    COMPLETED: { label: 'Selesai', className: 'border-slate-200 bg-slate-50 text-slate-700' },
    MISSED: { label: 'Terlewat', className: 'border-red-200 bg-red-50 text-red-700' },
};

const formatDate = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : '-';

const formatWeekday = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(value))
    : '-';

const formatTime = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
    : '-';

function StatusBadge({ status }) {
    const meta = statusMeta[status] ?? { label: status, className: '' };
    return <Badge variant="outline" className={meta.className}>{meta.label}</Badge>;
}

export default function JadwalRondaPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const { data: schedules = [], isLoading, isError } = useRondaSchedules();

    const filteredSchedules = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return schedules.filter((schedule) => {
            const attendanceCount = schedule.attendances?.length ?? 0;
            const checkpointCount = schedule.checkpoints?.length ?? 0;
            const memberCount = schedule.group?.members?.length ?? 0;
            const matchesStatus = statusFilter === 'ALL' || schedule.status === statusFilter;
            const matchesSearch = [
                formatWeekday(schedule.schedule_date),
                formatDate(schedule.schedule_date),
                schedule.group?.name,
                schedule.coordinator?.full_name,
                statusMeta[schedule.status]?.label,
                `${attendanceCount}/${memberCount}`,
                `${checkpointCount} checkpoint`,
            ].some((value) => String(value ?? '').toLowerCase().includes(keyword));

            return matchesStatus && matchesSearch;
        });
    }, [schedules, search, statusFilter]);

    const pagination = usePagination(filteredSchedules, 10);
    const activeCount = schedules.filter((schedule) => schedule.status === 'ONGOING').length;
    const completedCount = schedules.filter((schedule) => schedule.status === 'COMPLETED').length;

    return (
        <DashboardLayout>
            <Head title="Jadwal Ronda - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Jadwal Ronda</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Atur 7 jadwal mingguan Senin-Minggu yang berlaku seterusnya.
                        </p>
                    </div>
                    <Link href="/ronda/jadwal/create">
                        <Button className="bg-[#00468B] text-white hover:bg-[#003366]">
                            <Plus className="size-4" />
                            Tambah Jadwal
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <CalendarClock className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total jadwal</p>
                                <p className="text-2xl font-semibold text-slate-900">{schedules.length}/7</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Shield className="size-9 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Berlangsung</p>
                                <p className="text-2xl font-semibold text-slate-900">{activeCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <CheckCircle2 className="size-9 rounded-lg bg-slate-100 p-2 text-slate-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Selesai</p>
                                <p className="text-2xl font-semibold text-slate-900">{completedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Users className="size-9 rounded-lg bg-amber-50 p-2 text-amber-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Hasil filter</p>
                                <p className="text-2xl font-semibold text-slate-900">{filteredSchedules.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="grid gap-3 lg:grid-cols-[1fr_190px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Cari hari, kelompok, koordinator, status, presensi, atau checkpoint"
                                className="pl-9"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue>{statusOptions.find((option) => option.value === statusFilter)?.label ?? 'Semua status'}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Jadwal</TableHead>
                                <TableHead>Kelompok</TableHead>
                                <TableHead>Koordinator</TableHead>
                                <TableHead>Presensi</TableHead>
                                <TableHead>Checkpoint</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-44">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-slate-500">Memuat jadwal ronda...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-red-600">Gagal memuat jadwal ronda.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredSchedules.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-slate-500">Tidak ada jadwal ronda.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((schedule) => {
                                const memberCount = schedule.group?.members?.length ?? 0;
                                const attendanceCount = schedule.attendances?.length ?? 0;

                                return (
                                    <TableRow key={schedule.schedule_id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-slate-900">{formatWeekday(schedule.schedule_date)}</p>
                                                <p className="text-xs text-slate-500">Berlaku mingguan · {formatTime(schedule.shift_start)} - {formatTime(schedule.shift_end)}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{schedule.group?.name ?? '-'}</TableCell>
                                        <TableCell>{schedule.coordinator?.full_name ?? '-'}</TableCell>
                                        <TableCell>{attendanceCount}/{memberCount} hadir</TableCell>
                                        <TableCell>{schedule.checkpoints?.length ?? 0} titik</TableCell>
                                        <TableCell><StatusBadge status={schedule.status} /></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/ronda/jadwal/edit?id=${schedule.schedule_id}`}>
                                                    <Button size="icon" variant="outline" className="size-9" title="Kelola jadwal">
                                                        <SquarePen className="size-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/ronda/monitoring?id=${schedule.schedule_id}`}>
                                                    <Button size="icon" className="size-9 bg-[#00468B] text-white hover:bg-[#003366]" title="Monitoring">
                                                        <MonitorPlay className="size-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
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
