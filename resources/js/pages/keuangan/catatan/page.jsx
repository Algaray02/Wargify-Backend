import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReceiptText, Barcode, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTreasuryLog, useTreasuryLogs, useTreasurySummary } from '@/hooks/useTreasury';

export default function CatatanKeuanganPage() {
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState({
        type: 'INCOME',
        source: 'IURAN_WARGA',
        amount: '',
        description: '',
        receipt_url: '',
    });
    const { data: logs = [], isLoading, isError } = useTreasuryLogs(typeFilter);
    const { data: summary } = useTreasurySummary();
    const createLog = useCreateTreasuryLog();

    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value ?? 0);

    const formatDateTime = (value) => value
        ? new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(new Date(value))
        : '-';

    const typeLabel = (type) => type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran';
    const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const handleCreate = async (event) => {
        event.preventDefault();

        try {
            await createLog.mutateAsync({
                ...form,
                amount: Number(String(form.amount).replace(/[^\d]/g, '')),
                receipt_url: form.receipt_url || null,
            });
            setForm({
                type: 'INCOME',
                source: 'IURAN_WARGA',
                amount: '',
                description: '',
                receipt_url: '',
            });
            setIsCreateOpen(false);
        } catch {
            // Toast error ditangani oleh hook useCreateTreasuryLog.
        }
    };

    return (
        <DashboardLayout>
            <Head title="Catatan Keuangan - Wargify" />
            
            <div className="p-8">
                <div className="flex justify-between items-start mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Catatan Keuangan</h1>
                        <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                            Lacak pemasukan, pengeluaran, dan bukti transaksi lingkungan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px] bg-white">
                                <SelectValue placeholder="Semua Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Jenis</SelectItem>
                                <SelectItem value="INCOME">Pemasukan</SelectItem>
                                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                            </SelectContent>
                        </Select>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg bg-white p-6">
                                <DialogHeader>
                                    <DialogTitle>Tambah Catatan Kas</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Jenis</Label>
                                        <Select value={form.type} onValueChange={(value) => updateForm('type', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INCOME">Pemasukan</SelectItem>
                                                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="source">Sumber</Label>
                                        <Input id="source" value={form.source} onChange={(event) => updateForm('source', event.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">Jumlah</Label>
                                        <Input id="amount" inputMode="numeric" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea id="description" value={form.description} onChange={(event) => updateForm('description', event.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="receipt">URL Kwitansi</Label>
                                        <Input id="receipt" value={form.receipt_url} onChange={(event) => updateForm('receipt_url', event.target.value)} />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={createLog.isPending} className="bg-[#00468B] hover:bg-[#003366] text-white">
                                            {createLog.isPending ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-500">Saldo Kas</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(summary?.current_balance)}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-500">Total Pemasukan</p>
                        <p className="mt-1 text-2xl font-black text-green-700">{formatCurrency(summary?.total_income)}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-500">Total Pengeluaran</p>
                        <p className="mt-1 text-2xl font-black text-red-700">{formatCurrency(summary?.total_expense)}</p>
                    </div>
                </div>

                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground">Jumlah</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Jenis</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Sumber</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Dicatat Oleh</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Memuat catatan keuangan...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-red-600">Gagal memuat catatan keuangan.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Belum ada catatan keuangan.</TableCell>
                                </TableRow>
                            )}
                            {logs.map((catatan) => (
                                <TableRow key={catatan.log_id}>
                                    <TableCell className={`font-medium ${catatan.type === 'INCOME' ? 'text-green-700' : 'text-red-700'}`}>
                                        {formatCurrency(catatan.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={catatan.type === 'INCOME' ? 'outline' : 'secondary'} className={catatan.type === 'INCOME' ? 'border-green-500 text-green-700 bg-green-50' : ''}>
                                            {typeLabel(catatan.type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{catatan.source}</TableCell>
                                    <TableCell>{catatan.recorder?.full_name ?? '-'}</TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                                    <ReceiptText className="w-4 h-4 mr-2" />
                                                    Kwitansi
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
                                                <div className="bg-white p-8 max-w-sm mx-auto font-mono text-sm relative overflow-hidden flex flex-col items-center border border-gray-200">
                                                    <div className="absolute inset-0 bg-white/90 z-0"></div>
                                                    
                                                    <div className="relative z-10 w-full">
                                                        <div className="text-center mb-4">
                                                            <h2 className="font-bold text-lg mb-1">Iuran Desa Suka Maju Mundur</h2>
                                                        </div>
                                                        
                                                        <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                                        
                                                        <div className="mb-4">
                                                            <p>{formatDateTime(catatan.created_at)}</p>
                                                        </div>
                                                        
                                                        <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                                        
                                                        <div className="space-y-1 mb-4">
                                                            <p>Jenis: {typeLabel(catatan.type)}</p>
                                                            <p>Pencatat: {catatan.recorder?.full_name ?? '-'}</p>
                                                        </div>
                                                        
                                                        <div className="flex justify-between mb-4">
                                                            <span>{catatan.source}</span>
                                                            <span>{formatCurrency(catatan.amount)}</span>
                                                        </div>
                                                        
                                                        <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                                        
                                                        <div className="flex justify-between font-bold mb-8">
                                                            <span>Total</span>
                                                            <span>{formatCurrency(catatan.amount)}</span>
                                                        </div>
                                                        
                                                        <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                                        
                                                        <div className="text-center space-y-4">
                                                            <p className="text-xs">TTD. BENDAHARA DESA SUKA MAJU MUNDUR</p>
                                                            <div className="flex justify-center">
                                                                <Barcode className="w-48 h-16 text-gray-900" strokeWidth={1} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {logs.length} baris
                    </div>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" className="pointer-events-none opacity-50" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive className="bg-[#00468B] text-white hover:bg-[#003366] hover:text-white">1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">2</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </DashboardLayout>
    );
}
