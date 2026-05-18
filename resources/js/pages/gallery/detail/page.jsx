import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, PlusSquare, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

export default function GalleryDetailPage() {
    const [images, setImages] = useState([
        { id: 1, src: null },
        { id: 2, src: null },
        { id: 3, src: null },
        { id: 4, src: null },
        { id: 5, src: null },
        { id: 6, src: null },
    ]);

    const handleDelete = (id) => {
        setImages(images.filter((img) => img.id !== id));
    };

    return (
        <DashboardLayout>
            <Head title="Dokumentasi Kerja Bakti Minggu Pagi - Wargify" />
            
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 max-w-5xl">
                    <div className="flex items-center gap-3">
                        <Link href="/gallery" className="hover:bg-gray-100 p-2 rounded-full transition-colors shrink-0">
                            <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight md:text-3xl">
                            Dokumentasi Kerja Bakti Minggu Pagi
                        </h1>
                    </div>

                    {/* Dialog for Uploading Image */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-[#00468B] hover:bg-[#003366] text-white flex items-center shadow-md">
                                <PlusSquare className="w-4 h-4 mr-2" />
                                Tambah Gambar
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-white border-none shadow-2xl">
                            <DialogHeader className="mb-4">
                                <DialogTitle className="text-xl font-bold text-gray-900">Upload Gambar</DialogTitle>
                                <DialogDescription className="text-gray-500 text-sm">
                                    Upload gambar kegiatan di sini
                                </DialogDescription>
                            </DialogHeader>
                            
                            {/* Upload Area (Dropzone) */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-[#00468B] transition-all cursor-pointer group">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-[#00468B] group-hover:scale-110 transition-all mb-4">
                                    <Upload className="w-8 h-8 text-[#00468B]" strokeWidth={2} />
                                </div>
                                <p className="text-sm font-semibold text-gray-700">Tarik gambar ke sini</p>
                                <p className="text-xs text-gray-400 mt-1">atau klik untuk memilih file</p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 justify-end mt-6">
                                <DialogClose asChild>
                                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                                        Batal
                                    </Button>
                                </DialogClose>
                                <Button className="bg-[#00468B] hover:bg-[#003366] text-white">
                                    Upload
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl">
                    {images.map((img) => (
                        <Card key={img.id} className="overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                            <CardContent className="p-4 flex-1 flex flex-col">
                                {/* Image Placeholder / Container */}
                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 relative overflow-hidden flex-1 min-h-[220px]">
                                    {img.src ? (
                                        <img src={img.src} alt="Dokumentasi" className="object-cover w-full h-full" />
                                    ) : (
                                        <ImageIcon className="w-16 h-16 opacity-30 text-gray-500 group-hover:scale-105 transition-transform" strokeWidth={1.5} />
                                    )}
                                </div>
                                
                                {/* Action Bottom Area */}
                                <div className="flex justify-end items-center mt-3 pt-1 border-t border-gray-50">
                                    <button 
                                        onClick={() => handleDelete(img.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {images.length === 0 && (
                        <div className="col-span-full py-16 text-center text-gray-400">
                            Belum ada foto dokumentasi untuk kegiatan ini.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
