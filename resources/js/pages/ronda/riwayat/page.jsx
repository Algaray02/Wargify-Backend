import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRondaSchedules } from '@/hooks/useRonda';

export default function RiwayatRondaPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('semua_status');
    const { data: schedules = [], isLoading, isError } = useRondaSchedules();

    const formatDate = (value) => value
        ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
        : '-';

    const formatTime = (value) => value
        ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
        : '-';

    const statusLabels = {
        COMPLETED: 'Selesai',
        MISSED: 'Terlewat',
        ONGOING: 'Berlangsung',
        SCHEDULED: 'Mendatang',
    };

    const riwayatData = useMemo(() => {
        return schedules
            .map((schedule) => {
                const memberCount = schedule.group?.members?.length ?? 0;
                const completed = schedule.status === 'COMPLETED';

                return {
                    id: schedule.schedule_id,
                    tanggal: formatDate(schedule.schedule_date),
                    kehadiran: completed ? `${memberCount}/${memberCount}` : `0/${memberCount}`,
                    checkpoint: schedule.checkpoints?.length ? `${schedule.checkpoints.length}/${schedule.checkpoints.length}` : '-',
                    kelompok: schedule.group?.name ?? '-',
                    waktu: `${formatTime(schedule.shift_start)}-${formatTime(schedule.shift_end)}`,
                    status: statusLabels[schedule.status] ?? schedule.status,
                };
            })
            .filter((riwayat) => {
                const keyword = search.toLowerCase();
                const matchesSearch = [riwayat.tanggal, riwayat.kelompok, riwayat.status]
                    .some((value) => String(value).toLowerCase().includes(keyword));
                const matchesStatus = statusFilter === 'semua_status'
                    || riwayat.status.toLowerCase() === statusFilter;

                return matchesSearch && matchesStatus;
            });
    }, [schedules, search, statusFilter]);

    return (
        <DashboardLayout>
            <Head title="Riwayat Ronda - Wargify" />
            
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Riwayat Pelaksanaan Ronda</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                        Evaluasi pelaksanaan ronda, kehadiran, checkpoint, dan durasi patroli.
                    </p>
                </div>
                
                <div className="mb-6 flex items-center gap-4 max-w-2xl">
                    <Input 
                        placeholder="Cari pelaksanaan..." 
                        className="bg-white flex-1"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px] bg-white">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua_status">Semua Status</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                            <SelectItem value="terlewat">Terlewat</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground">Tanggal</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Kehadiran</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Checkpoint</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Kelompok</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Waktu</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-slate-500">Memuat riwayat ronda...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-red-600">Gagal memuat riwayat ronda.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && riwayatData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-slate-500">Tidak ada riwayat ronda.</TableCell>
                                </TableRow>
                            )}
                            {riwayatData.map((riwayat) => (
                                <TableRow key={riwayat.id}>
                                    <TableCell className="font-medium">{riwayat.tanggal}</TableCell>
                                    <TableCell>{riwayat.kehadiran}</TableCell>
                                    <TableCell>{riwayat.checkpoint}</TableCell>
                                    <TableCell>{riwayat.kelompok}</TableCell>
                                    <TableCell>{riwayat.waktu}</TableCell>
                                    <TableCell>
                                        <Badge variant={riwayat.status === 'Selesai' ? 'default' : 'secondary'} className={riwayat.status === 'Selesai' ? 'bg-[#00468B]' : 'bg-red-100 text-red-700 hover:bg-red-200'}>
                                            {riwayat.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Link href="/ronda/riwayat/detail">
                                            <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Lihat
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {riwayatData.length} dari {schedules.length} baris
                    </div>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" className="pointer-events-none opacity-50" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive className="bg-[#00468B] text-white hover:bg-[#003366] hover:text-white">1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">2</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </DashboardLayout>
    );
}
