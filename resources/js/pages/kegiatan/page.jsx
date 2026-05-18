import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SquarePen, Plus } from 'lucide-react';
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

export default function DaftarKegiatanPage() {
    const dummyData = [
        { judul: 'Rapat anggaran desa', status: 'Belum diumumkan', tempat: 'Rumah Pak RT', tipe: 'Rapat' },
        { judul: 'Perayaan HUT RI', status: 'Diumumkan', tempat: 'Lapangan Desa', tipe: 'Kegiatan Umum' },
        { judul: 'Rapat pembangunan Jembatan', status: 'Selesai', tempat: 'Rumah Bu Dwi', tipe: 'Rapat' },
        { judul: 'Kerja bakti', status: 'Selesai', tempat: 'Masjid Al-Muttaqin', tipe: 'Kegiatan Umum' },
    ];

    return (
        <DashboardLayout>
            <Head title="Daftar Kegiatan - Wargify" />
            
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Daftar Kegiatan</h1>
                
                <div className="mb-6 flex justify-between items-center gap-4">
                    <div className="flex flex-1 gap-4 max-w-3xl">
                        <Input 
                            placeholder="Cari rapat..." 
                            className="bg-white flex-1"
                        />
                        <Select defaultValue="semua_status">
                            <SelectTrigger className="w-[160px] bg-white">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua_status">Semua Status</SelectItem>
                                <SelectItem value="belum_diumumkan">Belum diumumkan</SelectItem>
                                <SelectItem value="diumumkan">Diumumkan</SelectItem>
                                <SelectItem value="selesai">Selesai</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="semua_tipe">
                            <SelectTrigger className="w-[160px] bg-white">
                                <SelectValue placeholder="Semua Tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua_tipe">Semua Tipe</SelectItem>
                                <SelectItem value="rapat">Rapat</SelectItem>
                                <SelectItem value="kegiatan_umum">Kegiatan Umum</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Link href="/kegiatan/create">
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Kegiatan
                        </Button>
                    </Link>
                </div>

                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground">Judul</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Status ↑↓</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Tempat</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Tipe</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dummyData.map((kegiatan, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{kegiatan.judul}</TableCell>
                                    <TableCell>
                                        <Badge variant={kegiatan.status === 'Selesai' ? 'default' : kegiatan.status === 'Diumumkan' ? 'secondary' : 'outline'} className={kegiatan.status === 'Selesai' ? 'bg-[#00468B]' : ''}>
                                            {kegiatan.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{kegiatan.tempat}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{kegiatan.tipe}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Link href="/kegiatan/edit">
                                            <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                                <SquarePen className="w-4 h-4 mr-2" />
                                                Kelola
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
                        Menampilkan 1-4 dari 4 baris
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
                                <PaginationNext href="#" className="pointer-events-none opacity-50" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </DashboardLayout>
    );
}
