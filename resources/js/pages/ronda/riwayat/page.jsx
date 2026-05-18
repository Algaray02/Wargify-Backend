import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
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

export default function RiwayatRondaPage() {
    const dummyData = [
        ...Array(6).fill({
            tanggal: '29/04/2026',
            kehadiran: '6/6',
            checkpoint: '6/6',
            kelompok: 'Kelompok 1',
            waktu: '23:59-03:00',
            status: 'Selesai'
        }),
        ...Array(4).fill({
            tanggal: '29/04/2026',
            kehadiran: '0/6',
            checkpoint: '0/6',
            kelompok: 'Kelompok 2',
            waktu: '23:59-03:00',
            status: 'Terlewat'
        }),
    ];

    return (
        <DashboardLayout>
            <Head title="Riwayat Ronda - Wargify" />
            
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Riwayat Pelaksanaan Ronda</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                        Evaluasi pelaksanaan ronda, kehadiran, checkpoint, dan durasi patroli.
                    </p>
                </div>
                
                <div className="mb-6 flex items-center gap-4 max-w-2xl">
                    <Input 
                        placeholder="Cari pelaksanaan..." 
                        className="bg-white flex-1"
                    />
                    <Select defaultValue="semua_status">
                        <SelectTrigger className="w-[160px] bg-white">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua_status">Semua Status</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                            <SelectItem value="terlewat">Terlewat</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground">Tanggal</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Kehadiran</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Checkpoint</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Kelompok</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Waktu</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dummyData.map((riwayat, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{riwayat.tanggal}</TableCell>
                                    <TableCell>{riwayat.kehadiran}</TableCell>
                                    <TableCell>{riwayat.checkpoint}</TableCell>
                                    <TableCell>{riwayat.kelompok}</TableCell>
                                    <TableCell>{riwayat.waktu}</TableCell>
                                    <TableCell>
                                        <Badge variant={riwayat.status === 'Selesai' ? 'default' : 'secondary'} className={riwayat.status === 'Selesai' ? 'bg-[#00468B]' : 'bg-red-100 text-red-700 hover:bg-red-200'}>
                                            {riwayat.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Link href="/ronda/riwayat/detail">
                                            <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Lihat
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan 1-10 dari 400 baris
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
