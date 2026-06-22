import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import {
    useCreateIuranCategory,
    useDeleteIuranCategory,
    useIuranCategories,
    useUpdateIuranCategory,
} from '@/hooks/useIuranCategories';
import { ArrowLeft, Pencil, Plus, Search, Trash2, WalletCards } from 'lucide-react';

const initialForm = {
    name: '',
    slug: '',
    type: 'MONTHLY',
    default_amount: '',
};

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(value ?? 0);

const slugify = (value) => String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function IuranCategoryPage() {
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [form, setForm] = useState(initialForm);

    const { data: categories = [], isLoading, isError } = useIuranCategories();
    const createCategory = useCreateIuranCategory();
    const updateCategory = useUpdateIuranCategory();
    const deleteCategory = useDeleteIuranCategory();

    const filteredCategories = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return categories.filter((category) => [
            category.name,
            category.slug,
            category.type,
            formatCurrency(category.default_amount),
        ].some((value) => String(value ?? '').toLowerCase().includes(keyword)));
    }, [categories, search]);

    const pagination = usePagination(filteredCategories, 10);
    const isMutating = createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;
    const totalMonthly = categories.reduce((sum, category) => sum + Number(category.default_amount ?? 0), 0);

    const updateForm = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
            ...(field === 'name' && !editingCategory ? { slug: slugify(value) } : {}),
        }));
    };

    const openCreateDialog = () => {
        setEditingCategory(null);
        setForm(initialForm);
        setIsDialogOpen(true);
    };

    const openEditDialog = (category) => {
        setEditingCategory(category);
        setForm({
            name: category.name ?? '',
            slug: category.slug ?? '',
            type: category.type ?? 'MONTHLY',
            default_amount: String(Math.trunc(Number(category.default_amount ?? 0))),
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setForm(initialForm);
    };

    const submitForm = async (event) => {
        event.preventDefault();
        const payload = {
            ...form,
            slug: slugify(form.slug || form.name),
            default_amount: Number(String(form.default_amount).replace(/[^\d]/g, '')),
        };

        if (editingCategory) {
            await updateCategory.mutateAsync({ categoryId: editingCategory.category_id, payload });
        } else {
            await createCategory.mutateAsync(payload);
        }
        closeDialog();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteCategory.mutateAsync({ categoryId: deleteTarget.category_id });
        setDeleteTarget(null);
    };

    return (
        <DashboardLayout>
            <Head title="Kategori Iuran - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex items-start gap-3">
                        <Link href="/keuangan/iuran" className="rounded-full p-2 transition-colors hover:bg-gray-100">
                            <ArrowLeft className="size-5 text-gray-900" strokeWidth={2.5} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Kategori Iuran</h1>
                            <p className="mt-2 max-w-2xl text-sm text-gray-500">
                                Atur nama kategori, slug API, tipe, dan nominal default per KK.
                            </p>
                        </div>
                    </div>
                    <Button onClick={openCreateDialog} className="bg-[#00468B] text-white hover:bg-[#003366]">
                        <Plus className="size-4" />
                        Tambah Kategori
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-500">Total kategori</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">{categories.length}</p>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-500">Potensi semua kategori / KK</p>
                        <p className="mt-1 text-2xl font-black text-[#00468B]">{formatCurrency(totalMonthly)}</p>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-500">Dipakai periode</p>
                        <p className="mt-1 text-2xl font-black text-emerald-700">{categories.filter((category) => Number(category.periods_count ?? 0) > 0).length}</p>
                    </div>
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari nama, slug, tipe, atau nominal"
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
                                <TableHead>Kategori</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Default Amount</TableHead>
                                <TableHead>Periode</TableHead>
                                <TableHead className="w-36">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Memuat kategori iuran...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-red-600">Gagal memuat kategori iuran.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredCategories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Belum ada kategori iuran.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((category) => (
                                <TableRow key={category.category_id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <WalletCards className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                                            <p className="font-semibold text-slate-900">{category.name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{category.type}</Badge>
                                    </TableCell>
                                    <TableCell>{formatCurrency(category.default_amount)}</TableCell>
                                    <TableCell>{category.periods_count ?? 0}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="outline" className="size-9" title="Edit kategori" onClick={() => openEditDialog(category)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="size-9 border-red-200 text-red-700 hover:bg-red-50"
                                                title="Hapus kategori"
                                                disabled={isMutating || Number(category.periods_count ?? 0) > 0}
                                                onClick={() => setDeleteTarget(category)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
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

                <Dialog open={isDialogOpen} onOpenChange={(open) => open ? setIsDialogOpen(true) : closeDialog()}>
                    <DialogContent className="bg-white p-6 sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitForm} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input id="name" value={form.name} onChange={(event) => updateForm('name', event.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug" value={form.slug} onChange={(event) => updateForm('slug', event.target.value)} required />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Tipe</Label>
                                    <select id="type" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(event) => updateForm('type', event.target.value)}>
                                        <option value="MONTHLY">MONTHLY</option>
                                        <option value="INCIDENTAL">INCIDENTAL</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Default Amount</Label>
                                    <Input id="amount" inputMode="numeric" value={form.default_amount} onChange={(event) => updateForm('default_amount', event.target.value)} required />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={closeDialog}>Batal</Button>
                                <Button type="submit" disabled={isMutating} className="bg-[#00468B] text-white hover:bg-[#003366]">
                                    {isMutating ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus kategori iuran?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Kategori {deleteTarget?.name} akan dihapus jika belum dipakai periode iuran.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteCategory.isPending}>Batal</AlertDialogCancel>
                            <AlertDialogAction disabled={deleteCategory.isPending} onClick={handleDelete}>
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
