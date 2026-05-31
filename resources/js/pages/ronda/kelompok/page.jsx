import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useCreateRondaGroup, useRondaGroups, useUpdateRondaGroup } from '@/hooks/useRonda';
import { useUsers } from '@/hooks/useUsers';
import { Pencil, Plus, Search, Users } from 'lucide-react';

const emptyForm = {
    group_id: null,
    name: '',
    member_ids: [],
};

export default function KelompokRondaPage() {
    const [search, setSearch] = useState('');
    const [memberSearch, setMemberSearch] = useState('');
    const [form, setForm] = useState(emptyForm);
    const { data: groups = [], isLoading, isError } = useRondaGroups();
    const { data: users = [] } = useUsers();
    const createGroup = useCreateRondaGroup();
    const updateGroup = useUpdateRondaGroup();

    const eligibleUsers = useMemo(
        () => users.filter((user) => ['WARGA', 'KETUA_RT', 'BENDAHARA'].includes(user.role)),
        [users]
    );

    const filteredUsers = useMemo(() => {
        const keyword = memberSearch.trim().toLowerCase();
        return eligibleUsers.filter((user) => [user.full_name, user.username, user.phone_number, user.role]
            .some((value) => String(value ?? '').toLowerCase().includes(keyword)));
    }, [eligibleUsers, memberSearch]);

    const filteredGroups = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return groups.filter((group) => {
            const members = group.members?.map((member) => member.full_name).join(' ') ?? '';
            return [group.name, members].some((value) => String(value ?? '').toLowerCase().includes(keyword));
        });
    }, [groups, search]);

    const pagination = usePagination(filteredGroups, 8);
    const isMutating = createGroup.isPending || updateGroup.isPending;

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

    const resetForm = () => {
        setForm(emptyForm);
        setMemberSearch('');
    };

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

    return (
        <DashboardLayout>
            <Head title="Kelompok Ronda - Wargify" />

            <div className="space-y-6 p-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kelompok Ronda</h1>
                    <p className="mt-2 max-w-2xl text-sm text-gray-500">
                        Bentuk tim ronda dari data warga yang ada, lalu pakai kelompoknya saat membuat jadwal.
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
                    <div className="space-y-4">
                        <div className="rounded-lg border bg-white p-4">
                            <div className="relative max-w-xl">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Cari kelompok atau anggota"
                                    className="pl-9"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border bg-white">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Kelompok</TableHead>
                                        <TableHead>Anggota</TableHead>
                                        <TableHead className="w-24">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-8 text-center text-slate-500">Memuat kelompok ronda...</TableCell>
                                        </TableRow>
                                    )}
                                    {isError && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-8 text-center text-red-600">Gagal memuat kelompok ronda.</TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoading && !isError && filteredGroups.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-8 text-center text-slate-500">Tidak ada kelompok ronda.</TableCell>
                                        </TableRow>
                                    )}
                                    {pagination.paginatedItems.map((group) => (
                                        <TableRow key={group.group_id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Users className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{group.name}</p>
                                                        <p className="text-xs text-slate-500">{group.members?.length ?? 0} anggota</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex max-h-16 flex-wrap gap-2 overflow-hidden">
                                                    {group.members?.length ? group.members.slice(0, 5).map((member) => (
                                                        <Badge key={member.user_id} variant="outline" className="max-w-[150px] truncate">
                                                            {member.full_name}
                                                        </Badge>
                                                    )) : (
                                                        <span className="text-sm text-slate-500">Belum ada anggota</span>
                                                    )}
                                                    {(group.members?.length ?? 0) > 5 && (
                                                        <Badge variant="secondary">+{group.members.length - 5} lainnya</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button type="button" size="icon" variant="outline" className="size-9" onClick={() => editGroup(group)}>
                                                    <Pencil className="size-4" />
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

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>{form.group_id ? 'Edit kelompok' : 'Tambah kelompok'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama kelompok</Label>
                                    <Input
                                        id="name"
                                        value={form.name}
                                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                        placeholder="Contoh: Regu Malam Jumat"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Anggota</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            placeholder="Cari nama, telepon, atau role"
                                            className="pl-9"
                                            value={memberSearch}
                                            onChange={(event) => setMemberSearch(event.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-[420px] space-y-2 overflow-auto rounded-lg border bg-slate-50 p-3">
                                        {filteredUsers.length === 0 ? (
                                            <p className="rounded-md bg-white p-3 text-sm text-slate-500">Tidak ada warga yang cocok.</p>
                                        ) : filteredUsers.map((user) => (
                                            <label key={user.user_id} className="flex cursor-pointer items-center justify-between gap-3 rounded-md bg-white p-3">
                                                <span>
                                                    <span className="block text-sm font-medium text-slate-800">{user.full_name}</span>
                                                    <span className="text-xs text-slate-500">{user.phone_number ?? '-'} · {user.role}</span>
                                                </span>
                                                <Checkbox checked={form.member_ids.includes(user.user_id)} onCheckedChange={() => toggleMember(user.user_id)} />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    {form.group_id && <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>}
                                    <Button type="submit" disabled={isMutating} className="bg-[#00468B] text-white hover:bg-[#003366]">
                                        <Plus className="size-4" />
                                        {isMutating ? 'Menyimpan...' : form.group_id ? 'Simpan' : 'Tambah'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
