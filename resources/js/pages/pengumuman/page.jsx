import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Image as ImageIcon } from 'lucide-react';
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
                <div className="flex items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Daftar Pengumuman</h1>
                    <Link href="/pengumuman/create">
                        <Button size="icon" className="bg-[#00468B] hover:bg-[#003366] text-white w-8 h-8 rounded">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
                
                <div className="max-w-4xl space-y-4">
                    {dummyData.map((item, index) => (
                        <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center gap-6">
                                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400 shrink-0">
                                    <ImageIcon size={40} />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{item.judul}</h3>
                                    <p className="text-gray-700">{item.deskripsi}</p>
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
