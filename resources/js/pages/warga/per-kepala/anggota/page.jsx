import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import DataPagination from '@/components/common/DataPagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, UserCheck, UserMinus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFamily, useRemoveFamilyMember, useSetHeadOfFamily } from '@/hooks/useFamilies';
import { usePagination } from '@/hooks/usePagination';

export default function AnggotaKeluargaPage() {
    const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
    const familyId = params.get('familyId');
    const { data: family, isLoading, isError } = useFamily(familyId);
    const removeMember = useRemoveFamilyMember();
    const setHead = useSetHeadOfFamily();
    const members = family?.members ?? [];
    const head = members.find((member) => member.user_id === family?.head_of_family_id);
    const pagination = usePagination(members, 10);

    return (
        <DashboardLayout>
            <Head title="Anggota Keluarga - Wargify" />
            
            <div className="p-8">
                <div className="flex justify-between items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Kelola Anggota Keluarga {head?.full_name ?? (familyId ? `#${familyId}` : '')}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                            Perbarui anggota yang terdaftar pada keluarga ini.
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        <Link href={`/warga/per-kepala/kelola${familyId ? `?familyId=${familyId}` : ''}`}>
                            <Button variant="outline">Kembali</Button>
                        </Link>
                        <Link href={`/warga/per-kepala/anggota/tambah${familyId ? `?familyId=${familyId}` : ''}`}>
                            <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Anggota
                            </Button>
                        </Link>
                    </div>
                </div>
                
                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground w-16">Foto</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Nama Anggota</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Telepon</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-72">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Memuat anggota keluarga...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-red-600">Gagal memuat anggota keluarga.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && members.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">Belum ada anggota keluarga.</TableCell>
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
                                        {anggota.user_id === family?.head_of_family_id ? (
                                            <Badge className="bg-[#00468B] text-white">Kepala keluarga</Badge>
                                        ) : (
                                            <Badge variant="secondary">Anggota</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{anggota.phone_number ?? '-'}</TableCell>
                                    <TableCell className="align-middle">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-8 rounded-full border-[#00468B]/20 px-3 text-xs font-bold text-[#00468B] hover:bg-blue-50"
                                                disabled={anggota.user_id === family?.head_of_family_id || setHead.isPending}
                                                onClick={() => setHead.mutate({ familyId, userId: anggota.user_id })}
                                            >
                                                <UserCheck className="mr-1.5 size-3.5" />
                                                Jadikan kepala
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-8 rounded-full border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                                                disabled={removeMember.isPending}
                                                onClick={() => removeMember.mutate({ familyId, userId: anggota.user_id })}
                                            >
                                                <UserMinus className="mr-1.5 size-3.5" />
                                                Lepas
                                            </Button>
                                        </div>
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
