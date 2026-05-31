import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from '@/hooks/useUsers';
import { useCreateFamily, useFamilies, useSetHeadOfFamily } from '@/hooks/useFamilies';
import { useCreateHousehold } from '@/hooks/useHouseholds';

const roleLabels = {
    WARGA: 'Warga',
    KETUA_RT: 'Ketua RT',
    BENDAHARA: 'Bendahara',
};

const familyModeLabels = {
    existing: 'Masuk family yang ada',
    unassigned: 'Belum punya family',
    new_family: 'Buat rumah + family baru',
};

const getFamilyLabel = (family) => {
    const head = family.members?.find((member) => member.user_id === family.head_of_family_id)
        ?? family.members?.[0];
    const house = family.household
        ? `Blok ${family.household.block_number} No. ${family.household.house_number}`
        : family.qr_code_data;

    return `${head?.full_name ?? 'Tanpa kepala keluarga'} - ${house}`;
};

export default function CreateWargaPage() {
    const { data: families = [] } = useFamilies();
    const createUser = useCreateUser();
    const createHousehold = useCreateHousehold();
    const createFamily = useCreateFamily();
    const setHeadOfFamily = useSetHeadOfFamily();
    const [familyMode, setFamilyMode] = useState('existing');
    const [newHouse, setNewHouse] = useState({
        block_number: '',
        house_number: '',
    });
    const [form, setForm] = useState({
        username: '',
        password: '',
        full_name: '',
        family_id: '',
        role: 'WARGA',
        phone_number: '',
    });

    const selectedFamily = families.find((family) => family.family_id === form.family_id);
    const isSubmitting = createUser.isPending || createHousehold.isPending || createFamily.isPending || setHeadOfFamily.isPending;

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const updateNewHouse = (field, value) => {
        setNewHouse((current) => ({ ...current, [field]: value }));
    };

    const updateFamilyMode = (value) => {
        setFamilyMode(value);
        if (value !== 'existing') {
            updateForm('family_id', '');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (familyMode === 'existing' && !form.family_id) {
            toast.error('Pilih keluarga terlebih dahulu.');
            return;
        }

        if (familyMode === 'new_family' && (!newHouse.block_number.trim() || !newHouse.house_number.trim())) {
            toast.error('Isi blok dan nomor rumah untuk membuat family baru.');
            return;
        }

        try {
            if (familyMode === 'new_family') {
                const household = await createHousehold.mutateAsync({
                    block_number: newHouse.block_number.trim(),
                    house_number: newHouse.house_number.trim(),
                });
                const family = await createFamily.mutateAsync({ household_id: household.household_id });
                const { profile_picture_preview, ...userPayload } = form;
                const user = await createUser.mutateAsync({ ...userPayload, family_id: family.family_id });

                await setHeadOfFamily.mutateAsync({
                    familyId: family.family_id,
                    userId: user.user_id,
                });
            } else {
                const { profile_picture_preview, ...userPayload } = form;
                await createUser.mutateAsync({
                    ...userPayload,
                    family_id: familyMode === 'unassigned' ? null : form.family_id,
                });
            }

            router.visit('/warga/per-warga');
        } catch {
            // Toast error ditangani oleh hook useCreateUser.
        }
    };

    return (
        <DashboardLayout>
            <Head title="Tambah Warga - Wargify" />

            <form onSubmit={handleSubmit} className="p-8">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                        <Link href="/warga/per-warga">
                            <Button type="button" variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Tambah Warga</h1>
                            <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                                Buat akun warga baru dan hubungkan langsung ke data keluarga.
                            </p>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#00468B] text-white hover:bg-[#003366]"
                    >
                        <Save className="mr-2 size-4" />
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Warga'}
                    </Button>
                </div>

                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <Card className="bg-white">
                        <CardHeader>
                            <CardTitle>Ringkasan</CardTitle>
                            <CardDescription>Preview data yang akan disimpan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="size-16 border border-slate-200">
                                        <AvatarImage src={form.profile_picture_preview ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(form.full_name || form.username || 'Warga')}&background=00468B&color=fff`} />
                                        <AvatarFallback>{(form.full_name || form.username || 'WG').substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <Label
                                        htmlFor="profile_picture"
                                        className="absolute -bottom-1 -right-1 grid size-7 cursor-pointer place-items-center rounded-full bg-[#00468B] text-white shadow-sm ring-2 ring-white"
                                    >
                                        <UserPlus className="size-3.5" />
                                    </Label>
                                    <input
                                        id="profile_picture"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (!file) return;

                                            updateForm('profile_picture', file);
                                            updateForm('profile_picture_preview', URL.createObjectURL(file));
                                        }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-base font-black text-slate-900">{form.full_name || 'Nama warga'}</p>
                                    <p className="truncate text-sm font-semibold text-slate-500">@{form.username || 'username'}</p>
                                </div>
                            </div>
                            <div className="space-y-3 rounded-xl border bg-slate-50 p-4 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-500">Role</span>
                                    <Badge className="bg-[#00468B] text-white">{roleLabels[form.role]}</Badge>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-500">Telepon</span>
                                    <span className="text-right font-semibold text-slate-900">{form.phone_number || '-'}</span>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-slate-500">Keluarga</span>
                                    <span className="max-w-48 text-right font-semibold text-slate-900">
                                        {familyMode === 'new_family'
                                            ? `Rumah baru ${newHouse.block_number || '-'}-${newHouse.house_number || '-'}`
                                            : familyMode === 'unassigned'
                                                ? 'Belum punya family'
                                                : selectedFamily
                                                    ? getFamilyLabel(selectedFamily)
                                                    : 'Belum dipilih'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="grid size-10 place-items-center rounded-lg bg-[#E6F6FF] text-[#00468B]">
                                    <UserPlus className="size-5" />
                                </div>
                                <div>
                                    <CardTitle>Data Warga</CardTitle>
                                    <CardDescription>Lengkapi identitas, akses akun, dan keluarga warga.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Nama lengkap</Label>
                                    <Input
                                        id="full_name"
                                        placeholder="Nama lengkap warga"
                                        value={form.full_name}
                                        onChange={(event) => updateForm('full_name', event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">Nomor HP</Label>
                                    <Input
                                        id="phone_number"
                                        placeholder="08123456789"
                                        value={form.phone_number}
                                        onChange={(event) => updateForm('phone_number', event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="username"
                                        value={form.username}
                                        onChange={(event) => updateForm('username', event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        placeholder="Minimal 6 karakter"
                                        type="password"
                                        value={form.password}
                                        onChange={(event) => updateForm('password', event.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select value={form.role} onValueChange={(value) => updateForm('role', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="WARGA">Warga</SelectItem>
                                            <SelectItem value="KETUA_RT">Ketua RT</SelectItem>
                                            <SelectItem value="BENDAHARA">Bendahara</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status family</Label>
                                    <Select value={familyMode} onValueChange={updateFamilyMode}>
                                        <SelectTrigger className="w-full">
                                            <span className="block truncate text-left">{familyModeLabels[familyMode]}</span>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(familyModeLabels).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {familyMode === 'existing' && (
                                    <div className="space-y-2 lg:col-span-2">
                                        <Label>Keluarga</Label>
                                        <Select value={form.family_id} onValueChange={(value) => updateForm('family_id', value)} required>
                                            <SelectTrigger className="w-full">
                                                {selectedFamily ? (
                                                    <span className="block truncate text-left">{getFamilyLabel(selectedFamily)}</span>
                                                ) : (
                                                    <SelectValue placeholder="Pilih keluarga" />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {families.map((family) => (
                                                    <SelectItem key={family.family_id} value={family.family_id}>
                                                        {getFamilyLabel(family)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {familyMode === 'new_family' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="block_number">Blok rumah</Label>
                                            <Input
                                                id="block_number"
                                                placeholder="Contoh: AL"
                                                value={newHouse.block_number}
                                                onChange={(event) => updateNewHouse('block_number', event.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="house_number">Nomor rumah</Label>
                                            <Input
                                                id="house_number"
                                                placeholder="Contoh: 27"
                                                value={newHouse.house_number}
                                                onChange={(event) => updateNewHouse('house_number', event.target.value)}
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </DashboardLayout>
    );
}
