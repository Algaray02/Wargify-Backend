import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, QrCode } from 'lucide-react';

export default function EditIuranPage() {
    return (
        <DashboardLayout>
            <Head title="Edit Iuran - Wargify" />
            
            <div className="p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/keuangan/iuran" className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Iuran</h1>
                </div>
                <p className="text-gray-600 ml-12 mb-10 text-lg">Edit iuran "Iuran Bulanan"</p>

                {/* Form Section */}
                <div className="ml-12 space-y-6 max-w-3xl">
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="nama" className="text-sm font-medium text-gray-900">Nama Iuran</Label>
                        <Input id="nama" defaultValue="Iuran Bulanan" className="border-gray-300 focus-visible:ring-[#00468B]" />
                    </div>
                    
                    <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                        <Label htmlFor="deskripsi" className="text-sm font-medium text-gray-900 pt-3">Deskripsi</Label>
                        <Textarea id="deskripsi" defaultValue="Iuran operasional lingkungan bulan berjalan." className="min-h-[150px] border-gray-300 focus-visible:ring-[#00468B] resize-none" />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="tenggat" className="text-sm font-medium text-gray-900">Tenggat pembayaran</Label>
                        <Input id="tenggat" type="date" defaultValue="2026-05-13" className="border-gray-300 focus-visible:ring-[#00468B] w-64" />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="jumlah" className="text-sm font-medium text-gray-900">Jumlah untuk dibayar</Label>
                        <Input id="jumlah" defaultValue="Rp100.000" className="border-gray-300 focus-visible:ring-[#00468B]" />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="diterima" className="text-sm font-medium text-gray-900">Pembayaran diterima</Label>
                        <Input id="diterima" defaultValue="170/200" className="border-gray-300 focus-visible:ring-[#00468B] w-32" />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label className="text-sm font-medium text-gray-900">QR Pembayaran</Label>
                        <div>
                            <Button variant="outline" className="border-[#00468B] text-[#00468B] hover:bg-[#00468B] hover:text-white">
                                <QrCode className="w-4 h-4 mr-2" />
                                Lihat QR
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-8">
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                            Simpan Perubahan
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
