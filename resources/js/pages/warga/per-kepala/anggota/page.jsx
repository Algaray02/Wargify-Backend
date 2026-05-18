import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { SquarePen, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function AnggotaKeluargaPage() {
    const dummyData = [
        { nama: 'Yati Sutarma', umur: 30, gender: 'Wanita', telp: '08123456789', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Yati' },
        { nama: 'Sule Sutarma', umur: 30, gender: 'Pria', telp: '08123456789', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sule' },
        { nama: 'Makmur Sutarma', umur: 30, gender: 'Pria', telp: '08123456789', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Makmur' },
        { nama: 'Siti Sutarma', umur: 30, gender: 'Wanita', telp: '08123456789', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Siti' },
    ];

    return (
        <DashboardLayout>
            <Head title="Anggota Keluarga - Wargify" />
            
            <div className="p-8">
                <div className="flex justify-between items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Anggota Keluarga Tatang Sutarma</h1>
                        <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                            Perbarui anggota yang terdaftar pada keluarga ini.
                        </p>
                    </div>
                    
                    <Link href="/warga/per-kepala/anggota/tambah">
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Anggota
                        </Button>
                    </Link>
                </div>
                
                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground w-16">Foto</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Nama Anggota ↑↓</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Umur</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Gender</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Telepon</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dummyData.map((anggota, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Avatar className="w-10 h-10 border border-muted bg-blue-100">
                                            <AvatarImage src={anggota.avatar} alt={anggota.nama} />
                                            <AvatarFallback>{anggota.nama.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{anggota.nama}</TableCell>
                                    <TableCell>{anggota.umur}</TableCell>
                                    <TableCell>{anggota.gender}</TableCell>
                                    <TableCell>{anggota.telp}</TableCell>
                                    <TableCell>
                                        <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                            <SquarePen className="w-4 h-4 mr-2" />
                                            Kelola
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        4 dari 4 baris
                    </div>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" className="pointer-events-none opacity-50" />
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
