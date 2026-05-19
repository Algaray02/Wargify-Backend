import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SquarePen, MonitorPlay, Plus } from 'lucide-react';
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

export default function JadwalRondaPage() {
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
        SCHEDULED: 'Mendatang',
        ONGOING: 'Berlangsung',
        COMPLETED: 'Selesai',
        MISSED: 'Terlewat',
    };

    const jadwalData = useMemo(() => {
        return schedules
            .map((schedule) => ({
                id: schedule.schedule_id,
                tanggal: formatDate(schedule.schedule_date),
                jumlahAnggota: schedule.group?.members?.length ?? 0,
                totalCheckpoint: schedule.checkpoints?.length ?? '-',
                waktu: `${formatTime(schedule.shift_start)}-${formatTime(schedule.shift_end)}`,
                status: statusLabels[schedule.status] ?? schedule.status,
                statusRaw: schedule.status,
                kelompok: schedule.group?.name ?? '-',
            }))
            .filter((jadwal) => {
                const keyword = search.toLowerCase();
                const matchesSearch = [jadwal.tanggal, jadwal.kelompok, jadwal.status]
                    .some((value) => String(value).toLowerCase().includes(keyword));
                const matchesStatus = statusFilter === 'semua_status'
                    || jadwal.status.toLowerCase() === statusFilter;

                return matchesSearch && matchesStatus;
            });
    }, [schedules, search, statusFilter]);

    return (
        <DashboardLayout>
            <Head title="Jadwal Ronda - Wargify" />
            
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Jadwal Ronda</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                        Atur jadwal ronda, anggota, checkpoint, dan status pelaksanaan.
                    </p>
                </div>
                
                <div className="mb-6 flex justify-between items-center gap-4">
                    <div className="flex flex-1 gap-4 max-w-2xl">
                        <Input 
                            placeholder="Cari jadwal..." 
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
                                <SelectItem value="berlangsung">Berlangsung</SelectItem>
                                <SelectItem value="mendatang">Mendatang</SelectItem>
                                <SelectItem value="selesai">Selesai</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Link href="/ronda/jadwal/create">
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Jadwal
                        </Button>
                    </Link>
                </div>

                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground">Tanggal</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Jumlah Anggota</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Total Checkpoint</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Waktu</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-48">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Memuat jadwal ronda...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-red-600">Gagal memuat jadwal ronda.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && jadwalData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Tidak ada jadwal ronda.</TableCell>
                                </TableRow>
                            )}
                            {jadwalData.map((jadwal) => (
                                <TableRow key={jadwal.id}>
                                    <TableCell className="font-medium">{jadwal.tanggal}</TableCell>
                                    <TableCell>{jadwal.jumlahAnggota}</TableCell>
                                    <TableCell>{jadwal.totalCheckpoint}</TableCell>
                                    <TableCell>{jadwal.waktu}</TableCell>
                                    <TableCell>
                                        <Badge variant={jadwal.status === 'Berlangsung' ? 'default' : 'secondary'} className={jadwal.status === 'Berlangsung' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                            {jadwal.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Link href="/ronda/jadwal/edit">
                                                <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                                    <SquarePen className="w-4 h-4 mr-2" />
                                                    Kelola
                                                </Button>
                                            </Link>
                                            {jadwal.status === 'Berlangsung' && (
                                                <Link href="/ronda/monitoring">
                                                    <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                                        <MonitorPlay className="w-4 h-4 mr-2" />
                                                        Monitor
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {jadwalData.length} dari {schedules.length} baris
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
