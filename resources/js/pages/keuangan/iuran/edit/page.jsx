import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DataPagination from '@/components/common/DataPagination';
import QrPreview from '@/components/common/QrPreview';
import { usePagination } from '@/hooks/usePagination';
import { useCreateIuranPayment, useDeleteIuranPayment, useIuranPeriodPayments, useUpdateIuranPeriod } from '@/hooks/useIuran';
import { ArrowLeft, CheckCircle2, Circle, QrCode, Save, Search, Users, WalletCards, XCircle } from 'lucide-react';

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(value ?? 0);

const formatDate = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
    : '-';

const familyName = (family) => family?.head_of_family?.full_name
    ?? family?.members?.[0]?.full_name
    ?? 'Keluarga tanpa kepala';

const familyAddress = (family) => family?.household
    ? `Blok ${family.household.block_number} No. ${family.household.house_number}`
    : '-';

export default function EditIuranPage() {
    const periodId = new URLSearchParams(window.location.search).get('id');
    const [search, setSearch] = useState('');
    const [periodForm, setPeriodForm] = useState({
        period_name: '',
        month: '',
        year: '',
        amount_per_family: '',
    });
    const { data, isLoading, isError } = useIuranPeriodPayments(periodId);
    const createPayment = useCreateIuranPayment();
    const deletePayment = useDeleteIuranPayment();
    const updatePeriod = useUpdateIuranPeriod();
    const period = data?.period;
    const payments = data?.payments ?? [];

    useEffect(() => {
        if (!period) return;

        setPeriodForm({
            period_name: period.period_name ?? '',
            month: String(period.month ?? ''),
            year: String(period.year ?? ''),
            amount_per_family: String(Math.trunc(Number(period.amount_per_family ?? 0))),
        });
    }, [period]);

    const filteredPayments = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return payments.filter((item) => (
            [
                familyName(item.family),
                familyAddress(item.family),
                item.family?.qr_code_data,
                item.payer?.full_name,
                item.payment_qr_code,
                item.is_paid ? 'lunas' : 'belum bayar',
            ].some((value) => String(value ?? '').toLowerCase().includes(keyword))
        ));
    }, [payments, search]);

    const pagination = usePagination(filteredPayments, 10);
    const paidCount = payments.filter((item) => item.is_paid).length;
    const totalAmount = paidCount * Number(period?.amount_per_family ?? 0);
    const isMutating = createPayment.isPending || deletePayment.isPending || updatePeriod.isPending;

    const markPaid = async (item) => {
        const payerId = item.family?.head_of_family_id ?? item.family?.members?.[0]?.user_id;
        if (!payerId) return;

        await createPayment.mutateAsync({
            payment_id: item.payment_id ?? undefined,
            period_id: item.period_id,
            family_id: item.family_id,
            paid_by_user_id: payerId,
            amount_paid: Number(period?.amount_per_family ?? 0),
        });
    };

    const cancelPaid = async (item) => {
        if (!item.payment_id) return;
        await deletePayment.mutateAsync({ paymentId: item.payment_id, periodId: item.period_id });
    };

    const submitPeriod = async (event) => {
        event.preventDefault();
        if (!periodId) return;

        await updatePeriod.mutateAsync({
            periodId,
            payload: {
                period_name: periodForm.period_name,
                month: Number(periodForm.month),
                year: Number(periodForm.year),
                amount_per_family: Number(String(periodForm.amount_per_family).replace(/[^\d]/g, '')),
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Kelola Iuran - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex items-start gap-3">
                    <Link href="/keuangan/iuran" className="rounded-full p-2 transition-colors hover:bg-gray-100">
                        <ArrowLeft className="size-5 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Pembayaran Iuran</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Checklist keluarga yang sudah membayar dan lihat QR pembayaran per keluarga.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <WalletCards className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Periode</p>
                                <p className="text-lg font-semibold text-slate-900">{period?.period_name ?? '-'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <CheckCircle2 className="size-9 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Sudah bayar</p>
                                <p className="text-2xl font-semibold text-slate-900">{paidCount}/{payments.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Users className="size-9 rounded-lg bg-slate-100 p-2 text-slate-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total diterima</p>
                                <p className="text-lg font-semibold text-slate-900">{formatCurrency(totalAmount)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <form onSubmit={submitPeriod} className="rounded-lg border bg-white p-4">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Detail Iuran</h2>
                            <p className="text-sm text-slate-500">Ubah nama, periode, nominal, dan QR periode akan ikut menyesuaikan jika nama berubah.</p>
                        </div>
                        <Button type="submit" disabled={isMutating || !periodId} className="bg-[#00468B] text-white hover:bg-[#003366]">
                            <Save className="size-4" />
                            Simpan Detail
                        </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="period_name">Nama iuran</Label>
                            <Input
                                id="period_name"
                                value={periodForm.period_name}
                                onChange={(event) => setPeriodForm((current) => ({ ...current, period_name: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="month">Bulan</Label>
                            <Input
                                id="month"
                                type="number"
                                min="1"
                                max="12"
                                value={periodForm.month}
                                onChange={(event) => setPeriodForm((current) => ({ ...current, month: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="year">Tahun</Label>
                            <Input
                                id="year"
                                type="number"
                                min="2026"
                                value={periodForm.year}
                                onChange={(event) => setPeriodForm((current) => ({ ...current, year: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="amount_per_family">Nominal per KK</Label>
                            <Input
                                id="amount_per_family"
                                inputMode="numeric"
                                value={periodForm.amount_per_family}
                                onChange={(event) => setPeriodForm((current) => ({ ...current, amount_per_family: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label>QR periode</Label>
                            <div className="rounded-md border bg-slate-50 px-3 py-2 font-mono text-sm text-slate-600">
                                {period?.payment_qr_code ?? '-'}
                            </div>
                        </div>
                    </div>
                </form>

                <div className="rounded-lg border bg-white p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative max-w-xl flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Cari kepala keluarga, alamat, status, atau QR"
                                className="pl-9"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        {period?.payment_qr_code && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <QrCode className="size-4" />
                                        QR Periode
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl bg-white">
                                    <DialogHeader>
                                        <DialogTitle>QR Periode</DialogTitle>
                                    </DialogHeader>
                                    <QrPreview label={period.period_name} value={period.payment_qr_code} />
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Keluarga</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Nominal</TableHead>
                                <TableHead>QR Pembayaran</TableHead>
                                <TableHead className="w-44">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Memuat pembayaran...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-red-600">Gagal memuat pembayaran.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredPayments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Tidak ada data pembayaran.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((item) => (
                                <TableRow key={item.family_id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold text-slate-900">{familyName(item.family)}</p>
                                            <p className="font-mono text-xs text-slate-500">{item.family?.qr_code_data}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{familyAddress(item.family)}</TableCell>
                                    <TableCell>
                                        {item.is_paid ? (
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                                    Lunas
                                                </Badge>
                                                <p className="text-xs text-slate-500">{formatDate(item.paid_at)}</p>
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                                Belum bayar
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{formatCurrency(item.is_paid ? item.amount_paid : period?.amount_per_family)}</TableCell>
                                    <TableCell className="max-w-[220px] truncate font-mono text-xs">{item.payment_qr_code}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="icon" variant="outline" className="size-9" title="QR pembayaran">
                                                        <QrCode className="size-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-xl bg-white">
                                                    <DialogHeader>
                                                        <DialogTitle>QR Pembayaran Keluarga</DialogTitle>
                                                    </DialogHeader>
                                                    <QrPreview label={familyName(item.family)} value={item.payment_qr_code} />
                                                </DialogContent>
                                            </Dialog>
                                            {item.is_paid ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                                    disabled={isMutating}
                                                    onClick={() => cancelPaid(item)}
                                                >
                                                    <XCircle className="size-4" />
                                                    Batalkan
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="bg-[#00468B] text-white hover:bg-[#003366]"
                                                    disabled={isMutating || !item.family?.head_of_family_id}
                                                    onClick={() => markPaid(item)}
                                                >
                                                    <Circle className="size-4" />
                                                    Tandai lunas
                                                </Button>
                                            )}
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
