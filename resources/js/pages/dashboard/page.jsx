import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function DashboardPage() {
    const stats = [
        { label: 'Total Keluarga', value: '50' },
        { label: 'Total Warga', value: '400' },
        { label: 'Total Iuran', value: 'Rp12.000.000' },
        { label: 'Target Iuran', value: 'Rp13.000.000' },
        { label: 'Fasilitas Dilaporkan', value: '2' },
        { label: 'Pertemuan Terjadwal', value: '4' },
        { label: 'Sedang Ronda', value: '4' },
    ];

    return (
        <DashboardLayout>
            <Head title="Dashboard - Wargify" />
            
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl">
                    {stats.map((stat, index) => (
                        <div 
                            key={index} 
                            className="bg-white border border-[#00468B] rounded-lg p-6 shadow-sm flex flex-col justify-center min-h-[120px]"
                        >
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                {stat.label}
                            </h3>
                            <p className="text-5xl font-bold text-black tracking-tight">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
