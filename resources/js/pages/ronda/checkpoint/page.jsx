import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { QrCode, SquarePen, Plus, MapPin } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

export default function CheckpointRondaPage() {
    const [checkpoints, setCheckpoints] = useState([
        {
            id: 1,
            nama: 'Pos Ronda',
            koordinat: '09830", 92309"',
            deskripsi: 'Pos Utama',
            isMainPos: true
        },
        {
            id: 2,
            nama: 'Perempatan 1',
            koordinat: '123133", 1231232"',
            deskripsi: '',
            isMainPos: false
        },
        {
            id: 3,
            nama: 'Perempatan 1',
            koordinat: '123133", 1231232"',
            deskripsi: '',
            isMainPos: false
        },
        {
            id: 4,
            nama: 'Perempatan 1',
            koordinat: '123133", 1231232"',
            deskripsi: '',
            isMainPos: false
        },
        {
            id: 5,
            nama: 'Perempatan 1',
            koordinat: '123133", 1231232"',
            deskripsi: '',
            isMainPos: false
        },
    ]);

    const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenEdit = (cp) => {
        setSelectedCheckpoint(cp);
        setIsDialogOpen(true);
    };

    const handleOpenAdd = () => {
        setSelectedCheckpoint({
            id: null,
            nama: '',
            koordinat: '',
            isMainPos: false
        });
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        setIsDialogOpen(false);
    };

    return (
        <DashboardLayout>
            <Head title="Checkpoint Ronda - Wargify" />
            
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 max-w-5xl gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Checkpoint Ronda</h1>
                        <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                            Kelola titik scan ronda dan tandai pos utama untuk koordinasi petugas.
                        </p>
                    </div>
                    <Button 
                        onClick={handleOpenAdd}
                        className="bg-[#00468B] hover:bg-[#003366] text-white flex items-center shadow-md"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Checkpoint
                    </Button>
                </div>
                
                {/* Checkpoint list */}
                <div className="grid max-w-5xl gap-4 lg:grid-cols-2">
                    {checkpoints.map((item) => (
                        <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white border border-gray-100">
                            <CardContent className="p-5 flex flex-col gap-5">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                        {item.nama}
                                        {item.isMainPos && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                                Pos Utama
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-600 font-medium">{item.koordinat}</p>
                                    {item.deskripsi && (
                                        <p className="text-xs text-gray-400 mt-2">{item.deskripsi}</p>
                                    )}
                                </div>
                                
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button className="flex-1 bg-[#00468B] hover:bg-[#003366] text-white">
                                        <QrCode className="w-4 h-4 mr-2" />
                                        Lihat Kode QR
                                    </Button>
                                    <Button 
                                        onClick={() => handleOpenEdit(item)}
                                        className="flex-1 bg-[#00468B] hover:bg-[#003366] text-white"
                                    >
                                        <SquarePen className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Unified Add/Edit Checkpoint Dialog */}
                {selectedCheckpoint && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="sm:max-w-md p-6 bg-white border-none shadow-2xl rounded-2xl">
                            <DialogHeader className="mb-6">
                                <DialogTitle className="text-xl font-bold text-gray-900">
                                    {selectedCheckpoint.id ? 'Checkpoint Ronda' : 'Tambah Checkpoint'}
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 text-sm">
                                    {selectedCheckpoint.id ? 'Ubah informasi lokasi checkpoint ronda.' : 'Tambahkan titik lokasi checkpoint baru.'}
                                </DialogDescription>
                            </DialogHeader>

                            {/* Form fields */}
                            <div className="space-y-5">
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <Label htmlFor="nama" className="text-sm font-semibold text-gray-700">Nama Checkpoint</Label>
                                    <Input 
                                        id="nama" 
                                        value={selectedCheckpoint.nama} 
                                        onChange={(e) => setSelectedCheckpoint({...selectedCheckpoint, nama: e.target.value})}
                                        placeholder="Contoh: Pos Ronda Utama" 
                                        className="border-gray-300 focus-visible:ring-[#00468B]" 
                                    />
                                </div>

                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <Label htmlFor="koordinat" className="text-sm font-semibold text-gray-700">Koordinat</Label>
                                    <div className="flex gap-2 w-full">
                                        <Input 
                                            id="koordinat" 
                                            value={selectedCheckpoint.koordinat} 
                                            onChange={(e) => setSelectedCheckpoint({...selectedCheckpoint, koordinat: e.target.value})}
                                            placeholder='09830", 92309"' 
                                            className="border-gray-300 flex-1 focus-visible:ring-[#00468B]" 
                                        />
                                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white flex items-center shrink-0">
                                            <MapPin className="w-4 h-4 mr-1.5" />
                                            Cari di peta
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <Label className="text-sm font-semibold text-gray-700">Kode QR</Label>
                                    <Button className="bg-[#00468B] hover:bg-[#003366] text-white flex items-center w-fit shadow-sm">
                                        <QrCode className="w-4 h-4 mr-2" />
                                        Lihat Kode QR
                                    </Button>
                                </div>

                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <Label className="text-sm font-semibold text-gray-700">Pos Utama</Label>
                                    <div className="flex items-center">
                                        <Switch 
                                            checked={selectedCheckpoint.isMainPos} 
                                            onCheckedChange={(checked) => setSelectedCheckpoint({...selectedCheckpoint, isMainPos: checked})}
                                            className="data-[state=checked]:bg-[#00468B]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <DialogClose asChild>
                                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                                        Batal
                                    </Button>
                                </DialogClose>
                                <Button 
                                    onClick={handleSave}
                                    className="bg-[#00468B] hover:bg-[#003366] text-white px-6"
                                >
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </DashboardLayout>
    );
}
