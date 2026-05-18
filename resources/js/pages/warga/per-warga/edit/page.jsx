import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Camera } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditWargaPage() {
    return (
        <DashboardLayout>
            <Head title="Kelola Warga - Wargify" />
            
            <div className="p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <Link href="/warga/per-warga" className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Warga</h1>
                </div>
                
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-6">
                        <img 
                            src="https://api.dicebear.com/7.x/notionists/svg?seed=Sule&backgroundColor=e6e6e6" 
                            alt="Profile" 
                            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md bg-blue-500"
                        />
                        <button className="absolute bottom-2 right-2 bg-[#00468B] text-white p-2 rounded-xl shadow-lg hover:bg-[#003366] transition-colors border-2 border-white">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-gray-900">Sule Sutarma</h2>
                        <div className="flex items-center gap-2">
                            <Switch id="kepala-keluarga" />
                            <Label htmlFor="kepala-keluarga" className="text-sm text-gray-600 font-normal">Kepala Keluarga</Label>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                        <Input id="username" defaultValue="sulesutarma" className="border-gray-300 focus-visible:ring-[#00468B]" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="grid grid-cols-[1fr_2fr] gap-4">
                            <div>
                                <Label htmlFor="umur" className="text-sm font-medium text-gray-700">Umur</Label>
                                <Input id="umur" defaultValue="30" type="number" className="border-gray-300 focus-visible:ring-[#00468B]" />
                            </div>
                            <div>
                                <Label htmlFor="keluarga" className="text-sm font-medium text-gray-700">&nbsp;</Label>
                                <Select defaultValue="tatang">
                                    <SelectTrigger className="border-gray-300 focus:ring-[#00468B]">
                                        <SelectValue placeholder="Keluarga dari..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tatang">Tatang Sutarma</SelectItem>
                                        <SelectItem value="sule">Sule Sutarma</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nama" className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                        <Input id="nama" defaultValue="Sule Sutarma" className="border-gray-300 focus-visible:ring-[#00468B]" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                        <Select defaultValue="warga">
                            <SelectTrigger className="border-gray-300 focus:ring-[#00468B]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="warga">Warga</SelectItem>
                                <SelectItem value="rt">RT</SelectItem>
                                <SelectItem value="bendahara">Bendahara</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nohp" className="text-sm font-medium text-gray-700">No. HP</Label>
                        <Input id="nohp" defaultValue="08123456789" className="border-gray-300 focus-visible:ring-[#00468B]" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender</Label>
                        <Select defaultValue="pria">
                            <SelectTrigger className="border-gray-300 focus:ring-[#00468B]">
                                <SelectValue placeholder="Pria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pria">Pria</SelectItem>
                                <SelectItem value="wanita">Wanita</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button className="bg-[#00468B] hover:bg-[#003366] text-white px-12 py-6 text-lg font-medium w-full max-w-md">
                        Simpan
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
