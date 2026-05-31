import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import DataPagination from '@/components/common/DataPagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAddFamilyMember, useFamily } from '@/hooks/useFamilies';
import { usePagination } from '@/hooks/usePagination';
import { useUsers } from '@/hooks/useUsers';

export default function TambahAnggotaKeluargaPage() {
    const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
    const familyId = params.get('familyId');
    const [search, setSearch] = useState('');
    const { data: family } = useFamily(familyId);
    const { data: users = [], isLoading, isError } = useUsers();
    const addMember = useAddFamilyMember();

    const familyHead = family?.members?.find((member) => member.user_id === family?.head_of_family_id);

    const unassignedUsers = useMemo(() => {
        const keyword = search.toLowerCase();

        return users
            .filter((user) => !user.family_id)
            .filter((user) => [user.full_name, user.phone_number, user.email]
                .some((value) => String(value ?? '').toLowerCase().includes(keyword)));
    }, [search, users]);

    const pagination = usePagination(unassignedUsers, 10);

    return (
        <DashboardLayout>
            <Head title="Tambah Anggota Keluarga - Wargify" />
            
            <div className="p-8">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="max-w-2xl text-3xl font-bold text-gray-900">
                            Tambah Anggota Untuk Keluarga {familyHead?.full_name ?? (familyId ? `#${familyId}` : '')}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                            Daftar ini hanya menampilkan warga yang belum tersambung ke family mana pun.
                        </p>
                    </div>
                    <Link href={`/warga/per-kepala/anggota${familyId ? `?familyId=${familyId}` : ''}`}>
                        <Button variant="outline">Kembali</Button>
                    </Link>
                </div>
                
                <div className="mb-6">
                    <Input
                        placeholder="Cari warga"
                        className="max-w-sm bg-white"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
                
                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground w-16">Foto</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Nama</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Telepon</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-36">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Memuat warga...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-red-600">Gagal memuat warga.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && unassignedUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Tidak ada warga yang belum tersambung family.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((anggota) => (
                                <TableRow key={anggota.user_id}>
                                    <TableCell>
                                        <Avatar className="w-10 h-10 border border-muted bg-blue-100">
                                            <AvatarImage src={anggota.profile_picture_url} alt={anggota.full_name} />
                                            <AvatarFallback>{anggota.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{anggota.full_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">Belum tersambung</Badge>
                                    </TableCell>
                                    <TableCell>{anggota.phone_number ?? '-'}</TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="bg-[#00468B] text-white hover:bg-[#003366]"
                                            disabled={!familyId || addMember.isPending}
                                            onClick={() => addMember.mutate({ familyId, userId: anggota.user_id })}
                                        >
                                            <UserPlus className="mr-2 size-4" />
                                            Tambah
                                        </Button>
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
