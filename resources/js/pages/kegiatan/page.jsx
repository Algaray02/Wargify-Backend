import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DataPagination from '@/components/common/DataPagination';
import SortableTableHead from '@/components/common/SortableTableHead';
import { usePagination } from '@/hooks/usePagination';
import { useActivities, useAnnounceActivity } from '@/hooks/useActivities';
import { CalendarDays, CheckCircle2, ClipboardCheck, Eye, Megaphone, Plus, QrCode, Search, Users } from 'lucide-react';

const statusLabels = {
    DRAFT: 'Belum diumumkan',
    ANNOUNCED: 'Diumumkan',
    COMPLETED: 'Selesai',
};

const typeLabels = {
    RAPAT: 'Rapat',
    KEGIATAN_UMUM: 'Kegiatan Umum',
};

const statusStyles = {
    DRAFT: 'border-amber-200 bg-amber-50 text-amber-700',
    ANNOUNCED: 'border-blue-200 bg-blue-50 text-blue-700',
    COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const formatDate = (value) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const getSortValue = (activity, field) => {
    if (field === 'status') return statusLabels[activity.status] ?? activity.status ?? '';
    if (field === 'type') return typeLabels[activity.type] ?? activity.type ?? '';
    if (field === 'activity_date') return new Date(activity.activity_date ?? 0).getTime();
    if (field === 'participants_count') return Number(activity.participants_count ?? 0);
    if (field === 'targets') return Number(activity.target_groups_count ?? 0) + Number(activity.invited_users_count ?? 0);
    return String(activity[field] ?? '').toLowerCase();
};

const targetSummary = (activity) => {
    const groupCount = activity.target_groups_count ?? activity.target_groups?.length ?? 0;
    const userCount = activity.invited_users_count ?? activity.invited_users?.length ?? 0;
    const total = groupCount + userCount;

    if (total === 0) return 'Semua warga';

    return [
        groupCount ? `${groupCount} kelompok` : null,
        userCount ? `${userCount} warga` : null,
    ].filter(Boolean).join(', ');
};

export default function DaftarKegiatanPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortField, setSortField] = useState('activity_date');
    const [sortDirection, setSortDirection] = useState('desc');
    const { data: activities = [], isLoading, isError } = useActivities();
    const announceActivity = useAnnounceActivity();

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
            return;
        }
        setSortField(field);
        setSortDirection(field === 'activity_date' ? 'desc' : 'asc');
    };

    const filteredActivities = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return activities
            .filter((activity) => {
                const statusLabel = statusLabels[activity.status] ?? activity.status;
                const typeLabel = typeLabels[activity.type] ?? activity.type;
                const targetNames = [
                    ...(activity.target_groups?.map((group) => group.name) ?? []),
                    ...(activity.invited_users?.map((user) => user.full_name) ?? []),
                    targetSummary(activity),
                ];
                const matchesSearch = [activity.title, activity.location_name, statusLabel, typeLabel, activity.household?.qr_code_data, ...targetNames]
                    .some((value) => String(value ?? '').toLowerCase().includes(keyword));
                const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
                const matchesType = typeFilter === 'all' || activity.type === typeFilter;

                return matchesSearch && matchesStatus && matchesType;
            })
            .sort((a, b) => {
                const aValue = getSortValue(a, sortField);
                const bValue = getSortValue(b, sortField);
                const result = typeof aValue === 'number'
                    ? aValue - bValue
                    : String(aValue).localeCompare(String(bValue), 'id-ID');

                return sortDirection === 'asc' ? result : -result;
            });
    }, [activities, search, sortDirection, sortField, statusFilter, typeFilter]);

    const pagination = usePagination(filteredActivities, 10);
    const totalRapat = activities.filter((activity) => activity.type === 'RAPAT').length;
    const totalAbsensi = activities.filter((activity) => activity.type === 'RAPAT' && activity.attendance_qr_code).length;

    return (
        <DashboardLayout>
            <Head title="Daftar Kegiatan - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Daftar Kegiatan</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Kelola agenda warga, pengumuman, dan absensi khusus rapat.
                        </p>
                    </div>
                    <Link href="/kegiatan/create">
                        <Button className="bg-[#00468B] text-white hover:bg-[#003366]">
                            <Plus className="size-4" />
                            Tambah Kegiatan
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <CalendarDays className="size-9 rounded-lg bg-slate-100 p-2 text-slate-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total agenda</p>
                                <p className="text-2xl font-semibold text-slate-900">{activities.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <ClipboardCheck className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Rapat</p>
                                <p className="text-2xl font-semibold text-slate-900">{totalRapat}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <QrCode className="size-9 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">QR absensi aktif</p>
                                <p className="text-2xl font-semibold text-slate-900">{totalAbsensi}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Users className="size-9 rounded-lg bg-indigo-50 p-2 text-indigo-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Agenda bertarget</p>
                                <p className="text-2xl font-semibold text-slate-900">
                                    {activities.filter((activity) => targetSummary(activity) !== 'Semua warga').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari judul, lokasi, tipe, status, target, atau QR"
                            className="pl-9"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full bg-white text-left lg:w-48">
                            {statusFilter === 'all' ? 'Semua status' : statusLabels[statusFilter]}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua status</SelectItem>
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full bg-white text-left lg:w-48">
                            {typeFilter === 'all' ? 'Semua tipe' : typeLabels[typeFilter]}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua tipe</SelectItem>
                            {Object.entries(typeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <SortableTableHead field="title" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Kegiatan</SortableTableHead>
                                <SortableTableHead field="activity_date" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Jadwal</SortableTableHead>
                                <SortableTableHead field="location_name" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Lokasi</SortableTableHead>
                                <SortableTableHead field="type" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Tipe</SortableTableHead>
                                <SortableTableHead field="status" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Status</SortableTableHead>
                                <SortableTableHead field="targets" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Target</SortableTableHead>
                                <SortableTableHead field="participants_count" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Absensi</SortableTableHead>
                                <TableHead className="w-36 font-semibold text-muted-foreground">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-8 text-center text-slate-500">Memuat kegiatan...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-8 text-center text-red-600">Gagal memuat kegiatan.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredActivities.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-8 text-center text-slate-500">Tidak ada kegiatan.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((activity) => (
                                <TableRow key={activity.activity_id}>
                                    <TableCell>
                                        <div className="max-w-xs">
                                            <p className="font-semibold text-slate-900">{activity.title}</p>
                                            <p className="truncate text-xs text-slate-500">{activity.description}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-sm">{formatDate(activity.activity_date)}</TableCell>
                                    <TableCell>
                                        <div className="max-w-[220px]">
                                            <p className="truncate text-sm font-medium text-slate-700">{activity.location_name}</p>
                                            {activity.household && (
                                                <p className="font-mono text-xs text-slate-500">{activity.household.qr_code_data}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{typeLabels[activity.type] ?? activity.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusStyles[activity.status]}>
                                            {statusLabels[activity.status] ?? activity.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[180px]">
                                            <p className="text-sm font-medium text-slate-700">{targetSummary(activity)}</p>
                                            {activity.target_groups?.length > 0 && (
                                                <p className="truncate text-xs text-slate-500">
                                                    {activity.target_groups.map((group) => group.name).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {activity.type === 'RAPAT' ? (
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                                    {activity.participants_count ?? 0} hadir
                                                </Badge>
                                                <p className="text-xs text-slate-500">{activity.attendance_qr_code ? 'QR tersedia' : 'QR belum ada'}</p>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500">Tidak memakai absensi</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {activity.status === 'DRAFT' && (
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="size-9"
                                                    disabled={announceActivity.isPending}
                                                    title="Umumkan"
                                                    onClick={() => announceActivity.mutate(activity.activity_id)}
                                                >
                                                    <Megaphone className="size-4" />
                                                </Button>
                                            )}
                                            <Link href={`/kegiatan/edit?id=${activity.activity_id}`}>
                                                <Button size="icon" variant="outline" className="size-9" title="Kelola">
                                                    {activity.status === 'COMPLETED' ? <Eye className="size-4" /> : <CheckCircle2 className="size-4" />}
                                                </Button>
                                            </Link>
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
