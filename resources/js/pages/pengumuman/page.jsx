import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ImageOff, Megaphone, Plus, Search, Send, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useAnnouncements, usePublishAnnouncement } from '@/hooks/useAnnouncements';

const statusLabels = {
    DRAFT: 'Draft',
    PUBLISHED: 'Terbit',
};

export default function PengumumanPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { data: announcements = [], isLoading, isError } = useAnnouncements();
    const publishAnnouncement = usePublishAnnouncement();

    const filteredAnnouncements = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return announcements.filter((item) => {
            const matchesSearch = [item.title, item.content, item.creator?.full_name, statusLabels[item.status], item.activity?.title]
                .some((value) => String(value ?? '').toLowerCase().includes(keyword));
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [announcements, search, statusFilter]);

    const pagination = usePagination(filteredAnnouncements, 8);
    const publishedCount = announcements.filter((item) => item.status === 'PUBLISHED').length;

    return (
        <DashboardLayout>
            <Head title="Daftar Pengumuman - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Daftar Pengumuman</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Kelola informasi warga yang diterbitkan untuk seluruh pengguna.
                        </p>
                    </div>
                    <Link href="/pengumuman/create">
                        <Button className="bg-[#00468B] text-white hover:bg-[#003366]">
                            <Plus className="size-4" />
                            Tambah
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Megaphone className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total pengumuman</p>
                                <p className="text-2xl font-semibold text-slate-900">{announcements.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Send className="size-9 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Sudah terbit</p>
                                <p className="text-2xl font-semibold text-slate-900">{publishedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Users className="size-9 rounded-lg bg-indigo-50 p-2 text-indigo-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Penerima</p>
                                <p className="text-lg font-semibold text-slate-900">Semua pengguna</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari judul, isi, pembuat, status, atau kegiatan"
                            className="pl-9"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full bg-white text-left lg:w-44">
                            {statusFilter === 'all' ? 'Semua status' : statusLabels[statusFilter]}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua status</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PUBLISHED">Terbit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid items-stretch gap-4 lg:grid-cols-2">
                    {isLoading && (
                        <Card className="rounded-lg lg:col-span-2">
                            <CardContent className="py-8 text-center text-sm text-slate-500">Memuat pengumuman...</CardContent>
                        </Card>
                    )}
                    {isError && (
                        <Card className="rounded-lg lg:col-span-2">
                            <CardContent className="py-8 text-center text-sm text-red-600">Gagal memuat pengumuman.</CardContent>
                        </Card>
                    )}
                    {!isLoading && !isError && filteredAnnouncements.length === 0 && (
                        <Card className="rounded-lg lg:col-span-2">
                            <CardContent className="py-8 text-center text-sm text-slate-500">Belum ada pengumuman.</CardContent>
                        </Card>
                    )}
                    {pagination.paginatedItems.map((item) => (
                        <Card key={item.announcement_id} className="flex h-full flex-col rounded-lg">
                            <div className="h-36 overflow-hidden border-b bg-slate-100">
                                {item.banner_url ? (
                                    <img src={item.banner_url} alt={item.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="grid h-full place-items-center text-slate-400">
                                        <div className="text-center">
                                            <ImageOff className="mx-auto size-9" />
                                            <p className="mt-2 text-xs font-semibold uppercase tracking-wide">No image</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <CardContent className="flex flex-1 items-start gap-4 p-5">
                                <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#E6F6FF] text-[#00468B]">
                                    <Megaphone className="size-7" />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="line-clamp-2 text-lg font-bold text-gray-900">{item.title}</h3>
                                        <Badge variant={item.status === 'PUBLISHED' ? 'secondary' : 'outline'}>
                                            {statusLabels[item.status] ?? item.status}
                                        </Badge>
                                    </div>
                                    <p className="line-clamp-3 text-sm leading-6 text-gray-600">{item.content}</p>
                                    <div className="rounded-lg border bg-slate-50 p-3">
                                        <p className="text-xs font-semibold uppercase text-slate-500">Penerima</p>
                                        <p className="mt-1 text-sm font-medium text-slate-800">Seluruh pengguna</p>
                                        {item.activity && (
                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                Dari kegiatan: {item.activity.title}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Dibuat oleh {item.creator?.full_name ?? '-'}
                                        </p>
                                        {item.status !== 'PUBLISHED' && (
                                            <Button
                                                size="sm"
                                                className="bg-[#00468B] text-white hover:bg-[#003366]"
                                                disabled={publishAnnouncement.isPending}
                                                onClick={() => publishAnnouncement.mutate(item.announcement_id)}
                                            >
                                                <Send className="size-4" />
                                                Terbitkan
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
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
