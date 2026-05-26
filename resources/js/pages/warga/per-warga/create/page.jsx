import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
import { useCreateUser } from '@/hooks/useUsers';
import { useFamilies } from '@/hooks/useFamilies';

export default function CreateWargaPage() {
    const { data: families = [] } = useFamilies();
    const createUser = useCreateUser();
    const [form, setForm] = useState({
        username: '',
        password: '',
        full_name: '',
        family_id: '',
        role: 'WARGA',
        phone_number: '',
    });

    const selectedFamily = families.find((family) => family.family_id === form.family_id);
    const selectedHead = selectedFamily?.members?.find((member) => member.user_id === selectedFamily.head_of_family_id)
        ?? selectedFamily?.members?.[0];

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await createUser.mutateAsync(form);
            router.visit('/warga/per-warga');
        } catch {
            // Toast error ditangani oleh hook useCreateUser.
        }
    };

    return (
        <DashboardLayout>
            <Head title="Tambah Warga - Wargify" />
            
            <form onSubmit={handleSubmit} className="p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <Link href="/warga/per-warga" className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Warga</h1>
                </div>
                
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-6">
                        <img 
                            src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e6e6e6" 
                            alt="Profile" 
                            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md bg-orange-500"
                        />
                        <button className="absolute bottom-2 right-2 bg-[#00468B] text-white p-2 rounded-xl shadow-lg hover:bg-[#003366] transition-colors border-2 border-white">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-gray-900">{form.full_name || 'Nama Lengkap'}</h2>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="kepala-keluarga"
                                checked={form.role === 'KETUA_RT'}
                                onCheckedChange={(checked) => updateForm('role', checked ? 'KETUA_RT' : 'WARGA')}
                            />
                            <Label htmlFor="kepala-keluarga" className="text-sm text-gray-600 font-normal">Kepala Keluarga</Label>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                        <Input
                            id="username"
                            placeholder="username"
                            className="border-gray-300 focus-visible:ring-[#00468B]"
                            value={form.username}
                            onChange={(event) => updateForm('username', event.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="grid grid-cols-[1fr_2fr] gap-4">
                            <div>
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                <Input
                                    id="password"
                                    placeholder="Minimal 6 karakter"
                                    type="password"
                                    className="border-gray-300 focus-visible:ring-[#00468B]"
                                    value={form.password}
                                    onChange={(event) => updateForm('password', event.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <Label htmlFor="keluarga" className="text-sm font-medium text-gray-700">&nbsp;</Label>
                                <Select value={form.family_id} onValueChange={(value) => updateForm('family_id', value)}>
                                    <SelectTrigger className="border-gray-300 focus:ring-[#00468B]">
                                        <SelectValue placeholder="Keluarga dari..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {families.map((family) => {
                                            const head = family.members?.find((member) => member.user_id === family.head_of_family_id)
                                                ?? family.members?.[0];

                                            return (
                                                <SelectItem key={family.family_id} value={family.family_id}>
                                                    {head?.full_name ?? family.qr_code_data ?? family.family_id}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nama" className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                        <Input
                            id="nama"
                            placeholder="nama lengkap"
                            className="border-gray-300 focus-visible:ring-[#00468B]"
                            value={form.full_name}
                            onChange={(event) => updateForm('full_name', event.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                        <Select value={form.role} onValueChange={(value) => updateForm('role', value)}>
                            <SelectTrigger className="border-gray-300 focus:ring-[#00468B]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WARGA">Warga</SelectItem>
                                <SelectItem value="KETUA_RT">Ketua RT</SelectItem>
                                <SelectItem value="BENDAHARA">Bendahara</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nohp" className="text-sm font-medium text-gray-700">No. HP</Label>
                        <Input
                            id="nohp"
                            placeholder="08123456789"
                            className="border-gray-300 focus-visible:ring-[#00468B]"
                            value={form.phone_number}
                            onChange={(event) => updateForm('phone_number', event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Keluarga Terpilih</Label>
                        <div className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600">
                            {selectedHead?.full_name ?? 'Pilih keluarga terlebih dahulu'}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button
                        type="submit"
                        disabled={createUser.isPending}
                        className="bg-[#00468B] hover:bg-[#003366] text-white px-12 py-6 text-lg font-medium w-full max-w-md"
                    >
                        {createUser.isPending ? 'Menyimpan...' : 'Tambah'}
                    </Button>
                </div>
            </form>
        </DashboardLayout>
    );
}
