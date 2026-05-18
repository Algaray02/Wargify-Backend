import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function MonitoringRondaPage() {
    const [seconds, setSeconds] = useState(2400); // 40 minutes

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const members = [
        { id: 1, nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png", hadir: true },
        { id: 2, nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png", hadir: true },
        { id: 3, nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png", hadir: true },
        { id: 4, nama: "Tatang Sutarma", telepon: "08123456789", avatar: "https://github.com/shadcn.png", hadir: true },
    ];

    const checkpoints = [
        { id: 1, nama: "Tatang Sutarma", scan: true },
        { id: 2, nama: "Tatang Sutarma", scan: true },
        { id: 3, nama: "Tatang Sutarma", scan: true },
        { id: 4, nama: "Tatang Sutarma", scan: true },
    ];

    return (
        <DashboardLayout>
            <Head title="Monitoring Ronda - Wargify" />
            
            <div className="p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/ronda/jadwal" className="hover:bg-gray-100 p-2 rounded-full transition-colors shrink-0">
                        <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight md:text-3xl">
                        Monitoring Ronda
                    </h1>
                </div>

                <div className="ml-12 mb-8">
                    <h2 className="text-xl font-bold text-gray-900">
                        Waktu Berjalan: <span className="font-mono text-[#00468B]">{formatTime(seconds)}</span>
                    </h2>
                </div>

                {/* GPS Tracking Map */}
                <div className="ml-12 mb-10 max-w-2xl overflow-hidden rounded-2xl shadow-md border border-gray-150 bg-white">
                    <img 
                        src="/ronda_gps_map.png" 
                        alt="GPS Tracking Map" 
                        className="w-full h-auto object-cover" 
                    />
                </div>

                {/* Anggota Ronda Checklist */}
                <div className="ml-12 mb-10 max-w-2xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Anggota Ronda</h3>
                    <div className="rounded-xl border border-gray-150 overflow-hidden bg-white shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-muted-foreground w-20 text-center">Foto</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Nama ↑↓</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground">Telepon</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground w-24 text-center">Kehadiran</TableHead>
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
                                                <Checkbox 
                                                    checked={member.hadir} 
                                                    className="w-5 h-5 border-gray-300 data-[state=checked]:bg-[#00468B] data-[state=checked]:border-[#00468B]"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Checkpoint Ronda Checklist */}
                <div className="ml-12 mb-4 max-w-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Checkpoint Ronda</h3>
                    <div className="rounded-xl border border-gray-150 overflow-hidden bg-white shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-muted-foreground">Nama ↑↓</TableHead>
                                    <TableHead className="font-semibold text-muted-foreground w-24 text-center">Ter-scan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {checkpoints.map((cp) => (
                                    <TableRow key={cp.id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-semibold text-gray-900 py-3.5">{cp.nama}</TableCell>
                                        <TableCell className="text-center py-3.5">
                                            <div className="flex justify-center items-center h-full">
                                                <Checkbox 
                                                    checked={cp.scan} 
                                                    className="w-5 h-5 border-gray-300 data-[state=checked]:bg-[#00468B] data-[state=checked]:border-[#00468B]"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
