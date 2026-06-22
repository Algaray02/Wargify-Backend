import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarClock, ImageIcon, Pencil, Plus, ReceiptText, Search, Trash2, Users, WalletCards } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  SelectValue,
} from "@/components/ui/select";
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import {
    useCreateTreasuryLog,
    useDeleteTreasuryLog,
    useTreasuryAuditSummary,
    useTreasuryLogs,
    useTreasurySummary,
    useUpdateTreasuryLog,
} from '@/hooks/useTreasury';

const initialForm = {
    type: 'INCOME',
    source: 'IURAN_WARGA',
    amount: '',
    description: '',
    receipt_file: null,
};

const typeOptions = [
    { value: 'ALL', label: 'Semua transaksi' },
    { value: 'INCOME', label: 'Pemasukan' },
    { value: 'EXPENSE', label: 'Pengeluaran' },
];

const sourceOptions = {
    INCOME: [
        { value: 'IURAN_WARGA', label: 'Iuran Warga' },
        { value: 'DONASI_SPONSOR', label: 'Donasi Sponsor' },
        { value: 'DANA_DESA_PEMERINTAH', label: 'Dana Desa Pemerintah' },
        { value: 'LAINNYA', label: 'Lainnya' },
    ],
    EXPENSE: [
        { value: 'PENGELUARAN_RUTIN', label: 'Pengeluaran Rutin' },
        { value: 'PENGELUARAN_DARURAT', label: 'Pengeluaran Darurat' },
        { value: 'LAINNYA', label: 'Lainnya' },
    ],
};

const sourceLabels = [...sourceOptions.INCOME, ...sourceOptions.EXPENSE]
    .reduce((labels, option) => ({ ...labels, [option.value]: option.label }), {});

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(value ?? 0);

const formatDateTime = (value) => value
    ? new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
    : '-';

const typeLabel = (type) => type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran';

export default function CatatanKeuanganPage() {
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [form, setForm] = useState(initialForm);
    const { data: logs = [], isLoading, isError } = useTreasuryLogs(typeFilter);
    const { data: summary } = useTreasurySummary();
    const { data: auditSummary } = useTreasuryAuditSummary();
    const createLog = useCreateTreasuryLog();
    const updateLog = useUpdateTreasuryLog();
    const deleteLog = useDeleteTreasuryLog();

    const filteredLogs = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return logs.filter((log) => [
            typeLabel(log.type),
            sourceLabels[log.source] ?? log.source,
            log.description,
            log.recorder?.full_name,
            formatCurrency(log.amount),
        ].some((value) => String(value ?? '').toLowerCase().includes(keyword)));
    }, [logs, search]);

    const pagination = usePagination(filteredLogs, 10);
    const isMutating = createLog.isPending || updateLog.isPending || deleteLog.isPending;
    const selectedFilterLabel = typeOptions.find((option) => option.value === typeFilter)?.label ?? 'Semua transaksi';
    const audit = auditSummary?.summary;
    const iuranStats = auditSummary?.iuran_stats;

    const updateForm = (field, value) => {
        setForm((current) => {
            if (field === 'type') {
                return {
                    ...current,
                    type: value,
                    source: sourceOptions[value][0].value,
                };
            }

            return { ...current, [field]: value };
        });
    };

    const openCreateDialog = () => {
        setEditingLog(null);
        setForm(initialForm);
        setIsDialogOpen(true);
    };

    const openEditDialog = (log) => {
        setEditingLog(log);
        setForm({
            type: log.type,
            source: log.source,
            amount: String(Math.trunc(Number(log.amount ?? 0))),
            description: log.description ?? '',
            receipt_file: null,
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingLog(null);
        setForm(initialForm);
    };

    const submitForm = async (event) => {
        event.preventDefault();

        const payload = {
            ...form,
            amount: Number(String(form.amount).replace(/[^\d]/g, '')),
        };

        try {
            if (editingLog) {
                await updateLog.mutateAsync({ logId: editingLog.log_id, payload });
            } else {
                await createLog.mutateAsync(payload);
            }
            closeDialog();
        } catch {
            // Toast error ditangani oleh hook.
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteLog.mutateAsync({ logId: deleteTarget.log_id });
        setDeleteTarget(null);
    };

    return (
        <DashboardLayout>
            <Head title="Catatan Keuangan - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Catatan Keuangan</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Lacak pemasukan, pengeluaran, dan bukti transaksi lingkungan.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full bg-white sm:w-[190px]">
                                <SelectValue>{selectedFilterLabel}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button onClick={openCreateDialog} className="bg-[#00468B] text-white hover:bg-[#003366]">
                            <Plus className="size-4" />
                            Tambah Catatan
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-500">Saldo Kas</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(summary?.current_balance)}</p>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-500">Total Pemasukan</p>
                        <p className="mt-1 text-2xl font-black text-green-700">{formatCurrency(summary?.total_income)}</p>
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-500">Total Pengeluaran</p>
                        <p className="mt-1 text-2xl font-black text-red-700">{formatCurrency(summary?.total_expense)}</p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-lg border bg-[#00468B] p-5 text-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-blue-100">Audit bendahara</p>
                                <h2 className="mt-1 text-2xl font-black !text-white">{audit?.current_period_label ?? 'Belum ada periode aktif'}</h2>
                            </div>
                            <CalendarClock className="size-10 rounded-xl bg-white/15 p-2" />
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-lg bg-white/10 p-3">
                                <p className="text-xs text-blue-100">Saldo audit</p>
                                <p className="mt-1 font-bold">{formatCurrency(audit?.current_balance)}</p>
                            </div>
                            <div className="rounded-lg bg-white/10 p-3">
                                <p className="text-xs text-blue-100">Pemasukan</p>
                                <p className="mt-1 font-bold">{formatCurrency(audit?.total_income)}</p>
                            </div>
                            <div className="rounded-lg bg-white/10 p-3">
                                <p className="text-xs text-blue-100">Pengeluaran</p>
                                <p className="mt-1 font-bold">{formatCurrency(audit?.total_expense)}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-blue-100">Diperbarui {audit?.generated_at ?? '-'}</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-lg border bg-white p-4">
                            <div className="flex items-center gap-3">
                                <Users className="size-9 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">KK sudah bayar</p>
                                    <p className="text-2xl font-black text-slate-950">{iuranStats?.sudah_bayar_kk ?? 0}/{iuranStats?.total_kk ?? 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border bg-white p-4">
                            <div className="flex items-center gap-3">
                                <WalletCards className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">Tarif periode aktif</p>
                                    <p className="text-2xl font-black text-slate-950">{formatCurrency(iuranStats?.tariff_per_kk)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Cari jenis, sumber, deskripsi, pencatat, atau nominal"
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
                                <TableHead>Transaksi</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>Sumber</TableHead>
                                <TableHead>Dicatat Oleh</TableHead>
                                <TableHead>Bukti</TableHead>
                                <TableHead className="w-36">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Memuat catatan keuangan...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-red-600">Gagal memuat catatan keuangan.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Belum ada catatan keuangan.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((catatan) => (
                                <TableRow key={catatan.log_id}>
                                    <TableCell>
                                        <div>
                                            <p className={`font-semibold ${catatan.type === 'INCOME' ? 'text-green-700' : 'text-red-700'}`}>
                                                {formatCurrency(catatan.amount)}
                                            </p>
                                            <p className="mt-1 line-clamp-2 max-w-md text-xs text-slate-500">{catatan.description}</p>
                                            <p className="mt-1 text-xs text-slate-400">{formatDateTime(catatan.created_at)}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={catatan.type === 'INCOME' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}>
                                            {typeLabel(catatan.type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{sourceLabels[catatan.source] ?? catatan.source}</TableCell>
                                    <TableCell>{catatan.recorder?.full_name ?? '-'}</TableCell>
                                    <TableCell>
                                        {catatan.receipt_url ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        <ReceiptText className="size-4" />
                                                        Lihat
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl bg-white">
                                                    <DialogHeader>
                                                        <DialogTitle>Bukti Transaksi</DialogTitle>
                                                    </DialogHeader>
                                                    <img
                                                        src={catatan.receipt_url}
                                                        alt="Bukti transaksi"
                                                        className="max-h-[70vh] w-full rounded-lg object-contain"
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs font-medium text-slate-500">
                                                <ImageIcon className="size-4" />
                                                Belum ada
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="outline" className="size-9" title="Edit catatan" onClick={() => openEditDialog(catatan)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="size-9 border-red-200 text-red-700 hover:bg-red-50"
                                                title="Hapus catatan"
                                                disabled={isMutating}
                                                onClick={() => setDeleteTarget(catatan)}
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
                    <DialogContent className="bg-white p-6 sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingLog ? 'Edit Catatan Kas' : 'Tambah Catatan Kas'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitForm} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Jenis</Label>
                                    <Select value={form.type} onValueChange={(value) => updateForm('type', value)}>
                                        <SelectTrigger>
                                            <SelectValue>{typeLabel(form.type)}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INCOME">Pemasukan</SelectItem>
                                            <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Sumber</Label>
                                    <Select value={form.source} onValueChange={(value) => updateForm('source', value)}>
                                        <SelectTrigger>
                                            <SelectValue>{sourceLabels[form.source] ?? 'Pilih sumber'}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sourceOptions[form.type].map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Jumlah</Label>
                                <Input
                                    id="amount"
                                    inputMode="numeric"
                                    value={form.amount}
                                    onChange={(event) => updateForm('amount', event.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(event) => updateForm('description', event.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="receipt_file">Bukti transaksi</Label>
                                <Input
                                    id="receipt_file"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => updateForm('receipt_file', event.target.files?.[0] ?? null)}
                                />
                                <p className="text-xs text-slate-500">
                                    Upload foto kwitansi/nota. Jika edit tanpa file baru, bukti lama tetap dipakai.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2">
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
                            <AlertDialogTitle>Hapus catatan kas?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Catatan {deleteTarget ? sourceLabels[deleteTarget.source] ?? deleteTarget.source : ''} sebesar {deleteTarget ? formatCurrency(deleteTarget.amount) : ''} akan dihapus permanen dari pencatatan kas.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isMutating}>Batal</AlertDialogCancel>
                            <AlertDialogAction disabled={isMutating} onClick={handleDelete}>
                                Hapus Catatan
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
