import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Megaphone, Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PengumumanPage() {
    const dummyData = Array(5).fill({
        judul: 'Pengumuman Pemasangan Bendera',
        deskripsi: '17 Agustus sudah dekat, mari kita pasang bendera di de...',
        tag: 'Penting',
    });

    return (
        <DashboardLayout>
            <Head title="Daftar Pengumuman - Wargify" />
            
            <div className="p-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Daftar Pengumuman</h1>
                        <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                            Kelola pengumuman agar informasi penting tersampaikan rapi ke warga.
                        </p>
                    </div>
                    <Link href="/pengumuman/create">
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                            <Plus className="w-5 h-5" />
                            Tambah
                        </Button>
                    </Link>
                </div>
                
                <div className="grid max-w-6xl gap-4 lg:grid-cols-2">
                    {dummyData.map((item, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#E6F6FF] text-[#00468B]">
                                    <Megaphone className="size-8" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h3 className="font-black text-gray-900 text-lg">{item.judul}</h3>
                                    <p className="text-sm font-medium leading-6 text-gray-600">{item.deskripsi}</p>
                                    <div className="mt-2">
                                        <Badge variant={item.tag === 'Penting' ? 'destructive' : 'secondary'}>
                                            {item.tag}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
