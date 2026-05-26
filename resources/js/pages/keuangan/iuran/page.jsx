import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SquarePen, Plus, QrCode } from 'lucide-react';
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
import { useFamilies } from '@/hooks/useFamilies';
import { useIuranPeriods } from '@/hooks/useIuran';

export default function DataIuranPage() {
    const [search, setSearch] = useState('');
    const { data: periods = [], isLoading, isError } = useIuranPeriods();
    const { data: families = [] } = useFamilies();

    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value ?? 0);

    const formatPeriod = (period) => {
        if (!period.month || !period.year) return '-';
        return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
            .format(new Date(Number(period.year), Number(period.month) - 1, 1));
    };

    const filteredPeriods = useMemo(() => {
        const keyword = search.toLowerCase();
        return periods.filter((period) => (
            [period.period_name, formatPeriod(period)]
                .some((value) => String(value).toLowerCase().includes(keyword))
        ));
    }, [periods, search]);

    return (
        <DashboardLayout>
            <Head title="Data Iuran - Wargify" />
            
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Data Iuran</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                        Kelola skema iuran, tenggat pembayaran, dan QR untuk warga.
                    </p>
                </div>
                
                <div className="mb-6 flex justify-between items-center gap-4">
                    <Input 
                        placeholder="Cari Iuran" 
                        className="max-w-md bg-white flex-1"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    
                    <Link href="/keuangan/iuran/create">
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Iuran
                        </Button>
                    </Link>
                </div>

                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground">Nama Iuran</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Tenggat</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Jumlah untuk Dibayar</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Sudah Bayar</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-40">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Memuat data iuran...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-red-600">Gagal memuat data iuran.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredPeriods.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Tidak ada data iuran.</TableCell>
                                </TableRow>
                            )}
                            {filteredPeriods.map((iuran) => (
                                <TableRow key={iuran.period_id}>
                                    <TableCell className="font-medium">{iuran.period_name}</TableCell>
                                    <TableCell>{formatPeriod(iuran)}</TableCell>
                                    <TableCell>{formatCurrency(iuran.amount_per_family)}</TableCell>
                                    <TableCell>{iuran.paid_payments_count ?? 0}/{families.length}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="text-[#00468B] border-[#00468B] hover:bg-blue-50">
                                                <QrCode className="w-4 h-4 mr-2" />
                                                QR
                                            </Button>
                                            <Link href="/keuangan/iuran/edit">
                                                <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                                    <SquarePen className="w-4 h-4 mr-2" />
                                                    Kelola
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {filteredPeriods.length} dari {periods.length} baris
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
