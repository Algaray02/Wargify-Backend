import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { useCreateRondaSchedule, useRondaCheckpoints, useRondaGroups } from '@/hooks/useRonda';
import { ArrowLeft, CalendarClock, CheckCircle2, MapPin, Save, Users } from 'lucide-react';

const toDateTime = (date, time, addDay = false) => {
    if (!date || !time) return null;
    const value = new Date(`${date}T${time}:00`);
    if (addDay) value.setDate(value.getDate() + 1);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')} ${time}:00`;
};

const selectedLabel = (value, options, fallback) => (
    options.find((option) => option.value === value)?.label ?? fallback
);

export default function TambahJadwalRondaPage() {
    const [form, setForm] = useState({
        group_id: '',
        coordinator_id: '',
        schedule_date: '',
        shift_start: '22:00',
        shift_end: '03:00',
        status: 'SCHEDULED',
        checkpoint_ids: [],
    });
    const { data: groups = [] } = useRondaGroups();
    const { data: checkpoints = [] } = useRondaCheckpoints();
    const createSchedule = useCreateRondaSchedule();

    const selectedGroup = useMemo(
        () => groups.find((group) => group.group_id === form.group_id),
        [form.group_id, groups]
    );

    const members = selectedGroup?.members ?? [];
    const groupOptions = groups.map((group) => ({ value: group.group_id, label: group.name }));
    const statusOptions = [
        { value: 'SCHEDULED', label: 'Terjadwal' },
        { value: 'ONGOING', label: 'Berlangsung' },
        { value: 'COMPLETED', label: 'Selesai' },
        { value: 'MISSED', label: 'Terlewat' },
    ];

    const updateForm = (field, value) => {
        setForm((current) => {
            if (field === 'group_id') {
                const group = groups.find((item) => item.group_id === value);
                return {
                    ...current,
                    group_id: value,
                    coordinator_id: group?.members?.[0]?.user_id ?? '',
                };
            }

            return { ...current, [field]: value };
        });
    };

    const toggleCheckpoint = (checkpointId) => {
        setForm((current) => ({
            ...current,
            checkpoint_ids: current.checkpoint_ids.includes(checkpointId)
                ? current.checkpoint_ids.filter((id) => id !== checkpointId)
                : [...current.checkpoint_ids, checkpointId],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        await createSchedule.mutateAsync({
            group_id: form.group_id,
            coordinator_id: form.coordinator_id,
            schedule_date: form.schedule_date,
            shift_start: toDateTime(form.schedule_date, form.shift_start),
            shift_end: toDateTime(form.schedule_date, form.shift_end, form.shift_end < form.shift_start),
            status: form.status,
            checkpoint_ids: form.checkpoint_ids,
        });

        router.visit('/ronda/jadwal');
    };

    return (
        <DashboardLayout>
            <Head title="Tambah Jadwal Ronda - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex items-start gap-3">
                    <Link href="/ronda/jadwal" className="rounded-full p-2 transition-colors hover:bg-gray-100">
                        <ArrowLeft className="size-5 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tambah Jadwal Ronda</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Pilih kelompok, koordinator, waktu bertugas, dan checkpoint yang harus dipindai.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
                    <div className="space-y-6">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarClock className="size-5 text-[#00468B]" />
                                    Detail Jadwal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Kelompok</Label>
                                        <Select value={form.group_id} onValueChange={(value) => updateForm('group_id', value)}>
                                            <SelectTrigger>
                                                {selectedLabel(form.group_id, groupOptions, 'Pilih kelompok ronda')}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {groupOptions.map((group) => (
                                                    <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <Select value={form.status} onValueChange={(value) => updateForm('status', value)}>
                                            <SelectTrigger>
                                                {selectedLabel(form.status, statusOptions, 'Pilih status')}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="schedule_date">Tanggal</Label>
                                        <Input id="schedule_date" type="date" value={form.schedule_date} onChange={(event) => updateForm('schedule_date', event.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="shift_start">Mulai</Label>
                                        <Input id="shift_start" type="time" value={form.shift_start} onChange={(event) => updateForm('shift_start', event.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="shift_end">Selesai</Label>
                                        <Input id="shift_end" type="time" value={form.shift_end} onChange={(event) => updateForm('shift_end', event.target.value)} required />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="size-5 text-[#00468B]" />
                                    Koordinator
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!form.group_id ? (
                                    <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">Pilih kelompok dulu untuk melihat anggota.</p>
                                ) : members.length === 0 ? (
                                    <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">Kelompok ini belum memiliki anggota.</p>
                                ) : (
                                    <RadioGroup value={form.coordinator_id} onValueChange={(value) => updateForm('coordinator_id', value)} className="space-y-2">
                                        {members.map((member) => (
                                            <label key={member.user_id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3">
                                                <span>
                                                    <span className="block text-sm font-medium text-slate-900">{member.full_name}</span>
                                                    <span className="text-xs text-slate-500">{member.phone_number ?? '-'} · {member.role}</span>
                                                </span>
                                                <RadioGroupItem value={member.user_id} />
                                            </label>
                                        ))}
                                    </RadioGroup>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="size-5 text-[#00468B]" />
                                Checkpoint
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
                                {form.checkpoint_ids.length} dari {checkpoints.length} checkpoint dipilih.
                            </div>
                            <div className="max-h-[460px] space-y-2 overflow-auto">
                                {checkpoints.length === 0 ? (
                                    <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">Belum ada checkpoint ronda.</p>
                                ) : checkpoints.map((checkpoint) => (
                                    <label key={checkpoint.checkpoint_id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3">
                                        <span>
                                            <span className="block text-sm font-medium text-slate-900">{checkpoint.name}</span>
                                            <span className="text-xs text-slate-500">{checkpoint.qr_code_data}</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {checkpoint.is_main_pos && <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Pos utama</Badge>}
                                            <Checkbox checked={form.checkpoint_ids.includes(checkpoint.checkpoint_id)} onCheckedChange={() => toggleCheckpoint(checkpoint.checkpoint_id)} />
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <Button
                                type="submit"
                                disabled={createSchedule.isPending || !form.group_id || !form.coordinator_id}
                                className="w-full bg-[#00468B] text-white hover:bg-[#003366]"
                            >
                                <Save className="size-4" />
                                {createSchedule.isPending ? 'Menyimpan...' : 'Simpan Jadwal'}
                            </Button>
                            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                                <CheckCircle2 className="mt-0.5 size-4" />
                                Jadwal tersimpan ke tabel `ronda_schedules` dan relasi checkpoint tersimpan ke `schedule_checkpoints`.
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </DashboardLayout>
    );
}
