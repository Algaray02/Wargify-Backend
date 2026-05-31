import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
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
import QrPreview from '@/components/common/QrPreview';
import {
    useActivity,
    useActivityParticipants,
    useAnnounceActivity,
    useCompleteActivity,
    useDeleteActivity,
    useUpdateActivity,
} from '@/hooks/useActivities';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useCitizenGroups } from '@/hooks/useCitizenGroups';
import { useUsers } from '@/hooks/useUsers';
import { ArrowLeft, CalendarClock, CheckCircle2, Home, Megaphone, Search, Trash2, Users } from 'lucide-react';

const typeLabels = {
    RAPAT: 'Rapat',
    KEGIATAN_UMUM: 'Kegiatan Umum',
};

const statusLabels = {
    DRAFT: 'Belum diumumkan',
    ANNOUNCED: 'Diumumkan',
    COMPLETED: 'Selesai',
};

const householdLabel = (household) => {
    if (!household) return 'Pilih rumah';
    return `Blok ${household.block_number} No. ${household.house_number}`;
};

const toDateTimeLocal = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
};

export default function EditKegiatanPage() {
    const activityId = new URLSearchParams(window.location.search).get('id');
    const [inviteSearch, setInviteSearch] = useState('');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const { data: activity, isLoading, isError } = useActivity(activityId);
    const { data: participants } = useActivityParticipants(activityId);
    const { data: households = [] } = useHouseholds();
    const { data: citizenGroups = [] } = useCitizenGroups();
    const { data: users = [] } = useUsers();
    const updateActivity = useUpdateActivity();
    const deleteActivity = useDeleteActivity();
    const announceActivity = useAnnounceActivity();
    const completeActivity = useCompleteActivity();
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

    useEffect(() => {
        if (!activity) return;

        setForm({
            title: activity.title ?? '',
            description: activity.description ?? '',
            location_name: activity.location_name ?? '',
            type: activity.type ?? 'RAPAT',
            activity_date: toDateTimeLocal(activity.activity_date),
            location_mode: activity.household_id ? 'household' : 'custom',
            household_id: activity.household_id ?? 'none',
            target_group_ids: activity.target_groups?.map((group) => group.group_id) ?? [],
            target_user_ids: activity.invited_users?.map((user) => user.user_id) ?? [],
        });
    }, [activity]);

    const selectedHousehold = useMemo(
        () => households.find((household) => household.household_id === form.household_id),
        [form.household_id, households]
    );

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

            return { ...current, [field]: nextValues };
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
            target_user_ids: form.target_user_ids,
        };

        await updateActivity.mutateAsync({ activityId, payload });
    };

    const handleDelete = async () => {
        await deleteActivity.mutateAsync(activityId);
        router.visit('/kegiatan');
    };

    const isMeeting = form.type === 'RAPAT';
    const qrValue = isMeeting && selectedHousehold ? selectedHousehold.qr_code_data : activity?.attendance_qr_code;
    const presentUsers = participants?.warga ?? activity?.participants ?? [];
    const inviteableUsers = users.filter((user) => ['WARGA', 'KETUA_RT', 'BENDAHARA'].includes(user.role));
    const filteredInviteableUsers = inviteableUsers.filter((user) => {
        const keyword = inviteSearch.trim().toLowerCase();

        return [user.full_name, user.username, user.phone_number, user.role]
            .some((value) => String(value ?? '').toLowerCase().includes(keyword));
    });
    const targetCount = form.target_group_ids.length + form.target_user_ids.length;
    const submitDisabled = updateActivity.isPending
        || (isMeeting && form.location_mode === 'household' && !selectedHousehold);

    return (
        <DashboardLayout>
            <Head title="Kelola Kegiatan - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                        <Link href="/kegiatan" className="rounded-full p-2 transition-colors hover:bg-gray-100">
                            <ArrowLeft className="size-5 text-gray-900" strokeWidth={2.5} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Kelola Kegiatan</h1>
                            <p className="mt-2 max-w-2xl text-sm text-gray-500">
                                Ubah detail agenda dan pantau absensi rapat.
                            </p>
                        </div>
                    </div>
                    {activity && (
                        <Badge variant="outline" className="w-fit">
                            {statusLabels[activity.status] ?? activity.status}
                        </Badge>
                    )}
                </div>

                {isLoading && (
                    <Card className="rounded-lg">
                        <CardContent className="py-10 text-center text-slate-500">Memuat kegiatan...</CardContent>
                    </Card>
                )}

                {isError && (
                    <Card className="rounded-lg">
                        <CardContent className="py-10 text-center text-red-600">Gagal memuat kegiatan.</CardContent>
                    </Card>
                )}

                {activity && (
                    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle>Detail kegiatan</CardTitle>
                                <CardDescription>Perubahan QR absensi akan mengikuti tipe dan lokasi rapat.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Nama kegiatan</Label>
                                    <Input
                                        id="title"
                                        value={form.title}
                                        onChange={(event) => updateForm('title', event.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
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
                                            value={form.location_name}
                                            onChange={(event) => updateForm('location_name', event.target.value)}
                                            required
                                        />
                                    </div>
                                )}

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
                                                ) : filteredInviteableUsers.map((user) => (
                                                    <label key={user.user_id} className="flex cursor-pointer items-center justify-between gap-3 rounded-md bg-white p-2">
                                                        <span>
                                                            <span className="block text-sm font-medium text-slate-800">{user.full_name}</span>
                                                            <span className="text-xs text-slate-500">{user.role}</span>
                                                        </span>
                                                        <Checkbox
                                                            checked={form.target_user_ids.includes(user.user_id)}
                                                            onCheckedChange={() => toggleArrayValue('target_user_ids', user.user_id)}
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-red-200 text-red-700 hover:bg-red-50"
                                        disabled={deleteActivity.isPending}
                                        onClick={() => setIsDeleteOpen(true)}
                                    >
                                        <Trash2 className="size-4" />
                                        Hapus
                                    </Button>
                                    <div className="flex flex-wrap gap-3">
                                        {activity.status === 'DRAFT' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={announceActivity.isPending}
                                                onClick={() => announceActivity.mutate(activity.activity_id)}
                                            >
                                                <Megaphone className="size-4" />
                                                Umumkan
                                            </Button>
                                        )}
                                        {activity.status !== 'COMPLETED' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={completeActivity.isPending}
                                                onClick={() => completeActivity.mutate(activity.activity_id)}
                                            >
                                                <CheckCircle2 className="size-4" />
                                                Selesaikan
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            className="bg-[#00468B] text-white hover:bg-[#003366]"
                                            disabled={submitDisabled}
                                        >
                                            Simpan perubahan
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card className="rounded-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarClock className="size-4" />
                                        QR dan absensi
                                    </CardTitle>
                                    <CardDescription>
                                        Rapat di rumah memakai QR rumah. Kegiatan umum tidak memakai absensi.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-lg border bg-white p-3 text-sm text-slate-600">
                                        {targetCount > 0
                                            ? `${targetCount} target undangan dipilih. Warga di luar target tidak melihat kegiatan ini.`
                                            : 'Tidak ada target khusus, kegiatan berlaku untuk seluruh warga.'}
                                    </div>
                                    {isMeeting && qrValue && (
                                        <QrPreview label={selectedHousehold ? householdLabel(selectedHousehold) : activity.title} value={qrValue} />
                                    )}
                                    {isMeeting && !qrValue && (
                                        <div className="rounded-lg border border-dashed p-4 text-sm text-slate-600">
                                            QR aktivitas akan dibuat saat perubahan disimpan.
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

                            {isMeeting && (
                                <Card className="rounded-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="size-4" />
                                            Peserta hadir
                                        </CardTitle>
                                        <CardDescription>{presentUsers.length} warga tercatat hadir.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {presentUsers.length === 0 ? (
                                            <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">Belum ada absensi.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {presentUsers.map((user) => (
                                                    <div key={user.user_id} className="flex items-center justify-between rounded-lg border p-3">
                                                        <span className="font-medium text-slate-800">{user.full_name}</span>
                                                        <Badge variant="outline">{user.role}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </form>
                )}

                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus kegiatan?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Kegiatan {activity?.title} akan dihapus permanen bersama data undangan dan absensi yang terkait.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteActivity.isPending}>Batal</AlertDialogCancel>
                            <AlertDialogAction disabled={deleteActivity.isPending} onClick={handleDelete}>
                                Hapus Kegiatan
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
