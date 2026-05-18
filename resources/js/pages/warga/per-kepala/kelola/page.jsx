import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function KelolaKeluargaPage() {
    return (
        <DashboardLayout>
            <Head title="Kelola Keluarga - Wargify" />
            
            <div className="p-8 max-w-5xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-10">Kelola Keluarga pak Tatang Sutarma</h1>
                
                <div className="border-2 border-[#00468B]/20 rounded-xl overflow-hidden bg-white shadow-sm max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#00468B]/10">
                        {/* Option 1 */}
                        <Link 
                            href="/warga/per-kepala/anggota" 
                            className="p-8 hover:bg-gray-50 transition-colors block group"
                        >
                            <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-[#00468B]">Anggota keluarga</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Kelola siapa saja yang menjadi<br/>anggota keluarga ini
                            </p>
                        </Link>
                        
                        {/* Option 2 */}
                        <Link 
                            href="#" 
                            className="p-8 hover:bg-gray-50 transition-colors block group"
                        >
                            <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-[#00468B]">Tempat tinggal</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Kelola tempat tinggal yang ditinggali<br/>oleh keluarga ini
                            </p>
                        </Link>
                    </div>
                    
                    <div className="border-t border-[#00468B]/10">
                        {/* Option 3 */}
                        <Link 
                            href="#" 
                            className="p-8 hover:bg-gray-50 transition-colors block group w-full md:w-1/2"
                        >
                            <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-[#00468B]">Kode QR</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Kelola kode QR untuk keperluan<br/>administrasi
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
