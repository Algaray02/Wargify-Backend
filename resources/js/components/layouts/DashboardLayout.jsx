import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CircleUser, LogOut, ChevronRight } from 'lucide-react';
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
        { name: 'Dashboard', path: '/' },
        { 
            name: 'Warga', 
            path: '/warga', // Base path for active matching
            subItems: [
                { name: 'Per Kepala', path: '/warga/per-kepala' },
                { name: 'Per Warga', path: '/warga/per-warga' },
            ]
        },
        { name: 'Gallery', path: '/gallery' },
        { name: 'Kegiatan', path: '/kegiatan' },
        { 
            name: 'Keuangan', 
            path: '/keuangan',
            subItems: [
                { name: 'Catatan', path: '/keuangan/catatan' },
                { name: 'Iuran', path: '/keuangan/iuran' },
            ]
        },
        { name: 'Fasilitas', path: '/fasilitas' },
        { name: 'Pengumuman', path: '/pengumuman' },
        { 
            name: 'Ronda', 
            path: '/ronda',
            subItems: [
                { name: 'Jadwal Ronda', path: '/ronda/jadwal' },
                { name: 'Kelompok Ronda', path: '/ronda/kelompok' },
                { name: 'Riwayat Ronda', path: '/ronda/riwayat' },
                { name: 'Checkpoint', path: '/ronda/checkpoint' },
            ]
        },
        { name: 'SoS Log', path: '/sos-log' },
    ];

    return (
        <SidebarProvider>
            {/* Override background to match the Wargify design */}
            <Sidebar className="!bg-[#00468B] border-none text-white [&>div]:!bg-[#00468B]">
                <SidebarHeader className="p-6 pb-2 border-b border-white/10">
                    <div className="flex items-center space-x-3 text-white">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <CircleUser size={24} />
                        </div>
                        <span className="font-bold text-lg">Superadmin</span>
                    </div>
                </SidebarHeader>

                <SidebarContent className="mt-4">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-1">
                                {navItems.map((item) => {
                                    const isActive = url === item.path || url.startsWith(item.path + '/');
                                    
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
                                                            className={`px-4 py-6 rounded-lg text-lg font-medium transition-colors w-full justify-between ${
                                                                isActive 
                                                                    ? '!bg-transparent !text-white' 
                                                                    : 'text-white hover:!bg-white/10 hover:text-white'
                                                            }`}
                                                            tooltip={item.name}
                                                        >
                                                            <span>{item.name}</span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub className="border-none px-2 mt-1 space-y-1">
                                                            {item.subItems.map((subItem) => {
                                                                const isSubActive = url === subItem.path;
                                                                return (
                                                                    <SidebarMenuSubItem key={subItem.name}>
                                                                        <SidebarMenuSubButton 
                                                                            asChild
                                                                            className={`px-4 py-5 rounded-lg text-md font-medium transition-colors ${
                                                                                isSubActive
                                                                                    ? '!bg-[#D6EBF8] !text-[#00468B]' // Active sub-menu style from design
                                                                                    : 'text-white hover:!bg-white/10 hover:text-white'
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
                                                className={`px-4 py-6 rounded-lg text-lg font-medium transition-colors ${
                                                    isActive 
                                                        ? '!bg-white !text-[#00468B] hover:!bg-gray-100' 
                                                        : 'text-white hover:!bg-white/10 hover:text-white'
                                                }`}
                                                render={
                                                    <Link href={item.path}>
                                                        <span>{item.name}</span>
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

                <SidebarFooter className="p-4 border-t border-white/10">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                onClick={handleLogout}
                                className="px-4 py-6 text-white hover:!bg-white/10 hover:text-white transition-colors"
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

            <SidebarInset className="bg-white flex-1 overflow-auto w-full">
                {/* Header for mobile trigger */}
                <header className="flex h-16 shrink-0 items-center gap-2 px-4 md:hidden border-b bg-white">
                  <SidebarTrigger className="-ml-1 text-[#00468B]" />
                  <span className="font-semibold text-[#00468B]">Wargify</span>
                </header>

                <main className="flex-1 w-full min-h-full">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
