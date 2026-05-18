import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { AlertCircle, Image as ImageIcon, SquarePen } from 'lucide-react';
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Laporan Fasilitas</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                        Pantau laporan fasilitas warga dan tindak lanjut pengerjaannya.
                    </p>
                </div>
                
                <div className="grid max-w-6xl gap-4 lg:grid-cols-2">
                    {dummyData.map((item, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#E6F6FF] text-[#00468B]">
                                        <ImageIcon className="size-8" />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <h3 className="font-black text-gray-900 text-lg">{item.judul}</h3>
                                        <p className="text-sm font-medium leading-6 text-gray-600">{item.deskripsi}</p>
                                        <Badge variant="secondary" className="mt-2 bg-[#E6F6FF] text-[#00468B]">
                                            <AlertCircle className="mr-1 size-3" />
                                            {item.status}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <Link href="/fasilitas/detail">
                                    <Button className="w-full bg-[#00468B] hover:bg-[#003366] text-white sm:w-auto">
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
