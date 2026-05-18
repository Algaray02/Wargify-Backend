import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Image as ImageIcon, PenLine, Megaphone } from 'lucide-react';

export default function TambahPengumumanPage() {
    const [imagePreview, setImagePreview] = useState(null);

    return (
        <DashboardLayout>
            <Head title="Buat Pengumuman Baru - Wargify" />
            
            <div className="p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/pengumuman" className="hover:bg-gray-100 p-2 rounded-full transition-colors shrink-0">
                        <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Daftar Pengumuman <span className="text-[#00468B]">+</span>
                    </h1>
                </div>

                <div className="ml-12 max-w-2xl space-y-6">
                    {/* Image Upload/Placeholder Box */}
                    <div className="relative w-64 h-48 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 group overflow-hidden shadow-inner">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                <ImageIcon className="w-16 h-16 opacity-30 text-gray-500 group-hover:scale-105 transition-transform" strokeWidth={1.5} />
                            </div>
                        )}
                        
                        {/* Edit Icon Button in Top Right */}
                        <label className="absolute top-3 right-3 bg-white hover:bg-gray-50 text-[#00468B] p-2 rounded-xl shadow-md border border-gray-100 cursor-pointer hover:scale-110 active:scale-95 transition-all">
                            <PenLine className="w-4 h-4" />
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </label>
                    </div>

                    {/* Judul Field */}
                    <div className="space-y-2">
                        <Label htmlFor="judul" className="text-sm font-semibold text-gray-800">Judul</Label>
                        <Input 
                            id="judul" 
                            placeholder="Masukkan Judul" 
                            className="border-gray-300 focus-visible:ring-[#00468B] h-11 rounded-xl bg-white shadow-sm"
                        />
                    </div>

                    {/* Isi Field */}
                    <div className="space-y-2">
                        <Label htmlFor="isi" className="text-sm font-semibold text-gray-800">Isi</Label>
                        <Textarea 
                            id="isi" 
                            placeholder="Masukkan Isi" 
                            rows={6}
                            className="border-gray-300 focus-visible:ring-[#00468B] rounded-xl bg-white shadow-sm"
                        />
                    </div>

                    {/* Prioritas Field */}
                    <div className="space-y-2 max-w-xs">
                        <Label htmlFor="prioritas" className="text-sm font-semibold text-gray-800">Prioritas</Label>
                        <Select defaultValue="penting">
                            <SelectTrigger className="border-gray-300 focus:ring-[#00468B] h-11 rounded-xl bg-white shadow-sm">
                                <SelectValue placeholder="Pilih Prioritas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="penting">Penting</SelectItem>
                                <SelectItem value="biasa">Biasa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2">
                            <Megaphone className="w-4 h-4" />
                            Simpan & Umumkan
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
