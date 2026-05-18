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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WargaPerWargaPage() {
    // Dummy data mimicking the design
    const dummyData = Array(8).fill({
        nama: 'Tatang Sutarma',
        umur: '30',
        status: 'Anggota Keluarga',
        telepon: '08123456789',
        avatarUrl: 'https://ui-avatars.com/api/?name=Tatang+Sutarma&background=ff7b72&color=fff',
    });

    return (
        <DashboardLayout>
            <Head title="List per Warga - Wargify" />
            
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">List per Warga</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                        Kelola data individu warga, status keluarga, dan kontak utama.
                    </p>
                </div>
                
                <div className="mb-6 flex justify-between items-center gap-4">
                    <div className="flex flex-1 gap-2 max-w-2xl">
                        <Input 
                            placeholder="Cari Warga" 
                            className="bg-white flex-1"
                        />
                        <Link href="/warga/per-warga/create">
                            <Button className="bg-[#00468B] hover:bg-[#003366] text-white whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Warga
                            </Button>
                        </Link>
                    </div>
                    
                    <Select defaultValue="kepala_keluarga">
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kepala_keluarga">Kepala Keluarga</SelectItem>
                            <SelectItem value="anggota">Anggota Keluarga</SelectItem>
                        </SelectContent>
                    </Select>
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
                                <TableHead className="font-semibold text-muted-foreground w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dummyData.map((warga, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Avatar className="w-10 h-10 border border-muted">
                                            <AvatarImage src={warga.avatarUrl} alt={warga.nama} />
                                            <AvatarFallback>{warga.nama.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{warga.nama}</TableCell>
                                    <TableCell>{warga.umur}</TableCell>
                                    <TableCell>
                                        <Badge variant={warga.status === 'Kepala Keluarga' ? 'default' : 'secondary'} className={warga.status === 'Kepala Keluarga' ? 'bg-[#00468B]' : ''}>
                                            {warga.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{warga.telepon}</TableCell>
                                    <TableCell>
                                        <Link href="/warga/per-warga/edit">
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
