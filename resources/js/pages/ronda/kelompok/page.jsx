import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { RefreshCw, ListPlus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function KelompokRondaPage() {
    const [groups, setGroups] = useState([
        { id: 1, name: "kelompok_1" },
        { id: 2, name: "kelompok_2" },
        { id: 3, name: "kelompok_3" },
        { id: 4, name: "kelompok_1" },
        { id: 5, name: "kelompok_1" },
        { id: 6, name: "kelompok_1" },
    ]);

    const handleAddGroup = () => {
        setGroups([...groups, { id: groups.length + 1, name: "kelompok_1" }]);
    };

    return (
        <DashboardLayout>
            <Head title="Kelompok Ronda - Wargify" />
            
            <div className="p-8 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Kelompok Ronda</h1>
                    <p className="text-sm font-medium text-gray-500">Atur pembagian kelompok ronda agar jadwal lebih mudah dikelola.</p>
                </div>
                
                <div className="flex flex-col gap-3 rounded-2xl border border-[#00468B]/10 bg-white p-5 shadow-sm">
                    {groups.map((group, index) => (
                        <div key={group.id} className="flex flex-col gap-3 rounded-xl bg-[#ebf3f9] p-3 sm:flex-row sm:items-center">
                            <Select defaultValue={group.name}>
                                <SelectTrigger className="flex-1 bg-white border-gray-300 focus:ring-[#00468B] h-10">
                                    <SelectValue placeholder="Pilih Kelompok" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kelompok_1">Kelompok 1</SelectItem>
                                    <SelectItem value="kelompok_2">Kelompok 2</SelectItem>
                                    <SelectItem value="kelompok_3">Kelompok 3</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Button className="bg-[#00468B] hover:bg-[#003366] text-white whitespace-nowrap h-10 px-4 flex items-center shadow-sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Ganti Nama
                            </Button>
                        </div>
                    ))}
                    
                    {/* Action buttons centered/aligned beneath */}
                    <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-end">
                        <Button 
                            variant="outline" 
                            className="text-[#00468B] border-[#00468B] hover:bg-blue-50 h-10 px-4 flex items-center"
                            onClick={handleAddGroup}
                        >
                            <ListPlus className="w-4 h-4 mr-2" />
                            Tambah Kelompok
                        </Button>
                        <Button className="bg-[#00468B] hover:bg-[#003366] text-white h-10 px-6 shadow-sm">
                            Simpan Perubahan
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
