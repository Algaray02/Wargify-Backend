import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import QrPreview from '@/components/common/QrPreview';
import { usePagination } from '@/hooks/usePagination';
import { useFamilies } from '@/hooks/useFamilies';
import { useDeleteIuranPeriod, useIuranPeriods } from '@/hooks/useIuran';
import { CalendarDays, CheckCircle2, Plus, QrCode, Search, SquarePen, Trash2, WalletCards } from 'lucide-react';

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(value ?? 0);

const formatPeriod = (period) => {
    if (!period?.month || !period?.year) return '-';
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
        .format(new Date(Number(period.year), Number(period.month) - 1, 1));
};

export default function DataIuranPage() {
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { data: periods = [], isLoading, isError } = useIuranPeriods();
    const { data: families = [] } = useFamilies();
    const deletePeriod = useDeleteIuranPeriod();

    const filteredPeriods = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return periods.filter((period) => (
            [period.period_name, formatPeriod(period), period.payment_qr_code]
                .some((value) => String(value ?? '').toLowerCase().includes(keyword))
        ));
    }, [periods, search]);

    const pagination = usePagination(filteredPeriods, 10);
    const totalExpected = periods.reduce((sum, period) => sum + Number(period.amount_per_family ?? 0) * families.length, 0);
    const totalPaidFamilies = periods.reduce((sum, period) => sum + Number(period.paid_payments_count ?? 0), 0);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deletePeriod.mutateAsync({ periodId: deleteTarget.period_id });
        setDeleteTarget(null);
    };

    return (
        <DashboardLayout>
            <Head title="Data Iuran - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Data Iuran</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Kelola periode iuran, QR pembayaran, dan checklist pembayaran keluarga.
                        </p>
                    </div>
                    <Link href="/keuangan/iuran/create">
                        <Button className="bg-[#00468B] text-white hover:bg-[#003366]">
                            <Plus className="size-4" />
                            Tambah Iuran
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <CalendarDays className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Periode iuran</p>
                                <p className="text-2xl font-semibold text-slate-900">{periods.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <CheckCircle2 className="size-9 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Pembayaran tercatat</p>
                                <p className="text-2xl font-semibold text-slate-900">{totalPaidFamilies}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <WalletCards className="size-9 rounded-lg bg-slate-100 p-2 text-slate-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Potensi total</p>
                                <p className="text-lg font-semibold text-slate-900">{formatCurrency(totalExpected)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari nama iuran, periode, atau QR"
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
                                <TableHead>Nama Iuran</TableHead>
                                <TableHead>Periode</TableHead>
                                <TableHead>Nominal per KK</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>QR Pembayaran</TableHead>
                                <TableHead className="w-48">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Memuat data iuran...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-red-600">Gagal memuat data iuran.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredPeriods.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Tidak ada data iuran.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((period) => {
                                const paid = Number(period.paid_payments_count ?? 0);
                                const total = families.length;
                                const percentage = total ? Math.round((paid / total) * 100) : 0;

                                return (
                                    <TableRow key={period.period_id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-slate-900">{period.period_name}</p>
                                                <p className="text-xs text-slate-500">Target {total} KK</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatPeriod(period)}</TableCell>
                                        <TableCell>{formatCurrency(period.amount_per_family)}</TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                                        {paid}/{total} lunas
                                                    </Badge>
                                                    <span className="text-xs text-slate-500">{percentage}%</span>
                                                </div>
                                                <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
                                                    <div className="h-full bg-[#00468B]" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[220px] truncate font-mono text-xs">{period.payment_qr_code}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="icon" variant="outline" className="size-9" title="Lihat QR">
                                                            <QrCode className="size-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-xl bg-white">
                                                        <DialogHeader>
                                                            <DialogTitle>QR Pembayaran</DialogTitle>
                                                        </DialogHeader>
                                                        <QrPreview label={period.period_name} value={period.payment_qr_code} />
                                                    </DialogContent>
                                                </Dialog>
                                                <Link href={`/keuangan/iuran/edit?id=${period.period_id}`}>
                                                    <Button size="icon" className="size-9 bg-[#00468B] text-white hover:bg-[#003366]" title="Kelola pembayaran">
                                                        <SquarePen className="size-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="size-9 border-red-200 text-red-700 hover:bg-red-50"
                                                    title="Hapus iuran"
                                                    disabled={deletePeriod.isPending}
                                                    onClick={() => setDeleteTarget(period)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
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

                <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus periode iuran?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Iuran {deleteTarget?.period_name} akan dihapus bersama seluruh pembayaran dan catatan pemasukan otomatis yang terkait.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deletePeriod.isPending}>Batal</AlertDialogCancel>
                            <AlertDialogAction disabled={deletePeriod.isPending} onClick={handleDelete}>
                                Hapus Iuran
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
