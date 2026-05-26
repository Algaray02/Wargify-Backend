import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowUpRight,
    BadgeDollarSign,
    BellRing,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Home,
    MoonStar,
    RadioTower,
    Target,
    UsersRound,
} from 'lucide-react';
import { useFamilies } from '@/hooks/useFamilies';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useRondaSchedules } from '@/hooks/useRonda';
import { useTreasurySummary } from '@/hooks/useTreasury';
import { useUsers } from '@/hooks/useUsers';

export default function DashboardPage() {
    const { data: users = [] } = useUsers();
    const { data: families = [] } = useFamilies();
    const { data: households = [] } = useHouseholds();
    const { data: schedules = [] } = useRondaSchedules();
    const { data: treasurySummary } = useTreasurySummary();
    const activeRonda = schedules.filter((schedule) => schedule.status === 'ONGOING').length;
    const scheduledRonda = schedules.filter((schedule) => schedule.status === 'SCHEDULED').length;
    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value ?? 0);

    const stats = [
        { label: 'Total Keluarga', value: String(families.length), change: 'live data', icon: Home, tone: 'bg-[#00468B]' },
        { label: 'Total Warga', value: String(users.length), change: 'live data', icon: UsersRound, tone: 'bg-[#2A6B2C]' },
        { label: 'Saldo Kas', value: formatCurrency(treasurySummary?.current_balance), change: 'live data', icon: BadgeDollarSign, tone: 'bg-[#00468B]' },
        { label: 'Total Rumah', value: String(households.length), change: 'live data', icon: Building2, tone: 'bg-[#AD1114]' },
    ];

    const operations = [
        { label: 'Total pemasukan kas', value: formatCurrency(treasurySummary?.total_income), progress: 100, icon: Target },
        { label: 'Pertemuan terjadwal', value: '4 agenda', progress: 64, icon: CalendarDays },
        { label: 'Jadwal ronda aktif', value: `${activeRonda} aktif, ${scheduledRonda} mendatang`, progress: schedules.length ? Math.round((activeRonda / schedules.length) * 100) : 0, icon: MoonStar },
    ];

    const activities = [
        { title: 'Laporan fasilitas baru', meta: 'Jalan berlubang ditandai belum ditangani', status: 'Prioritas' },
        { title: 'Ronda malam berjalan', meta: 'Kelompok 2 sudah melewati checkpoint utama', status: 'Live' },
        { title: 'Pengumuman siap terbit', meta: 'Kerja bakti akhir pekan menunggu publikasi', status: 'Draft' },
    ];

    return (
        <DashboardLayout>
            <Head title="Dashboard - Wargify" />
            
            <div className="space-y-8 p-6 md:p-8">
                <section className="overflow-hidden rounded-[2rem] border border-[#00468B]/10 bg-[#00468B] text-white shadow-2xl shadow-slate-900/12">
                    <div className="relative grid gap-8 p-6 md:grid-cols-[1.2fr_.8fr] md:p-8">
                        <div className="relative space-y-5">
                            <div className="max-w-2xl space-y-3">
                                <h1 className="text-3xl font-black tracking-tight md:text-5xl !text-white">
                                    Semua layanan lingkungan dalam satu kendali.
                                </h1>
                                <p className="text-sm font-medium leading-6 text-cyan-50/78 md:text-base">
                                    Pantau warga, iuran, fasilitas, agenda, dan ronda dengan ringkasan yang cepat dibaca.
                                </p>
                            </div>
                        </div>
                        {/* <div className="relative rounded-3xl border border-white/18 bg-white/10 p-5 shadow-inner">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-cyan-50/70">Kesehatan operasional</p>
                                    <p className="mt-1 text-4xl font-black">87%</p>
                                </div>
                                <div className="grid size-14 place-items-center rounded-2xl bg-[#E6F6FF] text-[#00468B]">
                                    <CheckCircle2 className="size-7" />
                                </div>
                            </div>
                            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/14">
                                <div className="h-full w-[87%] rounded-full bg-[#ACF4A4]" />
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase text-cyan-50/70">
                                <span>Stabil</span>
                                <span>3 perlu perhatian</span>
                            </div>
                        </div> */}
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Card key={index} className="group border-white/70 bg-white/80 p-0 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className={`grid size-12 place-items-center rounded-2xl ${stat.tone} text-white shadow-lg`}>
                                        <stat.icon className="size-5" />
                                    </div>
                                    <Badge variant="secondary" className="bg-[#E6F6FF] text-[#00468B]">
                                        <ArrowUpRight className="mr-1 size-3" />
                                        {stat.change}
                                    </Badge>
                                </div>
                                <div className="mt-6">
                                    <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                                    <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
                    <Card className="border-white/70 bg-white/82">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-black">
                                <Clock3 className="size-5 text-[#00468B]" />
                                Fokus Minggu Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 px-5 pb-5">
                            {operations.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="grid size-10 place-items-center rounded-xl bg-[#E6F6FF] text-[#00468B] shadow-sm">
                                                <item.icon className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{item.label}</p>
                                                <p className="text-xs font-medium text-slate-500">{item.value}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{item.progress}%</span>
                                    </div>
                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                                        <div className="h-full rounded-full bg-[#00468B]" style={{ width: `${item.progress}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-white/70 bg-white/82">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-black">
                                <BellRing className="size-5 text-[#00468B]" />
                                Aktivitas Terbaru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 px-5 pb-5">
                            {activities.map((item) => (
                                <div key={item.title} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm">
                                    <div>
                                        <p className="font-bold text-slate-900">{item.title}</p>
                                        <p className="mt-1 text-sm font-medium text-slate-500">{item.meta}</p>
                                    </div>
                                    <Badge className="bg-[#00468B] text-white hover:bg-[#00468B]">{item.status}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </DashboardLayout>
    );
}
