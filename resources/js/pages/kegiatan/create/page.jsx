import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import QrPreview from '@/components/common/QrPreview';
import { useAnnounceActivity, useCreateActivity } from '@/hooks/useActivities';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useCitizenGroups } from '@/hooks/useCitizenGroups';
import { useUsers } from '@/hooks/useUsers';
import { ArrowLeft, CalendarClock, Home, Info, MapPin, Search, Users } from 'lucide-react';

const typeLabels = {
    RAPAT: 'Rapat',
    KEGIATAN_UMUM: 'Kegiatan Umum',
};

const householdLabel = (household) => {
    if (!household) return 'Pilih rumah';
    return `Blok ${household.block_number} No. ${household.house_number}`;
};

export default function CreateKegiatanPage() {
    const [inviteSearch, setInviteSearch] = useState('');
    const [form, setForm] = useState({
        title: '',
        description: '',
        location_name: '',
        type: 'RAPAT',
        activity_date: '',
        location_mode: 'custom',
        household_id: 'none',
        target_group_ids: [],
        target_user_ids: [],
    });
    const [shouldAnnounce, setShouldAnnounce] = useState(false);
    const createActivity = useCreateActivity();
    const announceActivity = useAnnounceActivity();
    const { data: households = [] } = useHouseholds();
    const { data: citizenGroups = [] } = useCitizenGroups();
    const { data: users = [] } = useUsers();
    const inviteableUsers = users.filter((user) => ['WARGA', 'KETUA_RT', 'BENDAHARA'].includes(user.role));
    const filteredInviteableUsers = inviteableUsers.filter((user) => {
        const keyword = inviteSearch.trim().toLowerCase();

        return [user.full_name, user.username, user.phone_number, user.role]
            .some((value) => String(value ?? '').toLowerCase().includes(keyword));
    });

    const selectedHousehold = useMemo(
        () => households.find((household) => household.household_id === form.household_id),
        [form.household_id, households]
    );
    const selectedGroupMemberIds = useMemo(() => new Set(
        citizenGroups
            .filter((group) => form.target_group_ids.includes(group.group_id))
            .flatMap((group) => group.members?.map((member) => member.user_id) ?? [])
    ), [citizenGroups, form.target_group_ids]);

    const updateForm = (field, value) => {
        setForm((current) => {
            const next = { ...current, [field]: value };

            if (field === 'type' && value === 'KEGIATAN_UMUM') {
                next.location_mode = 'custom';
                next.household_id = 'none';
            }

            if (field === 'location_mode' && value === 'custom') {
                next.household_id = 'none';
            }

            if (field === 'household_id') {
                const household = households.find((item) => item.household_id === value);
                if (household) {
                    next.location_name = householdLabel(household);
                }
            }

            return next;
        });
    };

    const toggleArrayValue = (field, value) => {
        setForm((current) => {
            const currentValues = current[field];
            const nextValues = currentValues.includes(value)
                ? currentValues.filter((item) => item !== value)
                : [...currentValues, value];

            if (field !== 'target_group_ids') {
                return { ...current, [field]: nextValues };
            }

            const memberIds = new Set(
                citizenGroups
                    .filter((group) => nextValues.includes(group.group_id))
                    .flatMap((group) => group.members?.map((member) => member.user_id) ?? [])
            );

            return {
                ...current,
                target_group_ids: nextValues,
                target_user_ids: current.target_user_ids.filter((userId) => !memberIds.has(userId)),
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = {
            type: form.type,
            title: form.title,
            description: form.description,
            location_name: form.location_name,
            activity_date: form.activity_date,
            household_id: form.type === 'RAPAT' && form.location_mode === 'household' && selectedHousehold ? form.household_id : null,
            target_group_ids: form.target_group_ids,
            target_user_ids: form.target_user_ids.filter((userId) => !selectedGroupMemberIds.has(userId)),
        };

        const activity = await createActivity.mutateAsync(payload);

        if (shouldAnnounce) {
            await announceActivity.mutateAsync(activity.activity_id);
        }

        router.visit('/kegiatan');
    };

    const isMeeting = form.type === 'RAPAT';
    const qrValue = isMeeting && selectedHousehold ? selectedHousehold.qr_code_data : null;
    const targetCount = form.target_group_ids.length + form.target_user_ids.length;
    const submitDisabled = createActivity.isPending
        || announceActivity.isPending
        || (isMeeting && form.location_mode === 'household' && !selectedHousehold);

    return (
        <DashboardLayout>
            <Head title="Tambah Kegiatan - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex items-start gap-3">
                    <Link href="/kegiatan" className="rounded-full p-2 transition-colors hover:bg-gray-100">
                        <ArrowLeft className="size-5 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tambah Kegiatan</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Buat agenda baru. Absensi hanya aktif untuk rapat.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Informasi kegiatan</CardTitle>
                            <CardDescription>Isi detail yang akan tampil di daftar kegiatan warga.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Nama kegiatan</Label>
                                <Input
                                    id="title"
                                    placeholder="Contoh: Rapat warga bulanan"
                                    value={form.title}
                                    onChange={(event) => updateForm('title', event.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Tulis ringkasan kegiatan"
                                    className="min-h-32 resize-none"
                                    value={form.description}
                                    onChange={(event) => updateForm('description', event.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Tipe kegiatan</Label>
                                    <Select value={form.type} onValueChange={(value) => updateForm('type', value)}>
                                        <SelectTrigger className="text-left">{typeLabels[form.type]}</SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(typeLabels).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="activity_date">Tanggal dan jam</Label>
                                    <Input
                                        id="activity_date"
                                        type="datetime-local"
                                        value={form.activity_date}
                                        onChange={(event) => updateForm('activity_date', event.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {isMeeting && (
                                <div className="grid gap-2">
                                    <Label>Mode lokasi rapat</Label>
                                    <Select value={form.location_mode} onValueChange={(value) => updateForm('location_mode', value)}>
                                        <SelectTrigger className="text-left">
                                            {form.location_mode === 'household' ? 'Rumah warga' : 'Lokasi bebas'}
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom">Lokasi bebas</SelectItem>
                                            <SelectItem value="household">Rumah warga</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {isMeeting && form.location_mode === 'household' ? (
                                <div className="grid gap-2">
                                    <Label>Rumah tempat rapat</Label>
                                    <Select value={form.household_id} onValueChange={(value) => updateForm('household_id', value)}>
                                        <SelectTrigger className="text-left">
                                            <span className="block truncate">{householdLabel(selectedHousehold)}</span>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Pilih rumah</SelectItem>
                                            {households.map((household) => (
                                                <SelectItem key={household.household_id} value={household.household_id}>
                                                    {householdLabel(household)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    <Label htmlFor="location_name">Lokasi</Label>
                                    <Input
                                        id="location_name"
                                        placeholder="Contoh: Balai warga"
                                        value={form.location_name}
                                        onChange={(event) => updateForm('location_name', event.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                                <div>
                                    <Label htmlFor="announce" className="font-semibold">Umumkan setelah disimpan</Label>
                                    <p className="mt-1 text-xs text-slate-500">Jika mati, kegiatan tersimpan sebagai draft.</p>
                                </div>
                                <Switch id="announce" checked={shouldAnnounce} onCheckedChange={setShouldAnnounce} />
                            </div>

                            <div className="grid gap-4 rounded-lg border p-4">
                                <div>
                                    <Label className="flex items-center gap-2 text-base font-semibold">
                                        <Users className="size-4" />
                                        Undangan dan pengumuman
                                    </Label>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Kosongkan jika kegiatan ditujukan untuk seluruh warga.
                                    </p>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-slate-700">Kelompok warga</p>
                                        <div className="max-h-48 space-y-2 overflow-auto rounded-lg border bg-slate-50 p-3">
                                            {citizenGroups.length === 0 ? (
                                                <p className="text-sm text-slate-500">Belum ada kelompok.</p>
                                            ) : citizenGroups.map((group) => (
                                                <label key={group.group_id} className="flex cursor-pointer items-center justify-between gap-3 rounded-md bg-white p-2">
                                                    <span>
                                                        <span className="block text-sm font-medium text-slate-800">{group.name}</span>
                                                        <span className="text-xs text-slate-500">{group.members_count ?? group.members?.length ?? 0} anggota</span>
                                                    </span>
                                                    <Checkbox
                                                        checked={form.target_group_ids.includes(group.group_id)}
                                                        onCheckedChange={() => toggleArrayValue('target_group_ids', group.group_id)}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-slate-700">Warga tertentu</p>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                placeholder="Cari nama, username, telepon, atau role"
                                                className="pl-9"
                                                value={inviteSearch}
                                                onChange={(event) => setInviteSearch(event.target.value)}
                                            />
                                        </div>
                                        <div className="max-h-48 space-y-2 overflow-auto rounded-lg border bg-slate-50 p-3">
                                            {filteredInviteableUsers.length === 0 ? (
                                                <p className="rounded-md bg-white p-2 text-sm text-slate-500">Tidak ada warga yang cocok.</p>
                                            ) : filteredInviteableUsers.map((user) => {
                                                const includedByGroup = selectedGroupMemberIds.has(user.user_id);

                                                return (
                                                <label key={user.user_id} className={`flex items-center justify-between gap-3 rounded-md bg-white p-2 ${includedByGroup ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                                    <span>
                                                        <span className="block text-sm font-medium text-slate-800">{user.full_name}</span>
                                                        <span className="text-xs text-slate-500">{includedByGroup ? 'Sudah termasuk dari kelompok yang dipilih' : user.role}</span>
                                                    </span>
                                                    <Checkbox
                                                        checked={!includedByGroup && form.target_user_ids.includes(user.user_id)}
                                                        disabled={includedByGroup}
                                                        onCheckedChange={() => toggleArrayValue('target_user_ids', user.user_id)}
                                                    />
                                                </label>
                                            )})}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarClock className="size-4" />
                                    Aturan absensi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-white p-3">
                                    <div className="flex items-start gap-2">
                                        <Info className="mt-0.5 size-4 text-blue-700" />
                                        <p className="text-sm text-slate-600">
                                            Kegiatan umum tidak memakai QR dan tidak masuk absensi. Rapat memakai absensi.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-lg border bg-white p-3 text-sm text-slate-600">
                                    {targetCount > 0
                                        ? `${targetCount} target undangan dipilih. Pengumuman kegiatan hanya relevan untuk target tersebut.`
                                        : 'Tidak ada target khusus, kegiatan berlaku untuk seluruh warga.'}
                                </div>

                                {isMeeting && selectedHousehold && (
                                    <QrPreview label={householdLabel(selectedHousehold)} value={qrValue} />
                                )}

                                {isMeeting && !selectedHousehold && (
                                    <div className="rounded-lg border border-dashed p-4 text-sm text-slate-600">
                                        <MapPin className="mb-2 size-5 text-slate-500" />
                                        Rapat di lokasi bebas akan dibuatkan QR aktivitas setelah disimpan.
                                    </div>
                                )}

                                {!isMeeting && (
                                    <div className="rounded-lg border border-dashed p-4 text-sm text-slate-600">
                                        <Home className="mb-2 size-5 text-slate-500" />
                                        Tidak ada QR absensi untuk kegiatan umum.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Link href="/kegiatan">
                                <Button type="button" variant="outline">Batal</Button>
                            </Link>
                            <Button
                                type="submit"
                                className="bg-[#00468B] text-white hover:bg-[#003366]"
                                disabled={submitDisabled}
                            >
                                Simpan kegiatan
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
