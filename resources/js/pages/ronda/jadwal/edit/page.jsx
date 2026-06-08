import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useRondaGroups, useRondaSchedules, useUpdateRondaSchedule } from '@/hooks/useRonda';
import { ArrowLeft, Save, Users } from 'lucide-react';

const weekdayOptions = [
    { value: '1', label: 'Senin' },
    { value: '2', label: 'Selasa' },
    { value: '3', label: 'Rabu' },
    { value: '4', label: 'Kamis' },
    { value: '5', label: 'Jumat' },
    { value: '6', label: 'Sabtu' },
    { value: '7', label: 'Minggu' },
];

const weekdayFromDate = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '';

    return String(date.getDay() === 0 ? 7 : date.getDay());
};

const dateForWeekday = (dayOfWeek) => {
    const today = new Date();
    const todayIsoDay = today.getDay() === 0 ? 7 : today.getDay();
    const daysUntilTarget = (Number(dayOfWeek) - todayIsoDay + 7) % 7;
    const date = new Date(today);
    date.setDate(today.getDate() + daysUntilTarget);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const toInputTime = (value) => value ? new Date(value).toTimeString().slice(0, 5) : '';
const toDateTime = (date, time, addDay = false) => {
    if (!date || !time) return null;
    const value = new Date(`${date}T${time}:00`);
    if (addDay) value.setDate(value.getDate() + 1);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')} ${time}:00`;
};
const selectedLabel = (value, options, fallback) => options.find((option) => option.value === value)?.label ?? fallback;

export default function EditJadwalRondaPage() {
    const scheduleId = new URLSearchParams(window.location.search).get('id');
    const [form, setForm] = useState({
        group_id: '',
        coordinator_id: '',
        weekday: '1',
        shift_start: '',
        shift_end: '',
        status: 'SCHEDULED',
    });
    const { data: schedules = [], isLoading } = useRondaSchedules();
    const { data: groups = [] } = useRondaGroups();
    const updateSchedule = useUpdateRondaSchedule();
    const schedule = useMemo(() => schedules.find((item) => item.schedule_id === scheduleId), [scheduleId, schedules]);
    const selectedGroup = useMemo(() => groups.find((group) => group.group_id === form.group_id), [form.group_id, groups]);
    const members = selectedGroup?.members ?? [];
    const groupOptions = groups.map((group) => ({ value: group.group_id, label: group.name }));
    const usedWeekdays = useMemo(
        () => new Set(
            schedules
                .filter((item) => item.schedule_id !== scheduleId)
                .map((item) => weekdayFromDate(item.schedule_date))
                .filter(Boolean)
        ),
        [scheduleId, schedules]
    );
    const statusOptions = [
        { value: 'SCHEDULED', label: 'Terjadwal' },
        { value: 'ONGOING', label: 'Berlangsung' },
        { value: 'COMPLETED', label: 'Selesai' },
        { value: 'MISSED', label: 'Terlewat' },
    ];

    useEffect(() => {
        if (!schedule) return;
        setForm({
            group_id: schedule.group_id,
            coordinator_id: schedule.coordinator_id,
            weekday: weekdayFromDate(schedule.schedule_date),
            shift_start: toInputTime(schedule.shift_start),
            shift_end: toInputTime(schedule.shift_end),
            status: schedule.status,
        });
    }, [schedule]);

    const updateForm = (field, value) => setForm((current) => {
        if (field === 'group_id') {
            const group = groups.find((item) => item.group_id === value);
            return { ...current, group_id: value, coordinator_id: group?.members?.[0]?.user_id ?? '' };
        }
        return { ...current, [field]: value };
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        const scheduleDate = dateForWeekday(form.weekday);

        await updateSchedule.mutateAsync({
            scheduleId,
            payload: {
                group_id: form.group_id,
                coordinator_id: form.coordinator_id,
                schedule_date: scheduleDate,
                shift_start: toDateTime(scheduleDate, form.shift_start),
                shift_end: toDateTime(scheduleDate, form.shift_end, form.shift_end < form.shift_start),
                status: form.status,
            },
        });
        router.visit('/ronda/jadwal');
    };

    return (
        <DashboardLayout>
            <Head title="Edit Jadwal Ronda - Wargify" />
            <div className="space-y-6 p-8">
                <div className="flex items-start gap-3">
                    <Link href="/ronda/jadwal" className="rounded-full p-2 transition-colors hover:bg-gray-100">
                        <ArrowLeft className="size-5 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Jadwal Ronda</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">Perbarui hari mingguan, kelompok, koordinator, waktu, dan status jadwal.</p>
                    </div>
                </div>

                {isLoading && <p className="rounded-lg border bg-white p-6 text-sm text-slate-500">Memuat jadwal...</p>}
                {!isLoading && !schedule && <p className="rounded-lg border bg-white p-6 text-sm text-slate-500">Jadwal tidak ditemukan.</p>}

                {schedule && (
                    <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
                            <Card className="rounded-lg">
                                <CardHeader><CardTitle>Detail Jadwal</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label>Kelompok</Label>
                                            <Select value={form.group_id} onValueChange={(value) => updateForm('group_id', value)}>
                                                <SelectTrigger>{selectedLabel(form.group_id, groupOptions, 'Pilih kelompok')}</SelectTrigger>
                                                <SelectContent>
                                                    {groupOptions.map((group) => <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Status</Label>
                                            <Select value={form.status} onValueChange={(value) => updateForm('status', value)}>
                                                <SelectTrigger>{selectedLabel(form.status, statusOptions, 'Pilih status')}</SelectTrigger>
                                                <SelectContent>
                                                    {statusOptions.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label>Hari</Label>
                                            <Select value={form.weekday} onValueChange={(value) => updateForm('weekday', value)}>
                                                <SelectTrigger>{selectedLabel(form.weekday, weekdayOptions, 'Pilih hari')}</SelectTrigger>
                                                <SelectContent>
                                                    {weekdayOptions.map((day) => (
                                                        <SelectItem key={day.value} value={day.value} disabled={usedWeekdays.has(day.value)}>
                                                            {day.label}{usedWeekdays.has(day.value) ? ' - sudah ada' : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2"><Label>Mulai</Label><Input type="time" value={form.shift_start} onChange={(e) => updateForm('shift_start', e.target.value)} required /></div>
                                        <div className="grid gap-2"><Label>Selesai</Label><Input type="time" value={form.shift_end} onChange={(e) => updateForm('shift_end', e.target.value)} required /></div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-lg">
                                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="size-5 text-[#00468B]" /> Koordinator</CardTitle></CardHeader>
                                <CardContent>
                                    <RadioGroup value={form.coordinator_id} onValueChange={(value) => updateForm('coordinator_id', value)} className="space-y-2">
                                        {members.map((member) => (
                                            <label key={member.user_id} className="flex cursor-pointer items-center justify-between rounded-lg border p-3">
                                                <span><span className="block text-sm font-medium">{member.full_name}</span><span className="text-xs text-slate-500">{member.phone_number ?? '-'} · {member.role}</span></span>
                                                <RadioGroupItem value={member.user_id} />
                                            </label>
                                        ))}
                                    </RadioGroup>
                                </CardContent>
                            </Card>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={updateSchedule.isPending || !form.group_id || !form.coordinator_id || usedWeekdays.has(form.weekday)} className="bg-[#00468B] text-white hover:bg-[#003366]">
                                <Save className="size-4" />
                                {updateSchedule.isPending ? 'Menyimpan...' : 'Simpan Jadwal'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
}
