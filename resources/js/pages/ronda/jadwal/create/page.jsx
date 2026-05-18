import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, RefreshCw, Plus, QrCode, Trash2 } from 'lucide-react';

export default function TambahJadwalRondaPage() {
    const [koordinatorId, setKoordinatorId] = useState("member_1");

    const members = [
        { id: "member_1", nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png" },
        { id: "member_2", nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png" },
        { id: "member_3", nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png" },
        { id: "member_4", nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png" },
    ];

    const [checkpoints, setCheckpoints] = useState([
        { id: 1, nama: "Pos Ronda", status: "Belum di-scan" },
        { id: 2, nama: "Pos Ronda", status: "Belum di-scan" },
        { id: 3, nama: "Pos Ronda", status: "Belum di-scan" },
        { id: 4, nama: "Pos Ronda", status: "Belum di-scan" },
        { id: 5, nama: "Pos Ronda", status: "Belum di-scan" },
        { id: 6, nama: "Pos Ronda", status: "Belum di-scan" },
    ]);

    const handleDeleteCheckpoint = (id) => {
        setCheckpoints(checkpoints.filter(cp => cp.id !== id));
    };

    return (
        <DashboardLayout>
            <Head title="Tambah Jadwal Ronda - Wargify" />
            
            <div className="p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/ronda/jadwal" className="hover:bg-gray-100 p-2 rounded-full transition-colors shrink-0">
                        <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tambah Jadwal Ronda</h1>
                </div>
                <p className="text-gray-600 ml-12 mb-10 text-lg">Rencanakan keamanan desa</p>

                {/* Form fields */}
                <div className="ml-12 space-y-6 max-w-2xl mb-12">
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="tanggal" className="text-sm font-medium text-gray-900">Tanggal</Label>
                        <Input id="tanggal" type="date" placeholder="Pick a date" className="border-gray-300 focus-visible:ring-[#00468B]" />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label className="text-sm font-medium text-gray-900">Jam</Label>
                        <div className="flex items-center gap-3">
                            <Input type="time" defaultValue="01:00" className="border-gray-300 w-32 focus-visible:ring-[#00468B]" />
                            <span className="text-sm text-gray-500 font-medium">Sampai</span>
                            <Input type="time" defaultValue="03:00" className="border-gray-300 w-32 focus-visible:ring-[#00468B]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-900">Status</Label>
                        <Select defaultValue="berlangsung">
                            <SelectTrigger className="border-gray-300 w-64 focus:ring-[#00468B]">
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="berlangsung">Berlangsung</SelectItem>
                                <SelectItem value="mendatang">Mendatang</SelectItem>
                                <SelectItem value="selesai">Selesai</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Daftar Anggota */}
                <div className="ml-12 mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Daftar Anggota</h2>
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white flex items-center shadow-sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Ganti Kelompok
                        </Button>
                    </div>

                    <div className="rounded-xl border border-gray-150 overflow-hidden bg-white shadow-sm">
                        <RadioGroup value={koordinatorId} onValueChange={setKoordinatorId}>
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-muted-foreground w-20 text-center">Foto</TableHead>
                                        <TableHead className="font-semibold text-muted-foreground">Nama ↑↓</TableHead>
                                        <TableHead className="font-semibold text-muted-foreground">Telepon</TableHead>
                                        <TableHead className="font-semibold text-muted-foreground w-32 text-center">Koordinator</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow key={member.id} className="hover:bg-gray-50/50">
                                            <TableCell className="flex justify-center py-3">
                                                <Avatar className="w-10 h-10 border border-gray-100 shadow-sm">
                                                    <AvatarImage src={member.avatar} alt={member.nama} />
                                                    <AvatarFallback>{member.nama.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900">{member.nama}</TableCell>
                                            <TableCell className="text-gray-600 font-medium">{member.telepon}</TableCell>
                                            <TableCell className="text-center py-3">
                                                <div className="flex justify-center items-center h-full">
                                                    <RadioGroupItem 
                                                        value={member.id} 
                                                        id={member.id}
                                                        className="text-[#00468B] border-gray-300 focus:ring-[#00468B] w-5 h-5"
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </RadioGroup>
                    </div>
                </div>

                {/* Daftar Checkpoint */}
                <div className="ml-12 mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Daftar Checkpoint</h2>
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white flex items-center shadow-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah
                        </Button>
                    </div>

                    <div className="rounded-xl border border-gray-150 overflow-hidden bg-white shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-muted-foreground">Nama Lokasi ↑↓</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground w-56 text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {checkpoints.map((cp) => (
                                    <TableRow key={cp.id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-semibold text-gray-900 py-4">{cp.nama}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                {cp.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                                    <QrCode className="w-4 h-4 mr-2" />
                                                    Lihat QR
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    className="bg-[#00468B] hover:bg-[#003366] text-white"
                                                    onClick={() => handleDeleteCheckpoint(cp.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {checkpoints.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-gray-400">
                                            Belum ada lokasi checkpoint yang ditambahkan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end ml-12 pt-4">
                    <Button className="bg-[#00468B] hover:bg-[#003366] text-white px-6 py-2 shadow-md">
                        Simpan Perubahan
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
