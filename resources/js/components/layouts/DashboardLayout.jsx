import React from 'react';
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

export default function DashboardLayout({ children }) {
    const { url } = usePage();

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        router.visit('/login');
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

    const currentItem = navItems.find((item) => url === item.path || url.startsWith(item.path + '/')) ?? navItems[0];

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
                            <span className="text-xs font-medium text-cyan-50/70">Command center RT/RW</span>
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
                    <div className="mb-3 rounded-2xl border border-white/12 bg-white/10 p-3 shadow-inner">
                        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-50/70">
                            <RadioTower className="size-4 text-[#E6F6FF]" />
                            Status layanan
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm font-bold">
                            <span>Online</span>
                            <span className="rounded-full bg-[#ACF4A4] px-2 py-0.5 text-xs text-[#2A6B2C] ring-1 ring-white/25">Stabil</span>
                        </div>
                    </div>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                onClick={handleLogout}
                                className="h-11 px-3 text-cyan-50/86 hover:!bg-white/10 hover:text-white transition-colors rounded-xl"
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
                    <div className="flex h-10 w-72 items-center gap-2 rounded-full border border-[#d4e4ef] bg-[#E6F6FF] px-4 text-sm text-slate-500 shadow-sm">
                        <Search className="size-4" />
                        <span>Cari modul, warga, atau laporan</span>
                    </div>
                    <button className="grid size-10 place-items-center rounded-full border border-[#d4e4ef] bg-white text-slate-600 shadow-sm transition hover:text-[#00468B]">
                        <Bell className="size-4" />
                    </button>
                    <div className="flex h-10 items-center gap-2 rounded-full border border-[#d4e4ef] bg-white pl-2 pr-4 shadow-sm">
                        <div className="grid size-7 place-items-center rounded-full bg-[#00468B] text-white">
                            <CircleUser className="size-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Superadmin</span>
                    </div>
                  </div>
                </header>

                <main className="relative flex-1 w-full min-h-[calc(100vh-5rem)]">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
