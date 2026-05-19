import React, { useMemo, useState } from 'react';
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
import { useUsers } from '@/hooks/useUsers';

export default function WargaPerWargaPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('semua');
    const { data: users = [], isLoading, isError } = useUsers();

    const wargaData = useMemo(() => {
        return users
            .map((user) => {
                const isHead = user.family?.head_of_family_id === user.user_id;
                return {
                    id: user.user_id,
                    nama: user.full_name,
                    username: user.username,
                    umur: '-',
                    status: isHead ? 'Kepala Keluarga' : 'Anggota Keluarga',
                    role: user.role,
                    telepon: user.phone_number ?? '-',
                    avatarUrl: user.profile_picture_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name ?? user.username)}&background=00468B&color=fff`,
                };
            })
            .filter((warga) => {
                const keyword = search.toLowerCase();
                const matchesSearch = [warga.nama, warga.username, warga.telepon]
                    .some((value) => String(value).toLowerCase().includes(keyword));
                const matchesStatus = statusFilter === 'semua'
                    || (statusFilter === 'kepala_keluarga' && warga.status === 'Kepala Keluarga')
                    || (statusFilter === 'anggota' && warga.status === 'Anggota Keluarga');

                return matchesSearch && matchesStatus;
            });
    }, [users, search, statusFilter]);

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
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <Link href="/warga/per-warga/create">
                            <Button className="bg-[#00468B] hover:bg-[#003366] text-white whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Warga
                            </Button>
                        </Link>
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua Warga</SelectItem>
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
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Memuat data warga...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-red-600">Gagal memuat data warga.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && wargaData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Tidak ada data warga.</TableCell>
                                </TableRow>
                            )}
                            {wargaData.map((warga) => (
                                <TableRow key={warga.id}>
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
                                        <Link href={`/warga/per-warga/edit?user_id=${warga.id}`}>
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
                        Menampilkan {wargaData.length} dari {users.length} baris
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
