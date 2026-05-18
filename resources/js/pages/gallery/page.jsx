import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Kelola Dokumentasi Kegiatan Desa</h1>
                
                <div className="max-w-4xl space-y-4">
                    {dummyData.map((item, index) => (
                        <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900">{item.judul}</h3>
                                    <p className="text-sm text-gray-700">{item.tanggal}</p>
                                    <p className="text-sm text-gray-500">{item.tempat}</p>
                                </div>
                                
                                <Link href="/gallery/detail">
                                    <Button className="bg-[#00468B] hover:bg-[#003366] text-white flex items-center">
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
