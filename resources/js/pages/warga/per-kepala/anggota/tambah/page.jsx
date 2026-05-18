import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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

export default function TambahAnggotaKeluargaPage() {
    const dummyData = Array(8).fill({
        nama: 'Orang ga tau',
        umur: 30,
        status: 'Anggota Keluarga',
        telp: '08123456789',
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Orang'
    });

    return (
        <DashboardLayout>
            <Head title="Tambah Anggota Keluarga - Wargify" />
            
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 max-w-2xl">Tambah Anggota Untuk Keluarga Tatang Sutarma</h1>
                
                <div className="flex justify-between items-center mb-6">
                    <Input 
                        placeholder="Cari Warga" 
                        className="max-w-sm bg-white"
                    />
                    <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                        <Save className="w-4 h-4 mr-2" />
                        Simpan
                    </Button>
                </div>
                
                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground w-16">Foto</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Nama ↑↓</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Umur</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Telepon</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-20 text-center">Aksi</TableHead>
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
                                    <TableCell>
                                        <Badge variant="secondary">{anggota.status}</Badge>
                                    </TableCell>
                                    <TableCell>{anggota.telp}</TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox className="w-5 h-5 rounded border-gray-300 data-[state=checked]:bg-[#00468B] data-[state=checked]:border-[#00468B]" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        10 dari 4 baris
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
