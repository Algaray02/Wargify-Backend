import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import QrPreview from '@/components/common/QrPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Home, Pencil, Plus, QrCode, Save, Trash2, UserCheck, UserMinus, UserPlus, UsersRound, X } from 'lucide-react';
import {
    useAddFamilyMember,
    useFamilies,
    useFamily,
    useRemoveFamilyMember,
    useSetHeadOfFamily,
    useUpdateFamily,
} from '@/hooks/useFamilies';
import {
    useCreateHousehold,
    useDeleteHousehold,
    useHouseholds,
    useUpdateHousehold,
} from '@/hooks/useHouseholds';
import { useUsers } from '@/hooks/useUsers';

const emptyHouseForm = {
    block_number: '',
    house_number: '',
};

function ActionIconButton({ children, className = '', label, ...props }) {
    return (
        <Button
            type="button"
            size="icon"
            variant="ghost"
            title={label}
            aria-label={label}
            className={`size-8 rounded-full ${className}`}
            {...props}
        >
            {children}
        </Button>
    );
}

export default function KelolaKeluargaPage() {
    const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
    const requestedFamilyId = params.get('familyId');

    const [houseForm, setHouseForm] = useState(emptyHouseForm);
    const [editingHouseholdId, setEditingHouseholdId] = useState(null);

    const { data: families = [], isLoading: isFamiliesLoading } = useFamilies();
    const fallbackFamilyId = requestedFamilyId ?? families[0]?.family_id;
    const { data: familyDetail, isLoading: isFamilyLoading } = useFamily(fallbackFamilyId);
    const { data: households = [], isLoading: isHouseholdsLoading } = useHouseholds();
    const { data: users = [], isLoading: isUsersLoading } = useUsers();

    const addMember = useAddFamilyMember();
    const removeMember = useRemoveFamilyMember();
    const setHead = useSetHeadOfFamily();
    const updateFamily = useUpdateFamily();
    const createHousehold = useCreateHousehold();
    const updateHousehold = useUpdateHousehold();
    const deleteHousehold = useDeleteHousehold();

    const selectedFamily = useMemo(() => {
        if (familyDetail) {
            return familyDetail;
        }

        return families.find((family) => String(family.family_id) === String(fallbackFamilyId)) ?? families[0];
    }, [families, fallbackFamilyId, familyDetail]);

    const familyMembers = selectedFamily?.members ?? [];
    const familyHead = familyMembers.find((member) => member.user_id === selectedFamily?.head_of_family_id);
    const selectedHousehold = selectedFamily?.household
        ?? households.find((household) => household.household_id === selectedFamily?.household_id);

    const unassignedUsers = useMemo(() => {
        return users.filter((user) => !user.family_id);
    }, [users]);

    const isBusy = isFamiliesLoading || isFamilyLoading || isHouseholdsLoading || isUsersLoading;

    const submitHousehold = (event) => {
        event.preventDefault();

        const payload = {
            block_number: houseForm.block_number.trim(),
            house_number: houseForm.house_number.trim(),
        };

        if (!payload.block_number || !payload.house_number) {
            return;
        }

        if (editingHouseholdId) {
            updateHousehold.mutate({ householdId: editingHouseholdId, payload });
        } else {
            createHousehold.mutate(payload);
        }

        setHouseForm(emptyHouseForm);
        setEditingHouseholdId(null);
    };

    const startEditHousehold = (household) => {
        setEditingHouseholdId(household.household_id);
        setHouseForm({
            block_number: household.block_number ?? '',
            house_number: household.house_number ?? '',
        });
    };

    const assignHousehold = (householdId) => {
        if (!selectedFamily) {
            return;
        }

        updateFamily.mutate({
            familyId: selectedFamily.family_id,
            payload: { household_id: householdId },
        });
    };

    const addUserToFamily = (userId) => {
        if (!selectedFamily) {
            return;
        }

        addMember.mutate({ familyId: selectedFamily.family_id, userId });
    };

    const removeUserFromFamily = (userId) => {
        if (!selectedFamily) {
            return;
        }

        removeMember.mutate({ familyId: selectedFamily.family_id, userId });
    };

    const setUserAsHead = (userId) => {
        if (!selectedFamily) {
            return;
        }

        setHead.mutate({ familyId: selectedFamily.family_id, userId });
    };

    return (
        <DashboardLayout>
            <Head title="Kelola Keluarga - Wargify" />

            <div className="p-8">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Kelola Keluarga {familyHead?.full_name ?? (selectedFamily ? `#${selectedFamily.family_id}` : '')}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                            Sambungkan anggota, rumah, dan QR keluarga berdasarkan data backend.
                        </p>
                    </div>
                    <Link href="/warga/per-kepala">
                        <Button variant="outline">Kembali</Button>
                    </Link>
                </div>

                {isBusy && (
                    <div className="rounded-xl border bg-white p-6 text-sm font-semibold text-slate-500">
                        Memuat data keluarga, warga, dan rumah...
                    </div>
                )}

                {!isBusy && !selectedFamily && (
                    <div className="rounded-xl border bg-white p-6 text-sm font-semibold text-slate-500">
                        Belum ada keluarga yang bisa dikelola.
                    </div>
                )}

                {!isBusy && selectedFamily && (
                    <div className="space-y-6">
                        <section className="grid gap-4 lg:grid-cols-3">
                            <div className="rounded-xl border bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="grid size-10 place-items-center rounded-lg bg-[#E6F6FF] text-[#00468B]">
                                        <UsersRound className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Ringkasan keluarga</p>
                                        <p className="text-xs font-semibold text-slate-500">ID keluarga #{selectedFamily.family_id}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">Kepala keluarga</span>
                                        <span className="text-right font-semibold text-slate-900">{familyHead?.full_name ?? 'Belum ditentukan'}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">Jumlah anggota</span>
                                        <span className="font-semibold text-slate-900">{familyMembers.length}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">Rumah</span>
                                        <span className="text-right font-semibold text-slate-900">
                                            {selectedHousehold ? `Blok ${selectedHousehold.block_number} No. ${selectedHousehold.house_number}` : 'Belum tersambung'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <QrPreview
                                label={`Family-${selectedFamily.family_id}`}
                                value={selectedFamily.qr_code_data}
                            />

                            {selectedHousehold ? (
                                <QrPreview label={`Rumah-${selectedHousehold.household_id}`} value={selectedHousehold.qr_code_data} />
                            ) : (
                                <div className="rounded-xl border bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="grid size-10 place-items-center rounded-lg bg-[#E6F6FF] text-[#00468B]">
                                            <QrCode className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">QR rumah</p>
                                            <p className="text-xs font-semibold text-slate-500">Berdasarkan rumah yang tersambung</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500">Pilih rumah dari tabel untuk membuat QR rumah aktif.</p>
                                </div>
                            )}
                        </section>

                        <section className="rounded-xl border bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Anggota keluarga</h2>
                                    <p className="text-sm font-medium text-slate-500">Tetapkan kepala keluarga atau lepas anggota dari keluarga ini.</p>
                                </div>
                                <Link href={`/warga/per-kepala/anggota?familyId=${selectedFamily.family_id}`}>
                                    <Button variant="outline" size="sm">Kelola detail</Button>
                                </Link>
                            </div>
                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Telepon</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-56">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {familyMembers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-slate-500">Belum ada anggota keluarga.</TableCell>
                                            </TableRow>
                                        )}
                                        {familyMembers.map((member) => (
                                            <TableRow key={member.user_id}>
                                                <TableCell className="font-semibold">{member.full_name}</TableCell>
                                                <TableCell>{member.phone_number ?? '-'}</TableCell>
                                                <TableCell>
                                                    {member.user_id === selectedFamily.head_of_family_id ? (
                                                        <Badge className="bg-[#00468B] text-white">Kepala keluarga</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Anggota</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="align-middle">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 rounded-full border-[#00468B]/20 px-3 text-xs font-bold text-[#00468B] hover:bg-blue-50"
                                                            disabled={member.user_id === selectedFamily.head_of_family_id || setHead.isPending}
                                                            onClick={() => setUserAsHead(member.user_id)}
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
                                                            onClick={() => removeUserFromFamily(member.user_id)}
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
                        </section>

                        <section className="rounded-xl border bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="grid size-10 place-items-center rounded-lg bg-[#E6F6FF] text-[#00468B]">
                                    <UserPlus className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Tambahkan warga</h2>
                                    <p className="text-sm font-medium text-slate-500">Data di bawah ini hanya warga yang belum terhubung ke family mana pun.</p>
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Telepon</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="w-36">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {unassignedUsers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-slate-500">Tidak ada warga yang belum tersambung family.</TableCell>
                                            </TableRow>
                                        )}
                                        {unassignedUsers.map((user) => (
                                            <TableRow key={user.user_id}>
                                                <TableCell className="font-semibold">{user.full_name}</TableCell>
                                                <TableCell>{user.phone_number ?? '-'}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="bg-[#00468B] text-white hover:bg-[#003366]"
                                                        disabled={addMember.isPending}
                                                        onClick={() => addUserToFamily(user.user_id)}
                                                    >
                                                        <Plus className="mr-2 size-4" />
                                                        Tambah
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </section>

                        <section className="rounded-xl border bg-white p-5 shadow-sm">
                            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-3">
                                        <div className="grid size-10 place-items-center rounded-lg bg-[#E6F6FF] text-[#00468B]">
                                            <Home className="size-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900">Kelola rumah</h2>
                                            <p className="text-sm font-medium text-slate-500">Tabel ini berasal dari data `households`.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submitHousehold} className="mb-5 rounded-xl border border-[#00468B]/15 bg-[#F3FAFF] p-4">
                                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-black text-slate-900">
                                            {editingHouseholdId ? 'Edit data rumah' : 'Tambah rumah baru'}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500">
                                            {editingHouseholdId ? 'Perubahan blok atau nomor rumah akan membuat QR rumah dan QR family terkait ikut berganti.' : 'Isi blok dan nomor rumah untuk membuat data household baru.'}
                                        </p>
                                    </div>
                                    {editingHouseholdId && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingHouseholdId(null);
                                                setHouseForm(emptyHouseForm);
                                            }}
                                        >
                                            <X className="mr-2 size-4" />
                                            Batal edit
                                        </Button>
                                    )}
                                </div>
                                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                                    <Input
                                        placeholder="Blok"
                                        className="bg-white"
                                        value={houseForm.block_number}
                                        onChange={(event) => setHouseForm((current) => ({ ...current, block_number: event.target.value }))}
                                    />
                                    <Input
                                        placeholder="Nomor rumah"
                                        className="bg-white"
                                        value={houseForm.house_number}
                                        onChange={(event) => setHouseForm((current) => ({ ...current, house_number: event.target.value }))}
                                    />
                                    <Button type="submit" className="bg-[#00468B] text-white hover:bg-[#003366]">
                                        <Save className="mr-2 size-4" />
                                        {editingHouseholdId ? 'Simpan' : 'Tambah'}
                                    </Button>
                                </div>
                            </form>

                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Blok</TableHead>
                                                <TableHead>No. rumah</TableHead>
                                                <TableHead>Family tersambung</TableHead>
                                                <TableHead>QR data</TableHead>
                                                <TableHead className="w-40 text-center">Aksi</TableHead>
                                            </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {households.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-slate-500">Belum ada data rumah.</TableCell>
                                            </TableRow>
                                        )}
                                        {households.map((household) => {
                                            const isSelected = household.household_id === selectedFamily.household_id;

                                            return (
                                                <TableRow key={household.household_id}>
                                                    <TableCell className="font-semibold">{household.block_number}</TableCell>
                                                    <TableCell>{household.house_number}</TableCell>
                                                    <TableCell>{household.families?.length ?? 0}</TableCell>
                                                    <TableCell className="max-w-xs truncate font-mono text-xs">{household.qr_code_data}</TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm">
                                                            <ActionIconButton
                                                                label={isSelected ? 'Rumah sedang dipakai' : 'Pakai rumah ini'}
                                                                disabled={isSelected || updateFamily.isPending}
                                                                className={isSelected ? 'bg-[#00468B] text-white hover:bg-[#00468B]' : 'text-[#00468B] hover:bg-blue-50'}
                                                                onClick={() => assignHousehold(household.household_id)}
                                                            >
                                                                <CheckCircle2 className="size-4" />
                                                            </ActionIconButton>
                                                            <ActionIconButton label="Edit rumah" onClick={() => startEditHousehold(household)}>
                                                                <Pencil className="size-4" />
                                                            </ActionIconButton>
                                                            <ActionIconButton
                                                                label="Hapus rumah"
                                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                disabled={deleteHousehold.isPending}
                                                                onClick={() => deleteHousehold.mutate(household.household_id)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </ActionIconButton>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
