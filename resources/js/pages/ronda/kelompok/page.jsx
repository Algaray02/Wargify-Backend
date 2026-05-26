import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { RefreshCw, ListPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCreateRondaGroup, useRondaGroups } from '@/hooks/useRonda';

export default function KelompokRondaPage() {
    const [newGroupName, setNewGroupName] = useState('');
    const { data: groups = [], isLoading, isError } = useRondaGroups();
    const createGroup = useCreateRondaGroup();

    const handleAddGroup = async () => {
        const name = newGroupName.trim() || `Kelompok ${groups.length + 1}`;

        try {
            await createGroup.mutateAsync({ name });
            setNewGroupName('');
        } catch {
            // Toast error ditangani oleh hook useCreateRondaGroup.
        }
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
                    {isLoading && (
                        <div className="rounded-xl bg-[#ebf3f9] p-4 text-sm font-medium text-slate-500">
                            Memuat kelompok ronda...
                        </div>
                    )}
                    {isError && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                            Gagal memuat kelompok ronda.
                        </div>
                    )}
                    {!isLoading && !isError && groups.length === 0 && (
                        <div className="rounded-xl bg-[#ebf3f9] p-4 text-sm font-medium text-slate-500">
                            Belum ada kelompok ronda.
                        </div>
                    )}
                    {groups.map((group) => (
                        <div key={group.group_id} className="flex flex-col gap-3 rounded-xl bg-[#ebf3f9] p-3 sm:flex-row sm:items-center">
                            <div className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                                {group.name}
                                <span className="ml-2 text-xs font-medium text-slate-500">
                                    {group.members?.length ?? 0} anggota
                                </span>
                            </div>
                            
                            <Button disabled className="bg-[#00468B] hover:bg-[#003366] text-white whitespace-nowrap h-10 px-4 flex items-center shadow-sm disabled:opacity-60">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Ganti Nama
                            </Button>
                        </div>
                    ))}
                    
                    {/* Action buttons centered/aligned beneath */}
                    <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-end">
                        <Input
                            value={newGroupName}
                            onChange={(event) => setNewGroupName(event.target.value)}
                            placeholder={`Kelompok ${groups.length + 1}`}
                            className="bg-white sm:max-w-xs"
                        />
                        <Button 
                            variant="outline" 
                            className="text-[#00468B] border-[#00468B] hover:bg-blue-50 h-10 px-4 flex items-center"
                            onClick={handleAddGroup}
                            disabled={createGroup.isPending}
                        >
                            <ListPlus className="w-4 h-4 mr-2" />
                            {createGroup.isPending ? 'Menambah...' : 'Tambah Kelompok'}
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
