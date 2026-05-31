import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Save, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFamilies } from '@/hooks/useFamilies';
import { useUpdateUser, useUser } from '@/hooks/useUsers';

const roleLabels = {
    WARGA: 'Warga',
    KETUA_RT: 'Ketua RT',
    BENDAHARA: 'Bendahara',
};

const getFamilyLabel = (family) => {
    const head = family.members?.find((member) => member.user_id === family.head_of_family_id)
        ?? family.members?.[0];
    const house = family.household
        ? `Blok ${family.household.block_number} No. ${family.household.house_number}`
        : family.qr_code_data;

    return `${head?.full_name ?? 'Tanpa kepala keluarga'} - ${house}`;
};

export default function EditWargaPage() {
    const userId = new URLSearchParams(window.location.search).get('user_id');
    const { data: user, isLoading } = useUser(userId);
    const { data: families = [] } = useFamilies();
    const updateUser = useUpdateUser();
    const [form, setForm] = useState({
        username: '',
        full_name: '',
        family_id: '',
        role: 'WARGA',
        phone_number: '',
        password: '',
        profile_picture: null,
        profile_picture_preview: '',
    });

    useEffect(() => {
        if (!user) {
            return;
        }

        setForm({
            username: user.username ?? '',
            full_name: user.full_name ?? '',
            family_id: user.family_id ?? '',
            role: user.role ?? 'WARGA',
            phone_number: user.phone_number ?? '',
            password: '',
            profile_picture: null,
            profile_picture_preview: user.profile_picture_url ?? '',
        });
    }, [user]);

    const selectedFamily = families.find((family) => family.family_id === form.family_id);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!userId) {
            toast.error('User tidak ditemukan.');
            return;
        }

        const { profile_picture_preview, ...payload } = form;
        if (!payload.password) {
            delete payload.password;
        }

        try {
            await updateUser.mutateAsync({ userId, payload });
            router.visit('/warga/per-warga');
        } catch {
            // Toast error ditangani oleh hook useUpdateUser.
        }
    };

    return (
        <DashboardLayout>
            <Head title="Kelola Warga - Wargify" />

            <form onSubmit={handleSubmit} className="p-8">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                        <Link href="/warga/per-warga">
                            <Button type="button" variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Kelola Warga</h1>
                            <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                                Perbarui identitas, akses akun, role, dan keluarga warga.
                            </p>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={updateUser.isPending || !userId}
                        className="bg-[#00468B] text-white hover:bg-[#003366]"
                    >
                        <Save className="mr-2 size-4" />
                        {updateUser.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>

                {isLoading && (
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-500">
                        Memuat data warga...
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <Card className="bg-white">
                        <CardHeader>
                            <CardTitle>Ringkasan</CardTitle>
                            <CardDescription>Data warga yang sedang diedit.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="size-16 border border-slate-200">
                                        <AvatarImage src={form.profile_picture_preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.full_name || form.username || 'Warga')}&background=00468B&color=fff`} />
                                        <AvatarFallback>{(form.full_name || form.username || 'WG').substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <Label
                                        htmlFor="profile_picture"
                                        className="absolute -bottom-1 -right-1 grid size-7 cursor-pointer place-items-center rounded-full bg-[#00468B] text-white shadow-sm ring-2 ring-white"
                                    >
                                        <UserCog className="size-3.5" />
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
                                        {selectedFamily ? getFamilyLabel(selectedFamily) : 'Belum dipilih'}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-slate-500">ID User</span>
                                    <span className="max-w-48 break-all text-right font-mono text-xs font-semibold text-slate-700">
                                        {userId ?? '-'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="grid size-10 place-items-center rounded-lg bg-[#E6F6FF] text-[#00468B]">
                                    <UserCog className="size-5" />
                                </div>
                                <div>
                                    <CardTitle>Data Warga</CardTitle>
                                    <CardDescription>Kosongkan password jika tidak ingin menggantinya.</CardDescription>
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
                                    <Label htmlFor="password">Password baru</Label>
                                    <Input
                                        id="password"
                                        placeholder="Kosongkan jika tetap"
                                        type="password"
                                        value={form.password}
                                        onChange={(event) => updateForm('password', event.target.value)}
                                        minLength={form.password ? 6 : undefined}
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
                                    <Label>Keluarga</Label>
                                    <Select value={form.family_id} onValueChange={(value) => updateForm('family_id', value)}>
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
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </DashboardLayout>
    );
}
