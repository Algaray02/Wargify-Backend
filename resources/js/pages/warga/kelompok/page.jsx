import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import {
    useCitizenGroups,
    useCreateCitizenGroup,
    useDeleteCitizenGroup,
    useUpdateCitizenGroup,
} from '@/hooks/useCitizenGroups';
import { useUsers } from '@/hooks/useUsers';
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';

const emptyForm = {
    group_id: null,
    name: '',
    member_ids: [],
};

const visibleMembersLimit = 5;

export default function KelompokWargaPage() {
    const [search, setSearch] = useState('');
    const [memberSearch, setMemberSearch] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { data: groups = [], isLoading, isError } = useCitizenGroups();
    const { data: users = [] } = useUsers();
    const createGroup = useCreateCitizenGroup();
    const updateGroup = useUpdateCitizenGroup();
    const deleteGroup = useDeleteCitizenGroup();

    const inviteableUsers = useMemo(
        () => users.filter((user) => ['WARGA', 'KETUA_RT', 'BENDAHARA'].includes(user.role)),
        [users]
    );

    const filteredInviteableUsers = useMemo(() => {
        const keyword = memberSearch.trim().toLowerCase();

        return inviteableUsers.filter((user) => (
            [user.full_name, user.username, user.phone_number, user.role]
                .some((value) => String(value ?? '').toLowerCase().includes(keyword))
        ));
    }, [inviteableUsers, memberSearch]);

    const filteredGroups = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return groups.filter((group) => {
            const memberNames = group.members?.map((member) => member.full_name).join(' ') ?? '';
            return [group.name, memberNames]
                .some((value) => String(value ?? '').toLowerCase().includes(keyword));
        });
    }, [groups, search]);

    const pagination = usePagination(filteredGroups, 8);

    const toggleMember = (userId) => {
        setForm((current) => ({
            ...current,
            member_ids: current.member_ids.includes(userId)
                ? current.member_ids.filter((id) => id !== userId)
                : [...current.member_ids, userId],
        }));
    };

    const editGroup = (group) => {
        setForm({
            group_id: group.group_id,
            name: group.name,
            member_ids: group.members?.map((member) => member.user_id) ?? [],
        });
    };

    const resetForm = () => setForm(emptyForm);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = {
            name: form.name,
            member_ids: form.member_ids,
        };

        if (form.group_id) {
            await updateGroup.mutateAsync({ groupId: form.group_id, payload });
        } else {
            await createGroup.mutateAsync(payload);
        }

        resetForm();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteGroup.mutateAsync(deleteTarget.group_id);
        if (form.group_id === deleteTarget.group_id) resetForm();
        setDeleteTarget(null);
    };

    return (
        <DashboardLayout>
            <Head title="Kelompok Warga - Wargify" />

            <div className="space-y-6 p-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kelompok Warga</h1>
                    <p className="mt-2 max-w-2xl text-sm text-gray-500">
                        Kelola grup undangan kegiatan seperti Bapak-Bapak, Ibu-Ibu PKK, dan Pemuda.
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                    <div className="space-y-4">
                        <Card className="rounded-lg">
                            <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="Cari kelompok atau nama anggota"
                                        className="pl-9"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                    />
                                </div>
                                <Badge variant="outline" className="w-fit px-3 py-1">
                                    {groups.length} kelompok
                                </Badge>
                            </CardContent>
                        </Card>

                        <div className="overflow-hidden rounded-lg border bg-white">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead>Nama kelompok</TableHead>
                                        <TableHead>Anggota</TableHead>
                                        <TableHead className="w-32">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-8 text-center text-slate-500">Memuat kelompok...</TableCell>
                                        </TableRow>
                                    )}
                                    {isError && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-8 text-center text-red-600">Gagal memuat kelompok.</TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoading && !isError && filteredGroups.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-8 text-center text-slate-500">Tidak ada kelompok.</TableCell>
                                        </TableRow>
                                    )}
                                    {pagination.paginatedItems.map((group) => (
                                        <TableRow key={group.group_id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Users className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{group.name}</p>
                                                        <p className="text-xs text-slate-500">{group.members_count ?? group.members?.length ?? 0} anggota</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[420px]">
                                                <div className="flex max-h-16 max-w-full flex-wrap gap-2 overflow-hidden">
                                                    {group.members?.length ? (
                                                        <>
                                                            {group.members.slice(0, visibleMembersLimit).map((member) => (
                                                                <Badge key={member.user_id} variant="outline" className="max-w-[150px] truncate">
                                                                    {member.full_name}
                                                                </Badge>
                                                            ))}
                                                            {group.members.length > visibleMembersLimit && (
                                                                <Badge variant="secondary" className="shrink-0">
                                                                    +{group.members.length - visibleMembersLimit} lainnya
                                                                </Badge>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-slate-500">Belum ada anggota</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button type="button" size="icon" variant="outline" className="size-9" onClick={() => editGroup(group)}>
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="outline"
                                                        className="size-9 border-red-200 text-red-700 hover:bg-red-50"
                                                        disabled={deleteGroup.isPending}
                                                        onClick={() => setDeleteTarget(group)}
                                                    >
                                                        <Trash2 className="size-4" />
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

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>{form.group_id ? 'Edit kelompok' : 'Tambah kelompok'}</CardTitle>
                            <CardDescription>Pilih anggota yang akan menjadi target undangan kegiatan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama kelompok</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: Bapak-Bapak"
                                        value={form.name}
                                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Anggota</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            placeholder="Cari nama, username, telepon, atau role"
                                            className="pl-9"
                                            value={memberSearch}
                                            onChange={(event) => setMemberSearch(event.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-[420px] space-y-2 overflow-auto rounded-lg border bg-slate-50 p-3">
                                        {filteredInviteableUsers.length === 0 ? (
                                            <p className="rounded-md bg-white p-3 text-sm text-slate-500">Tidak ada anggota yang cocok.</p>
                                        ) : filteredInviteableUsers.map((user) => (
                                            <label key={user.user_id} className="flex cursor-pointer items-center justify-between gap-3 rounded-md bg-white p-3">
                                                <span>
                                                    <span className="block text-sm font-medium text-slate-800">{user.full_name}</span>
                                                    <span className="text-xs text-slate-500">{user.role}</span>
                                                </span>
                                                <Checkbox
                                                    checked={form.member_ids.includes(user.user_id)}
                                                    onCheckedChange={() => toggleMember(user.user_id)}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    {form.group_id && (
                                        <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
                                    )}
                                    <Button
                                        type="submit"
                                        className="bg-[#00468B] text-white hover:bg-[#003366]"
                                        disabled={createGroup.isPending || updateGroup.isPending}
                                    >
                                        <Plus className="size-4" />
                                        {form.group_id ? 'Simpan' : 'Tambah'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus kelompok warga?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Kelompok {deleteTarget?.name} akan dihapus dari daftar target undangan kegiatan. Data warga tidak ikut terhapus.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteGroup.isPending}>Batal</AlertDialogCancel>
                            <AlertDialogAction disabled={deleteGroup.isPending} onClick={handleDelete}>
                                Hapus Kelompok
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
