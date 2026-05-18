import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { CalendarDays, Image as ImageIcon, MapPin } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function GalleryPage() {
    const dummyData = Array(4).fill({
        judul: 'Kerja Bakti Minggu Pagi',
        tanggal: '30/04/2026',
        tempat: 'Taman Desa Suka Maju Munder',
    });

    return (
        <DashboardLayout>
            <Head title="Kelola Dokumentasi Kegiatan - Wargify" />
            
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Dokumentasi Kegiatan Desa</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                        Susun dokumentasi kegiatan agar arsip warga mudah dilihat dan dikelola.
                    </p>
                </div>
                
                <div className="grid max-w-6xl gap-4 md:grid-cols-2">
                    {dummyData.map((item, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardContent className="grid gap-5 p-5">
                                <div className="flex items-start gap-4">
                                    <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#E6F6FF] text-[#00468B]">
                                        <ImageIcon className="size-7" />
                                    </div>
                                    <div className="min-w-0 space-y-2">
                                        <h3 className="text-lg font-black text-gray-900">{item.judul}</h3>
                                        <div className="flex flex-wrap gap-3 text-sm font-medium text-gray-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarDays className="size-4" />
                                                {item.tanggal}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <MapPin className="size-4" />
                                                {item.tempat}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <Link href="/gallery/detail">
                                    <Button className="w-full bg-[#00468B] hover:bg-[#003366] text-white flex items-center">
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        Kelola Dokumentasi
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
