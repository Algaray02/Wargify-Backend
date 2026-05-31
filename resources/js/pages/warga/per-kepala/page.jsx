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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DataPagination from '@/components/common/DataPagination';
import SortableTableHead from '@/components/common/SortableTableHead';
import { usePagination } from '@/hooks/usePagination';
import { useFamilies } from '@/hooks/useFamilies';

export default function WargaPerKepalaPage() {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState({ field: 'nama', direction: 'asc' });
    const { data: families = [], isLoading, isError } = useFamilies();

    const handleSort = (field) => {
        setSort((current) => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const kepalaKeluarga = useMemo(() => {
        return families
            .map((family) => {
                const head = family.members?.find((member) => member.user_id === family.head_of_family_id);

                return {
                    id: family.family_id,
                    family,
                    head,
                    nama: head?.full_name ?? '',
                    jumlahAnggota: family.members?.length ?? 0,
                    telepon: head?.phone_number ?? '-',
                    avatarUrl: head?.profile_picture_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(head?.full_name ?? 'Keluarga')}&background=00468B&color=fff`,
                };
            })
            .filter((warga) => warga.head && warga.family.head_of_family_id)
            .filter((warga) => {
                const keyword = search.toLowerCase();
                return [warga.nama, warga.telepon, warga.family.household?.block_number, warga.family.household?.house_number]
                    .some((value) => String(value).toLowerCase().includes(keyword));
            })
            .sort((left, right) => {
                const direction = sort.direction === 'asc' ? 1 : -1;
                const leftValue = left[sort.field] ?? '';
                const rightValue = right[sort.field] ?? '';

                if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                    return (leftValue - rightValue) * direction;
                }

                return String(leftValue).localeCompare(String(rightValue), 'id-ID', {
                    numeric: true,
                    sensitivity: 'base',
                }) * direction;
            });
    }, [families, search, sort]);

    const pagination = usePagination(kepalaKeluarga, 10);

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
                                <SortableTableHead field="nama" sortField={sort.field} sortDirection={sort.direction} onSort={handleSort}>
                                    Nama Kepala
                                </SortableTableHead>
                                <SortableTableHead field="jumlahAnggota" sortField={sort.field} sortDirection={sort.direction} onSort={handleSort}>
                                    Jumlah Anggota
                                </SortableTableHead>
                                <SortableTableHead field="telepon" sortField={sort.field} sortDirection={sort.direction} onSort={handleSort}>
                                    Telepon
                                </SortableTableHead>
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
                            {pagination.paginatedItems.map((warga) => (
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
                                        <Link href={`/warga/per-kepala/kelola?familyId=${warga.id}`}>
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

                <DataPagination
                    from={pagination.from}
                    onPageChange={pagination.setPage}
                    page={pagination.page}
                    to={pagination.to}
                    totalItems={pagination.totalItems}
                    totalPages={pagination.totalPages}
                />
            </div>
        </DashboardLayout>
    );
}
