import React, { useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
  BadgeDollarSign,
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleUser,
  GalleryHorizontalEnd,
  Home,
  LogOut,
  Megaphone,
  MoonStar,
  RadioTower,
  Search,
  ShieldAlert,
  Siren,
  UsersRound,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export default function DashboardLayout({ children }) {
    const { props, url } = usePage();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const authUser = props.auth?.user ?? (() => {
        try {
            return JSON.parse(localStorage.getItem('auth_user') || 'null');
        } catch {
            return null;
        }
    })();

    const handleLogout = async () => {
        try {
            await authService.logout();
            toast.success('Logout berhasil.');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Logout gagal. Sesi lokal tetap dibersihkan.');
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            router.visit('/login');
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: Home },
        { 
            name: 'Warga', 
            path: '/warga', // Base path for active matching
            icon: UsersRound,
            subItems: [
                { name: 'Per Kepala', path: '/warga/per-kepala' },
                { name: 'Per Warga', path: '/warga/per-warga' },
                { name: 'Kelompok Warga', path: '/warga/kelompok' },
            ]
        },
        { name: 'Gallery', path: '/gallery', icon: GalleryHorizontalEnd },
        { name: 'Kegiatan', path: '/kegiatan', icon: CalendarDays },
        { 
            name: 'Keuangan', 
            path: '/keuangan',
            icon: BadgeDollarSign,
            subItems: [
                { name: 'Catatan', path: '/keuangan/catatan' },
                { name: 'Iuran', path: '/keuangan/iuran' },
                { name: 'Kategori Iuran', path: '/keuangan/iuran/kategori' },
            ]
        },
        { name: 'Fasilitas', path: '/fasilitas', icon: Building2 },
        { name: 'Pengumuman', path: '/pengumuman', icon: Megaphone },
        { 
            name: 'Ronda', 
            path: '/ronda',
            icon: MoonStar,
            subItems: [
                { name: 'Jadwal Ronda', path: '/ronda/jadwal' },
                { name: 'Kelompok Ronda', path: '/ronda/kelompok' },
                { name: 'Riwayat Ronda', path: '/ronda/riwayat' },
                { name: 'Checkpoint', path: '/ronda/checkpoint' },
            ]
        },
        { name: 'SoS Log', path: '/sos-log', icon: ShieldAlert },
    ];

    const searchItems = useMemo(() => {
        return navItems.flatMap((item) => {
            const parent = {
                name: item.name,
                path: item.path,
                icon: item.icon,
                keywords: [item.name, item.path],
            };

            const children = item.subItems?.map((subItem) => ({
                name: subItem.name,
                path: subItem.path,
                icon: item.icon,
                keywords: [item.name, subItem.name, subItem.path],
            })) ?? [];

            return [parent, ...children];
        });
    }, []);

    const filteredSearchItems = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();

        if (!keyword) {
            return searchItems.slice(0, 6);
        }

        return searchItems
            .filter((item) => item.keywords.some((value) => value.toLowerCase().includes(keyword)))
            .slice(0, 8);
    }, [searchItems, searchQuery]);

    const notifications = [
        {
            id: 'sos-1',
            title: 'SOS baru dari warga',
            description: 'Pak Joko mengirim sinyal darurat di area Blok A.',
            time: '2 menit lalu',
            icon: Siren,
            tone: 'text-[#AD1114] bg-red-50',
        },
        {
            id: 'report-1',
            title: 'Laporan fasilitas masuk',
            description: 'Lampu jalan depan rumah A-4 perlu ditindaklanjuti.',
            time: '18 menit lalu',
            icon: Building2,
            tone: 'text-[#00468B] bg-[#E6F6FF]',
        },
        {
            id: 'activity-1',
            title: 'Kegiatan siap diumumkan',
            description: 'Rapat Anggaran RT Mei 2026 menunggu publikasi.',
            time: '1 jam lalu',
            icon: CalendarDays,
            tone: 'text-[#2A6B2C] bg-green-50',
        },
    ];

    const currentItem = navItems.find((item) => url === item.path || url.startsWith(item.path + '/')) ?? navItems[0];
    const goToSearchItem = (item) => {
        setSearchQuery('');
        setIsSearchOpen(false);
        router.visit(item.path);
    };

    return (
        <SidebarProvider>
            <Sidebar className="border-none bg-[#00468B] text-white shadow-2xl [&>div]:!bg-[#00468B]">
                <SidebarHeader className="relative p-5 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3 text-white">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/16 ring-1 ring-white/25 shadow-lg">
                            <img src="/logo.png" alt="Wargify" className="h-8 w-8 object-contain" />
                        </div>
                        <div>
                            <span className="block text-xl font-black tracking-tight">Wargify</span>
                            <span className="text-xs font-medium text-cyan-50/70">{authUser?.full_name ?? 'Admin sistem'}</span>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent className="relative mt-3 px-2">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-1">
                                {navItems.map((item) => {
                                    const isActive = url === item.path || url.startsWith(item.path + '/');
                                    const Icon = item.icon;
                                    
                                    if (item.subItems) {
                                        return (
                                            <Collapsible
                                                key={item.name}
                                                defaultOpen={isActive}
                                                className="group/collapsible"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton 
                                                            className={`h-11 px-3 rounded-xl text-sm font-semibold transition-all w-full justify-between ${
                                                                isActive 
                                                                    ? '!bg-white/15 !text-white shadow-inner ring-1 ring-white/15' 
                                                                    : 'text-cyan-50/82 hover:!bg-white/10 hover:text-white'
                                                            }`}
                                                            tooltip={item.name}
                                                        >
                                                            <span className="flex items-center gap-3">
                                                                <Icon className="size-4" />
                                                                <span>{item.name}</span>
                                                            </span>
                                                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub className="border-l border-white/14 ml-5 px-2 mt-1 space-y-1">
                                                            {item.subItems.map((subItem) => {
                                                                const isSubActive = url === subItem.path;
                                                                return (
                                                                    <SidebarMenuSubItem key={subItem.name}>
                                                                        <SidebarMenuSubButton 
                                                                            asChild
                                                                            className={`h-9 px-3 rounded-lg text-sm font-semibold transition-all ${
                                                                                isSubActive
                                                                                    ? '!bg-[#E6F6FF] !text-[#00468B] shadow-sm' 
                                                                                    : 'text-cyan-50/75 hover:!bg-white/10 hover:text-white'
                                                                            }`}
                                                                        >
                                                                            <Link href={subItem.path}>
                                                                                <span>{subItem.name}</span>
                                                                            </Link>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                )
                                                            })}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        );
                                    }

                                    return (
                                        <SidebarMenuItem key={item.name}>
                                            <SidebarMenuButton 
                                                isActive={isActive}
                                                className={`h-11 px-3 rounded-xl text-sm font-semibold transition-all ${
                                                    isActive 
                                                        ? '!bg-white !text-[#00468B] hover:!bg-white shadow-lg shadow-blue-950/15' 
                                                        : 'text-cyan-50/82 hover:!bg-white/10 hover:text-white'
                                                }`}
                                                render={
                                                    <Link href={item.path}>
                                                        <span className="flex items-center gap-3">
                                                            <Icon className="size-4" />
                                                            <span>{item.name}</span>
                                                        </span>
                                                    </Link>
                                                }
                                            />
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="relative p-4 border-t border-white/10">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                onClick={handleLogout}
                                className="h-11 px-3 text-cyan-50/86 hover:!bg-red-500/30 hover:text-white transition-colors rounded-xl cursor-pointer  "
                                render={
                                    <button className="flex items-center space-x-2">
                                        <LogOut size={20} />
                                        <span className="font-medium">Keluar</span>
                                    </button>
                                }
                            />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset className="relative flex-1 overflow-auto w-full bg-transparent">
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#d4e4ef] bg-white px-4 md:h-20 md:px-8">
                  <div className="flex items-center gap-3">
                    <SidebarTrigger className="-ml-1 text-[#00468B]" />
                    <div>
                        <span className="block text-sm font-black text-[#13243a] md:text-lg">{currentItem.name}</span>
                        <span className="hidden text-xs font-medium text-slate-500 md:block">Pantau layanan warga, operasional, dan tindak lanjut harian.</span>
                    </div>
                  </div>
                  <div className="hidden items-center gap-3 md:flex">
                    <div className="relative">
                        <div className="flex h-10 w-80 items-center gap-2 rounded-full border border-[#d4e4ef] bg-[#E6F6FF] px-4 text-sm text-slate-500 shadow-sm focus-within:border-[#00468B] focus-within:bg-white">
                            <Search className="size-4 shrink-0" />
                            <input
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.target.value);
                                    setIsSearchOpen(true);
                                }}
                                onFocus={() => setIsSearchOpen(true)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && filteredSearchItems[0]) {
                                        goToSearchItem(filteredSearchItems[0]);
                                    }
                                    if (event.key === 'Escape') {
                                        setIsSearchOpen(false);
                                    }
                                }}
                                placeholder="Cari modul, warga, atau laporan"
                                className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-500"
                            />
                        </div>

                        {isSearchOpen && (
                            <div
                                className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-2xl border border-[#d4e4ef] bg-white shadow-2xl shadow-slate-900/12"
                                onMouseDown={(event) => event.preventDefault()}
                            >
                                <div className="border-b border-slate-100 px-4 py-3">
                                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">Hasil pencarian</p>
                                </div>
                                <div className="max-h-80 overflow-y-auto p-2">
                                    {filteredSearchItems.length === 0 ? (
                                        <div className="px-3 py-6 text-center text-sm font-medium text-slate-500">
                                            Modul tidak ditemukan.
                                        </div>
                                    ) : (
                                        filteredSearchItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.path}
                                                    type="button"
                                                    onClick={() => goToSearchItem(item)}
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#E6F6FF]"
                                                >
                                                    <span className="grid size-9 place-items-center rounded-xl bg-[#E6F6FF] text-[#00468B]">
                                                        <Icon className="size-4" />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block text-sm font-black text-slate-900">{item.name}</span>
                                                        <span className="block truncate text-xs font-medium text-slate-500">{item.path}</span>
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsNotificationOpen((value) => !value)}
                            className="relative grid size-10 place-items-center rounded-full border border-[#d4e4ef] bg-white text-slate-600 shadow-sm transition hover:text-[#00468B]"
                            aria-label="Buka notifikasi"
                        >
                            <Bell className="size-4" />
                            <span className="absolute right-2 top-2 size-2 rounded-full bg-[#AD1114]" />
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-2xl border border-[#d4e4ef] bg-white shadow-2xl shadow-slate-900/12">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Notifikasi</p>
                                        <p className="text-xs font-medium text-slate-500">Dummy preview untuk dashboard</p>
                                    </div>
                                    <span className="rounded-full bg-[#E6F6FF] px-2 py-1 text-xs font-black text-[#00468B]">{notifications.length}</span>
                                </div>
                                <div className="space-y-1 p-2">
                                    {notifications.map((notification) => {
                                        const Icon = notification.icon;
                                        return (
                                            <div key={notification.id} className="flex gap-3 rounded-xl p-3 transition hover:bg-slate-50">
                                                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${notification.tone}`}>
                                                    <Icon className="size-4" />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-900">{notification.title}</p>
                                                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{notification.description}</p>
                                                    <p className="mt-2 text-xs font-bold text-slate-400">{notification.time}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex h-10 items-center gap-2 rounded-full border border-[#d4e4ef] bg-white pl-2 pr-4 shadow-sm">
                        <div className="grid size-7 place-items-center rounded-full bg-[#00468B] text-white">
                            <CircleUser className="size-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{authUser?.full_name ?? 'Admin sistem'}</span>
                    </div>
                  </div>
                </header>

                <main className="relative flex-1 w-full min-h-[calc(100vh-5rem)]">
                    <div className="mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
