import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SquarePen } from 'lucide-react';
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
import { useFamilies } from '@/hooks/useFamilies';

export default function WargaPerKepalaPage() {
    const [search, setSearch] = useState('');
    const { data: families = [], isLoading, isError } = useFamilies();

    const kepalaKeluarga = useMemo(() => {
        return families
            .map((family) => {
                const head = family.members?.find((member) => member.user_id === family.head_of_family_id)
                    ?? family.members?.[0];

                return {
                    id: family.family_id,
                    nama: head?.full_name ?? 'Belum ada kepala keluarga',
                    jumlahAnggota: family.members?.length ?? 0,
                    telepon: head?.phone_number ?? '-',
                    avatarUrl: head?.profile_picture_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(head?.full_name ?? 'Keluarga')}&background=00468B&color=fff`,
                };
            })
            .filter((warga) => {
                const keyword = search.toLowerCase();
                return [warga.nama, warga.telepon]
                    .some((value) => String(value).toLowerCase().includes(keyword));
            });
    }, [families, search]);

    return (
        <DashboardLayout>
            <Head title="List per Kepala Keluarga - Wargify" />
            
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">List per Kepala Keluarga</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                        Lihat keluarga berdasarkan kepala keluarga dan akses detail pengelolaannya.
                    </p>
                </div>
                
                <div className="mb-6 flex justify-between items-center">
                    <Input 
                        placeholder="Cari Warga" 
                        className="max-w-md bg-white"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground w-16">Foto</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Nama Kepala ↑↓</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Jumlah Anggota</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Telepon</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Memuat data keluarga...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-red-600">Gagal memuat data keluarga.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && kepalaKeluarga.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Tidak ada data kepala keluarga.</TableCell>
                                </TableRow>
                            )}
                            {kepalaKeluarga.map((warga) => (
                                <TableRow key={warga.id}>
                                    <TableCell>
                                        <Avatar className="w-10 h-10 border border-muted">
                                            <AvatarImage src={warga.avatarUrl} alt={warga.nama} />
                                            <AvatarFallback>{warga.nama.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{warga.nama}</TableCell>
                                    <TableCell>{warga.jumlahAnggota}</TableCell>
                                    <TableCell>{warga.telepon}</TableCell>
                                    <TableCell>
                                        <Link href="/warga/per-kepala/kelola">
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
                        Menampilkan {kepalaKeluarga.length} dari {families.length} baris
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
