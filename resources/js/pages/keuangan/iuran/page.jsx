import React from 'react';
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

export default function DataIuranPage() {
    const dummyData = Array(8).fill({
        namaIuran: 'Iuran Bulanan',
        tenggat: '29/04/2026',
        jumlahUntukDibayar: 'Iuran Warga',
        sudahBayar: '160/200',
    });

    return (
        <DashboardLayout>
            <Head title="Data Iuran - Wargify" />
            
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Data Iuran</h1>
                
                <div className="mb-6 flex justify-between items-center gap-4">
                    <Input 
                        placeholder="Cari Iuran" 
                        className="max-w-md bg-white flex-1"
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
                            {dummyData.map((iuran, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{iuran.namaIuran}</TableCell>
                                    <TableCell>{iuran.tenggat}</TableCell>
                                    <TableCell>{iuran.jumlahUntukDibayar}</TableCell>
                                    <TableCell>{iuran.sudahBayar}</TableCell>
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
                        Menampilkan 1-8 dari 400 baris
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
