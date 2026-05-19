import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function DetailPelaksanaanRondaPage() {
    const details = [
        { label: 'Tanggal Dilaksanakan', value: '29/04/2026' },
        { label: 'Koordinator', value: 'Tatang Sutarma' },
        { label: 'Jumlah Anggota', value: '5 Orang', hasAction: true },
        { label: 'Jarak Ditempuh', value: '3KM' },
        { label: 'Checkpoint di-scan', value: '6/6' },
        { label: 'Waktu', value: '22:00-03:00' },
        { label: 'Status', value: 'Selesai' },
        { label: 'Durasi Pelaksanaan', value: 'Selesai' },
    ];

    const members = [
        { id: 1, nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png" },
        { id: 2, nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png" },
        { id: 3, nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png" },
        { id: 4, nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png" },
    ];

    return (
        <DashboardLayout>
            <Head title="Detail Pelaksanaan Ronda - Wargify" />
            
            <div className="p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/ronda/riwayat" className="hover:bg-gray-100 p-2 rounded-full transition-colors shrink-0">
                        <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight md:text-3xl">
                        Detail Pelaksanaan Ronda
                    </h1>
                </div>

                {/* Details Table */}
                <div className="mb-10 max-w-3xl overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-2 shadow-sm ring-1 ring-white/70">
                    <table className="w-full border-separate border-spacing-y-2">
                        <tbody>
                            {details.map((detail, index) => (
                                <tr key={index} className="group transition-all duration-200">
                                    <td className="w-[220px] rounded-l-xl bg-[#00468B] px-6 py-4 text-sm font-black text-white shadow-sm">
                                        {detail.label}
                                    </td>
                                    <td className="flex items-center justify-between rounded-r-xl bg-[#F8FCFF] px-6 py-4 text-sm font-semibold text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.06),0_-1px_0_rgba(15,23,42,0.03)] transition-colors group-hover:bg-[#E6F6FF]">
                                        <span>{detail.value}</span>
                                        {detail.hasAction && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white flex items-center text-xs">
                                                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                        Lihat
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md p-6 bg-white border-none shadow-2xl rounded-2xl">
                                                    <DialogHeader className="mb-4">
                                                        <DialogTitle className="text-xl font-bold text-gray-900">Daftar Anggota Ronda</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="rounded-xl border border-gray-150 overflow-hidden bg-white">
                                                        <Table>
                                                            <TableHeader className="bg-muted/50">
                                                                <TableRow>
                                                                    <TableHead className="font-semibold text-muted-foreground w-16 text-center">Foto</TableHead>
                                                                    <TableHead className="font-semibold text-muted-foreground">Nama ↑↓</TableHead>
                                                                    <TableHead className="font-semibold text-muted-foreground">Telepon</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {members.map((member) => (
                                                                    <TableRow key={member.id} className="hover:bg-gray-50/50">
                                                                        <TableCell className="flex justify-center py-3">
                                                                            <Avatar className="w-9 h-9 border border-gray-100 shadow-sm">
                                                                                <AvatarImage src={member.avatar} alt={member.nama} />
                                                                                <AvatarFallback>{member.nama.charAt(0)}</AvatarFallback>
                                                                            </Avatar>
                                                                        </TableCell>
                                                                        <TableCell className="font-semibold text-gray-900 text-sm">{member.nama}</TableCell>
                                                                        <TableCell className="text-gray-600 font-medium text-sm">{member.telepon}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* GPS Tracking Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">GPS Tracking</h2>
                    <div className="max-w-3xl overflow-hidden rounded-2xl shadow-md border border-gray-150 bg-white">
                        <img 
                            src="/ronda_gps_map.png" 
                            alt="GPS Tracking Map" 
                            className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500" 
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
