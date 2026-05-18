import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { SquarePen, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FasilitasPage() {
    const dummyData = Array(5).fill({
        judul: 'Jalan Berlubang',
        deskripsi: 'Jalan sangat berlubang dan membuat kendaraan rusak',
        status: 'Belum ditangani',
    });

    return (
        <DashboardLayout>
            <Head title="Laporan Fasilitas - Wargify" />
            
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Laporan Fasilitas</h1>
                
                <div className="max-w-4xl space-y-4">
                    {dummyData.map((item, index) => (
                        <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center justify-between gap-6">
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400 shrink-0">
                                        <ImageIcon size={40} />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg">{item.judul}</h3>
                                        <p className="text-gray-700">{item.deskripsi}</p>
                                        <Badge variant="secondary" className="mt-2">{item.status}</Badge>
                                    </div>
                                </div>
                                
                                <Link href="/fasilitas/detail">
                                    <Button className="bg-[#00468B] hover:bg-[#003366] text-white flex items-center">
                                        <SquarePen className="w-4 h-4 mr-2" />
                                        Kelola
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
