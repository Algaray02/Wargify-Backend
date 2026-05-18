import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { TriangleAlert, MapPin } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function SoSLogPage() {
    const dummyLog = Array(4).fill({
        nama: 'Pak Joko',
        pesan: 'Tolong ada kecelakaan',
        waktu: '05/05/2026 07:00'
    });

    return (
        <DashboardLayout>
            <Head title="SoS Log - Wargify" />
            
            <div className="p-8">
                {/* SOS Request Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">SOS Request</h2>
                    
                    <div className="max-w-xl bg-[#c52323] hover:bg-[#a61c1c] transition-colors cursor-pointer rounded-2xl p-12 text-center text-white shadow-xl shadow-red-900/20 flex flex-col items-center justify-center">
                        <TriangleAlert size={48} className="mb-4" strokeWidth={2.5} />
                        <h3 className="text-2xl font-bold mb-2">SOS DARI PAK JOKO</h3>
                        <p className="text-sm font-medium tracking-wider mb-4 uppercase">
                            Tolong ada kecelakaan di dekat TPU
                        </p>
                        <p className="text-xs text-white/70 tracking-widest uppercase">
                            Tekan untuk melihat peta
                        </p>
                    </div>
                </div>

                {/* SOS Log Section */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">SOS Log</h2>
                    
                    <div className="max-w-4xl space-y-4">
                        {dummyLog.map((log, index) => (
                            <Card key={index} className="overflow-hidden shadow-sm bg-[#ffe8e8] border-[#ffbaba] hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-gray-900 text-sm">{log.nama}</h3>
                                        <p className="text-gray-800 text-sm">{log.pesan}</p>
                                        <p className="text-xs text-gray-500 mt-2">{log.waktu}</p>
                                    </div>
                                    
                                    <Button className="bg-[#c52323] hover:bg-[#a61c1c] text-white flex items-center shrink-0">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Lihat di peta
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
