import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, CalendarDays, ImageOff, Megaphone, Pencil, Plus, Search, Send, Trash2, Users, WalletCards } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useAnnouncements, useDeleteAnnouncement, usePublishAnnouncement, useUpdateAnnouncement } from '@/hooks/useAnnouncements';

const statusLabels = {
    DRAFT: 'Draft',
    PUBLISHED: 'Terbit',
};

const categoryMeta = {
    PENTING: { label: 'Penting', className: 'border-red-100 bg-red-50 text-red-700', icon: AlertTriangle },
    KEGIATAN: { label: 'Kegiatan', className: 'border-blue-100 bg-blue-50 text-blue-700', icon: CalendarDays },
    HIMBAUAN: { label: 'Himbauan', className: 'border-amber-100 bg-amber-50 text-amber-700', icon: Megaphone },
    KEUANGAN: { label: 'Keuangan', className: 'border-emerald-100 bg-emerald-50 text-emerald-700', icon: WalletCards },
    LAINNYA: { label: 'Lainnya', className: 'border-slate-100 bg-slate-50 text-slate-700', icon: Megaphone },
};

export default function PengumumanPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', category: 'HIMBAUAN' });
    const [editBannerFile, setEditBannerFile] = useState(null);
    const [editBannerPreview, setEditBannerPreview] = useState(null);
    const [editRemoveBanner, setEditRemoveBanner] = useState(false);
    const { data: announcements = [], isLoading, isError } = useAnnouncements();
    const publishAnnouncement = usePublishAnnouncement();
    const updateAnnouncement = useUpdateAnnouncement();
    const deleteAnnouncement = useDeleteAnnouncement();

    const openEdit = (item) => {
        setEditTarget(item);
        setEditForm({
            title: item.title ?? '',
            content: item.content ?? '',
            category: item.category ?? 'HIMBAUAN',
        });
        setEditBannerFile(null);
        setEditBannerPreview(item.banner_url ?? null);
        setEditRemoveBanner(false);
    };

    const closeEdit = () => {
        setEditTarget(null);
        setEditBannerFile(null);
        setEditBannerPreview(null);
        setEditRemoveBanner(false);
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        const payload = new FormData();
        payload.append('title', editForm.title);
        payload.append('content', editForm.content);
        payload.append('category', editForm.category);

        if (editBannerFile) {
            payload.append('banner_file', editBannerFile);
        } else if (editRemoveBanner) {
            payload.append('banner_url', '');
        }

        await updateAnnouncement.mutateAsync({
            announcementId: editTarget.announcement_id,
            payload,
        });
        closeEdit();
    };

    const handleDelete = async () => {
        await deleteAnnouncement.mutateAsync(deleteTarget.announcement_id);
        setDeleteTarget(null);
    };

    const filteredAnnouncements = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return announcements.filter((item) => {
            const category = categoryMeta[item.category]?.label ?? item.category;
            const matchesSearch = [item.title, item.content, item.creator?.full_name, statusLabels[item.status], category, item.activity?.title]
                .some((value) => String(value ?? '').toLowerCase().includes(keyword));
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [announcements, categoryFilter, search, statusFilter]);

    const pagination = usePagination(filteredAnnouncements, 8);
    const publishedCount = announcements.filter((item) => item.status === 'PUBLISHED').length;
    const categoriesUsed = announcements.reduce((total, item) => total.add(item.category ?? 'HIMBAUAN'), new Set()).size;

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
                                <p className="text-xs font-medium text-slate-500">Kategori aktif</p>
                                <p className="text-2xl font-semibold text-slate-900">{categoriesUsed}</p>
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
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full bg-white text-left lg:w-48">
                            {categoryFilter === 'all' ? 'Semua kategori' : categoryMeta[categoryFilter]?.label}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua kategori</SelectItem>
                            {Object.entries(categoryMeta).map(([value, meta]) => (
                                <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                            ))}
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
                    {pagination.paginatedItems.map((item) => {
                        const category = categoryMeta[item.category] ?? categoryMeta.HIMBAUAN;
                        const CategoryIcon = category.icon;

                        return (
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
                                <div className={`grid size-14 shrink-0 place-items-center rounded-lg border ${category.className}`}>
                                    <CategoryIcon className="size-7" />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="line-clamp-2 text-lg font-bold text-gray-900">{item.title}</h3>
                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            <Badge className={category.className} variant="outline">{category.label}</Badge>
                                            <Badge variant={item.status === 'PUBLISHED' ? 'secondary' : 'outline'}>
                                                {statusLabels[item.status] ?? item.status}
                                            </Badge>
                                        </div>
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
                                            <div className="flex flex-wrap gap-2">
                                                <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                                                    <Pencil className="size-4" />
                                                    Edit
                                                </Button>
                                                <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(item)}>
                                                    <Trash2 className="size-4" />
                                                    Hapus
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#00468B] text-white hover:bg-[#003366]"
                                                    disabled={publishAnnouncement.isPending}
                                                    onClick={() => publishAnnouncement.mutate(item.announcement_id)}
                                                >
                                                    <Send className="size-4" />
                                                    Terbitkan
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )})}
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

            <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && closeEdit()}>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit draf pengumuman</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Judul</Label>
                            <Input
                                id="edit-title"
                                value={editForm.title}
                                onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Kategori</Label>
                            <Select value={editForm.category} onValueChange={(value) => setEditForm((current) => ({ ...current, category: value }))}>
                                <SelectTrigger className="bg-white text-left">
                                    {categoryMeta[editForm.category]?.label ?? 'Pilih kategori'}
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categoryMeta).map(([value, meta]) => (
                                        <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-content">Isi</Label>
                            <Textarea
                                id="edit-content"
                                rows={7}
                                value={editForm.content}
                                onChange={(event) => setEditForm((current) => ({ ...current, content: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Banner</Label>
                            <div className="overflow-hidden rounded-lg border bg-slate-50">
                                <div className="h-48">
                                    {editBannerPreview ? (
                                        <img src={editBannerPreview} alt="Preview banner" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="grid h-full place-items-center text-slate-400">
                                            <div className="text-center">
                                                <ImageOff className="mx-auto size-10" strokeWidth={1.5} />
                                                <p className="mt-2 text-xs font-semibold uppercase tracking-wide">No image</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-white p-3">
                                    <p className="text-xs text-slate-500">
                                        Gambar lama akan dihapus dari Supabase saat diganti.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <label className="inline-flex h-7 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[0.8rem] font-medium transition hover:bg-slate-50">
                                            <Pencil className="size-4" />
                                            Ganti gambar
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(event) => {
                                                    const file = event.target.files?.[0];
                                                    if (!file) return;
                                                    setEditBannerFile(file);
                                                    setEditBannerPreview(URL.createObjectURL(file));
                                                    setEditRemoveBanner(false);
                                                }}
                                            />
                                        </label>
                                        {editBannerPreview && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="border-red-200 text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    setEditBannerFile(null);
                                                    setEditBannerPreview(null);
                                                    setEditRemoveBanner(true);
                                                }}
                                            >
                                                <Trash2 className="size-4" />
                                                Hapus gambar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={closeEdit}>Batal</Button>
                            <Button type="submit" className="bg-[#00468B] text-white hover:bg-[#003366]" disabled={updateAnnouncement.isPending}>
                                Simpan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus draf pengumuman?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Draf "{deleteTarget?.title}" akan dihapus permanen. Pengumuman yang sudah terbit tidak bisa dihapus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteAnnouncement.isPending}>Batal</AlertDialogCancel>
                        <AlertDialogAction disabled={deleteAnnouncement.isPending} onClick={handleDelete}>
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
