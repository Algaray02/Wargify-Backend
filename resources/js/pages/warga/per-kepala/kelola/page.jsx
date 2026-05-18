import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Home, QrCode, UsersRound } from 'lucide-react';

export default function KelolaKeluargaPage() {
    return (
        <DashboardLayout>
            <Head title="Kelola Keluarga - Wargify" />
            
            <div className="p-8 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Keluarga Pak Tatang Sutarma</h1>
                    <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                        Pilih area data keluarga yang ingin diperbarui.
                    </p>
                </div>
                
                <div className="grid max-w-4xl gap-4 md:grid-cols-3">
                        <Link 
                            href="/warga/per-kepala/anggota" 
                            className="rounded-2xl border border-[#00468B]/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00468B]/25 hover:shadow-lg"
                        >
                            <div className="mb-5 grid size-12 place-items-center rounded-xl bg-[#E6F6FF] text-[#00468B]">
                                <UsersRound className="size-6" />
                            </div>
                            <h3 className="text-base font-black text-gray-900 mb-2">Anggota keluarga</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Kelola siapa saja yang menjadi anggota keluarga ini.
                            </p>
                        </Link>
                        
                        <Link 
                            href="#" 
                            className="rounded-2xl border border-[#00468B]/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00468B]/25 hover:shadow-lg"
                        >
                            <div className="mb-5 grid size-12 place-items-center rounded-xl bg-[#E6F6FF] text-[#00468B]">
                                <Home className="size-6" />
                            </div>
                            <h3 className="text-base font-black text-gray-900 mb-2">Tempat tinggal</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Kelola alamat dan tempat tinggal keluarga ini.
                            </p>
                        </Link>

                        <Link 
                            href="#" 
                            className="rounded-2xl border border-[#00468B]/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00468B]/25 hover:shadow-lg"
                        >
                            <div className="mb-5 grid size-12 place-items-center rounded-xl bg-[#E6F6FF] text-[#00468B]">
                                <QrCode className="size-6" />
                            </div>
                            <h3 className="text-base font-black text-gray-900 mb-2">Kode QR</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Kelola kode QR untuk keperluan administrasi.
                            </p>
                        </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
