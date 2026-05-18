import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, QrCode, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditKegiatanPage() {
    return (
        <DashboardLayout>
            <Head title="Kelola Kegiatan - Wargify" />
            
            <div className="p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/kegiatan" className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Kegiatan</h1>
                </div>
                <p className="text-gray-600 ml-12 mb-10 text-lg">Rapat anggatan desa</p>

                {/* Form Section */}
                <div className="ml-12 space-y-6 max-w-3xl">
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="nama" className="text-sm font-medium text-gray-900">Nama Kegiatan</Label>
                        <Input id="nama" defaultValue="@peduarte" className="border-gray-300 focus-visible:ring-[#00468B]" />
                    </div>
                    
                    <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                        <Label htmlFor="deskripsi" className="text-sm font-medium text-gray-900 pt-3">Deskripsi</Label>
                        <Textarea id="deskripsi" defaultValue="@peduarte" className="min-h-[150px] border-gray-300 focus-visible:ring-[#00468B] resize-none" />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="lokasi" className="text-sm font-medium text-gray-900">Lokasi</Label>
                        <Input id="lokasi" defaultValue="@peduarte" className="border-gray-300 focus-visible:ring-[#00468B]" />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="tipe" className="text-sm font-medium text-gray-900">Tipe</Label>
                        <Select defaultValue="rapat">
                            <SelectTrigger className="border-gray-300 focus:ring-[#00468B]">
                                <SelectValue placeholder="Pilih Tipe Kegiatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rapat">Rapat</SelectItem>
                                <SelectItem value="sosialisasi">Sosialisasi</SelectItem>
                                <SelectItem value="gotong-royong">Gotong Royong</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="peserta" className="text-sm font-medium text-gray-900">Peserta</Label>
                        <Select defaultValue="seluruh-warga">
                            <SelectTrigger className="border-gray-300 focus:ring-[#00468B]">
                                <SelectValue placeholder="Pilih Peserta Kegiatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="seluruh-warga">Seluruh Warga</SelectItem>
                                <SelectItem value="bapak-bapak">Bapak-bapak</SelectItem>
                                <SelectItem value="ibu-ibu">Ibu-ibu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="tanggal" className="text-sm font-medium text-gray-900">Tanggal</Label>
                        <Input id="tanggal" type="date" defaultValue="2026-05-13" className="border-gray-300 focus-visible:ring-[#00468B]" />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-900">Status</Label>
                        <div className="flex gap-4">
                            <Input id="status" defaultValue="Draft" disabled className="bg-gray-50 border-gray-300 w-48" />
                            <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Selesaikan
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label className="text-sm font-medium text-gray-900">QR Absensi</Label>
                        <div>
                            <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                                <QrCode className="w-4 h-4 mr-2" />
                                Buat QR
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-8">
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                            Save changes
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
