import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ReceiptText, Barcode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function CatatanKeuanganPage() {
    const dummyData = [
        ...Array(4).fill({ jumlah: 'Rp100.000', jenis: 'Pemasukan', sumber: 'Iuran Warga', dicatatOleh: 'Kanjeng Mami' }),
        ...Array(4).fill({ jumlah: 'Rp100.000', jenis: 'Pengeluaran', sumber: 'Pengeluaran Darurat', dicatatOleh: 'Kanjeng Mami' }),
    ];

    return (
        <DashboardLayout>
            <Head title="Catatan Keuangan - Wargify" />
            
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Catatan Keuangan</h1>
                    
                    <Select defaultValue="semua_jenis">
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Semua Jenis" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua_jenis">Semua Jenis</SelectItem>
                            <SelectItem value="pemasukan">Pemasukan</SelectItem>
                            <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-muted-foreground">Jumlah</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Jenis</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Sumber</TableHead>
                                <TableHead className="font-semibold text-muted-foreground">Dicatat Oleh</TableHead>
                                <TableHead className="font-semibold text-muted-foreground w-28">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dummyData.map((catatan, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium text-green-700">{catatan.jumlah}</TableCell>
                                    <TableCell>
                                        <Badge variant={catatan.jenis === 'Pemasukan' ? 'outline' : 'secondary'} className={catatan.jenis === 'Pemasukan' ? 'border-green-500 text-green-700 bg-green-50' : ''}>
                                            {catatan.jenis}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{catatan.sumber}</TableCell>
                                    <TableCell>{catatan.dicatatOleh}</TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                                    <ReceiptText className="w-4 h-4 mr-2" />
                                                    Kwitansi
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
                                                <div className="bg-white p-8 max-w-sm mx-auto font-mono text-sm relative overflow-hidden flex flex-col items-center border border-gray-200" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                                                    <div className="absolute inset-0 bg-white/90 z-0"></div>
                                                    
                                                    <div className="relative z-10 w-full">
                                                        <div className="text-center mb-4">
                                                            <h2 className="font-bold text-lg mb-1">Iuran Desa Suka Maju Mundur</h2>
                                                        </div>
                                                        
                                                        <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                                        
                                                        <div className="mb-4">
                                                            <p>29/04/2026, 08:44:30</p>
                                                        </div>
                                                        
                                                        <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                                        
                                                        <div className="space-y-1 mb-4">
                                                            <p>Pembayar: Tatang Sutarma</p>
                                                            <p>Pencatat: {catatan.dicatatOleh}</p>
                                                        </div>
                                                        
                                                        <div className="flex justify-between mb-4">
                                                            <span>{catatan.sumber}</span>
                                                            <span>{catatan.jumlah}</span>
                                                        </div>
                                                        
                                                        <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                                        
                                                        <div className="flex justify-between font-bold mb-8">
                                                            <span>Total</span>
                                                            <span>{catatan.jumlah}</span>
                                                        </div>
                                                        
                                                        <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                                        
                                                        <div className="text-center space-y-4">
                                                            <p className="text-xs">TTD. BENDAHARA DESA SUKA MAJU MUNDUR</p>
                                                            <div className="flex justify-center">
                                                                <Barcode className="w-48 h-16 text-gray-900" strokeWidth={1} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan 1-8 dari 400 baris
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
