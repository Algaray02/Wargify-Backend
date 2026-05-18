import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Image as ImageIcon, PenLine, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

export default function LaporanFasilitasDetailPage() {
    // We support 3 states: "Belum ditangani", "Dalam Pengerjaan", "Selesai"
    const [status, setStatus] = useState("Belum ditangani");
    const [responText, setResponText] = useState("Fasilitas sedang dalam pengerjaan, harap bersabar");
    const [inputText, setInputText] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleTangani = () => {
        setResponText(inputText || "Fasilitas sedang dalam pengerjaan, harap bersabar");
        setStatus("Dalam Pengerjaan");
        setInputText("");
    };

    const handleSelesaikan = () => {
        setResponText(inputText || "Fasilitas telah diperbaiki, selamat menggunakan");
        setStatus("Selesai");
        setInputText("");
    };

    const handleSaveRespon = () => {
        setIsDialogOpen(false);
    };

    return (
        <DashboardLayout>
            <Head title="Laporan Fasilitas Detail - Wargify" />
            
            <div className="p-8 max-w-5xl">
                {/* State Switcher for Demo (Extremely useful for review) */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-4 max-w-4xl">
                    <span className="text-sm font-semibold text-blue-800">Status laporan:</span>
                    <div className="flex gap-2">
                        {["Belum ditangani", "Dalam Pengerjaan", "Selesai"].map((stateOption) => (
                            <button
                                key={stateOption}
                                onClick={() => {
                                    setStatus(stateOption);
                                    if (stateOption === "Dalam Pengerjaan") {
                                        setResponText("Fasilitas sedang dalam pengerjaan, harap bersabar");
                                    } else if (stateOption === "Selesai") {
                                        setResponText("Fasilitas telah diperbaiki, selamat menggunakan");
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                    status === stateOption 
                                        ? "bg-[#00468B] text-white" 
                                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                }`}
                            >
                                {stateOption}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Back Link & Header */}
                <div className="flex items-start gap-4 mb-8">
                    <Link href="/fasilitas" className="hover:bg-gray-100 p-2 rounded-full transition-colors shrink-0">
                        <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Laporan Fasilitas</h1>
                        <p className="text-gray-600 text-lg font-medium">Jalan Berlubang - oleh Pak Joko</p>
                    </div>
                </div>

                <div className="ml-12 max-w-4xl space-y-10">
                    {/* Upper middle section */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        
                        {/* Image section */}
                        {status !== "Selesai" ? (
                            /* Single Image for "Belum ditangani" and "Dalam Pengerjaan" */
                            <div className="relative w-64 h-52 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 overflow-hidden shadow-inner">
                                <ImageIcon className="w-16 h-16 opacity-30 text-gray-500" strokeWidth={1.5} />
                                <button className="absolute top-3 right-3 bg-white hover:bg-gray-50 text-[#00468B] p-2 rounded-xl shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all">
                                    <PenLine className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            /* Before & After Images for "Selesai" */
                            <div className="flex gap-4">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 block text-center uppercase tracking-wider">Sebelum</span>
                                    <div className="relative w-48 h-40 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 overflow-hidden shadow-inner">
                                        <ImageIcon className="w-10 h-10 opacity-30 text-gray-500" strokeWidth={1.5} />
                                        <button className="absolute top-2.5 right-2.5 bg-white hover:bg-gray-50 text-[#00468B] p-1.5 rounded-lg shadow-md border border-gray-100 hover:scale-105 transition-all">
                                            <PenLine className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 block text-center uppercase tracking-wider">Sesudah</span>
                                    <div className="relative w-48 h-40 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 overflow-hidden shadow-inner">
                                        <ImageIcon className="w-10 h-10 opacity-30 text-gray-500" strokeWidth={1.5} />
                                        <button className="absolute top-2.5 right-2.5 bg-white hover:bg-gray-50 text-[#00468B] p-1.5 rounded-lg shadow-md border border-gray-100 hover:scale-105 transition-all">
                                            <PenLine className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Details right side */}
                        <div className="flex-1 space-y-4 pt-2">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Judul</h3>
                                <p className="text-lg font-bold text-gray-900">Jalan Berlubang</p>
                            </div>
                            
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deskripsi</h3>
                                <p className="text-gray-700 text-sm font-medium">Jalan berlubang menyebabkan kendaraan rusak</p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</h3>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mt-1 shadow-sm ${
                                    status === "Belum ditangani" 
                                        ? "bg-red-50 text-red-700 border-red-200" 
                                        : status === "Dalam Pengerjaan" 
                                        ? "bg-amber-50 text-amber-700 border-amber-200" 
                                        : "bg-green-50 text-green-700 border-green-200"
                                }`}>
                                    {status}
                                </span>
                            </div>

                            {status !== "Belum ditangani" && (
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Respon</h3>
                                        
                                        {/* Dialog for Edit Respon */}
                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogTrigger asChild>
                                                <button className="text-[#00468B] hover:text-[#003366] hover:scale-110 active:scale-95 transition-all">
                                                    <PenLine className="w-3.5 h-3.5" />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md p-6 bg-white border-none shadow-2xl rounded-2xl">
                                                <DialogHeader className="mb-6">
                                                    <DialogTitle className="text-xl font-bold text-gray-900">Edit Respon</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="dialogRespon" className="text-sm font-semibold text-gray-700">Pesan Respon</Label>
                                                        <Input 
                                                            id="dialogRespon" 
                                                            value={responText}
                                                            onChange={(e) => setResponText(e.target.value)}
                                                            placeholder="Masukkan pesan anda terhadap laporan ini" 
                                                            className="border-gray-300 focus-visible:ring-[#00468B] h-11 rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-3 pt-4">
                                                        <DialogClose asChild>
                                                            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl">
                                                                Batal
                                                            </Button>
                                                        </DialogClose>
                                                        <Button 
                                                            onClick={handleSaveRespon}
                                                            className="bg-[#00468B] hover:bg-[#003366] text-white px-6 rounded-xl"
                                                        >
                                                            Simpan
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <p className="text-gray-700 text-sm font-medium mt-1">{responText}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Cards */}
                    {status === "Belum ditangani" && (
                        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm max-w-2xl">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Tangani Laporan</h2>
                            <p className="text-sm text-gray-500 mb-6">Segera perbaiki fasilitas untuk kenyamanan warga</p>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="responInput1" className="text-sm font-semibold text-gray-700">Pesan Respon</Label>
                                    <Input 
                                        id="responInput1"
                                        placeholder="Masukkan pesan anda terhadap laporan ini" 
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        className="border-gray-300 focus-visible:ring-[#00468B] h-11 rounded-xl bg-white"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button 
                                        onClick={handleTangani}
                                        className="bg-[#00468B] hover:bg-[#003366] text-white px-6 py-2.5 rounded-xl shadow-sm font-semibold"
                                    >
                                        Tangani
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === "Dalam Pengerjaan" && (
                        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm max-w-2xl">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Selesaikan Pengerjaan</h2>
                            <p className="text-sm text-gray-500 mb-6">Selesaikan pengerjaan fasilitas ini</p>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="responInput2" className="text-sm font-semibold text-gray-700">Pesan Respon</Label>
                                    <Input 
                                        id="responInput2"
                                        placeholder="Masukkan pesan anda terhadap laporan ini" 
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        className="border-gray-300 focus-visible:ring-[#00468B] h-11 rounded-xl bg-white"
                                    />
                                </div>
                                
                                <div className="space-y-2 max-w-sm">
                                    <Label className="text-sm font-semibold text-gray-700">Gambar Selesai</Label>
                                    <div className="flex items-center w-full border border-gray-300 rounded-xl px-3 py-1.5 bg-white text-sm text-gray-500 shadow-sm cursor-pointer hover:bg-gray-50">
                                        <input type="file" className="hidden" id="imageInput" />
                                        <label htmlFor="imageInput" className="cursor-pointer font-medium">Choose file</label>
                                        <span className="ml-3 text-xs text-gray-400">No file chosen</span>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button 
                                        onClick={handleSelesaikan}
                                        className="bg-[#00468B] hover:bg-[#003366] text-white px-6 py-2.5 rounded-xl shadow-sm font-semibold"
                                    >
                                        Selesaikan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === "Selesai" && (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-6 max-w-2xl shadow-sm text-green-800">
                            <div className="p-2 bg-green-500 rounded-full text-white shrink-0 shadow-sm">
                                <Check className="w-5 h-5" strokeWidth={3} />
                            </div>
                            <div>
                                <h4 className="font-bold text-green-950 text-lg">Pengerjaan Selesai</h4>
                                <p className="text-sm font-medium text-green-700 mt-0.5">Laporan fasilitas ini telah ditangani sepenuhnya dengan sangat baik.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
