import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useIuranPeriodPayments, useProcessIuranPayments } from '@/hooks/useIuran';
import { ArrowLeft, CheckCircle2, CircleDollarSign, Search, Users, WalletCards } from 'lucide-react';

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(value ?? 0);

const formatMonth = (tagihan) => {
    if (!tagihan?.month || !tagihan?.year) return '-';
    return new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' })
        .format(new Date(Number(tagihan.year), Number(tagihan.month) - 1, 1));
};

export default function EditIuranPage() {
    const periodId = new URLSearchParams(window.location.search).get('id') || 'all';
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState({});
    const { data: families = [], isLoading, isError } = useIuranPeriodPayments(periodId);
    const processPayments = useProcessIuranPayments();

    const filteredFamilies = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return families.filter((family) => [
            family.full_name,
            family.head_of_family_name,
            family.block_info,
            family.is_paid_global ? 'lunas' : 'belum lunas',
        ].some((value) => String(value ?? '').toLowerCase().includes(keyword)));
    }, [families, search]);

    const pagination = usePagination(filteredFamilies, 8);
    const allBills = families.flatMap((family) => family.tagihan ?? []);
    const paidBills = allBills.filter((bill) => bill.is_paid).length;
    const unpaidBills = allBills.length - paidBills;
    const selectedCount = Object.values(selected).reduce((sum, periodIds) => sum + periodIds.length, 0);

    const familySelected = (familyId) => selected[familyId] ?? [];
    const setFamilySelected = (familyId, periodIds) => {
        setSelected((current) => ({ ...current, [familyId]: periodIds }));
    };

    const toggleBill = (familyId, periodId) => {
        const periodIds = familySelected(familyId);
        setFamilySelected(
            familyId,
            periodIds.includes(periodId)
                ? periodIds.filter((id) => id !== periodId)
                : [...periodIds, periodId],
        );
    };

    const selectUnpaid = (family) => {
        setFamilySelected(
            family.family_id,
            (family.tagihan ?? []).filter((bill) => !bill.is_paid).map((bill) => bill.period_id),
        );
    };

    const processFamily = async (family) => {
        const selectedPeriods = familySelected(family.family_id);
        if (selectedPeriods.length === 0) return;

        await processPayments.mutateAsync({
            family_id: family.family_id,
            selected_periods: selectedPeriods,
        });
        setFamilySelected(family.family_id, []);
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
                            Pilih komponen tagihan keluarga, lalu proses pembayaran ke kas otomatis.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Users className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Keluarga</p>
                                <p className="text-2xl font-semibold text-slate-900">{families.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <CheckCircle2 className="size-9 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Tagihan lunas</p>
                                <p className="text-2xl font-semibold text-slate-900">{paidBills}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <WalletCards className="size-9 rounded-lg bg-amber-50 p-2 text-amber-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Belum lunas</p>
                                <p className="text-2xl font-semibold text-slate-900">{unpaidBills}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <CircleDollarSign className="size-9 rounded-lg bg-slate-100 p-2 text-slate-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Dipilih</p>
                                <p className="text-2xl font-semibold text-slate-900">{selectedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari nama, kepala keluarga, alamat, atau status"
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
                                <TableHead>Keluarga</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tagihan</TableHead>
                                <TableHead className="w-44">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Memuat tagihan...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-red-600">Gagal memuat tagihan.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredFamilies.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Tidak ada tagihan.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((family) => {
                                const selectedPeriods = familySelected(family.family_id);
                                const unpaid = (family.tagihan ?? []).filter((bill) => !bill.is_paid);

                                return (
                                    <TableRow key={family.family_id} className="align-top">
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-slate-900">{family.head_of_family_name}</p>
                                                <p className="text-xs text-slate-500">{family.full_name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{family.block_info}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={family.is_paid_global ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
                                                {family.is_paid_global ? 'Lunas semua' : `${unpaid.length} belum lunas`}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                {(family.tagihan ?? []).map((bill) => (
                                                    <label key={bill.period_id} className={`flex items-start gap-2 rounded-md border p-2 text-xs ${bill.is_paid ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-700'}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="mt-0.5 size-4 accent-[#00468B]"
                                                            disabled={bill.is_paid || processPayments.isPending}
                                                            checked={bill.is_paid || selectedPeriods.includes(bill.period_id)}
                                                            onChange={() => toggleBill(family.family_id, bill.period_id)}
                                                        />
                                                        <span>
                                                            <span className="block font-semibold">{bill.category_name} · {formatMonth(bill)}</span>
                                                            <span>{formatCurrency(bill.amount)} · {bill.is_paid ? 'Lunas' : 'Belum bayar'}</span>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                <Button type="button" variant="outline" size="sm" disabled={unpaid.length === 0 || processPayments.isPending} onClick={() => selectUnpaid(family)}>
                                                    Pilih tunggakan
                                                </Button>
                                                <Button type="button" size="sm" className="bg-[#00468B] text-white hover:bg-[#003366]" disabled={selectedPeriods.length === 0 || processPayments.isPending} onClick={() => processFamily(family)}>
                                                    Proses bayar
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
            </div>
        </DashboardLayout>
    );
}
