import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useCreateIuranPeriod } from '@/hooks/useIuran';

export default function CreateIuranPage() {
    const createPeriod = useCreateIuranPeriod();
    const [form, setForm] = useState({
        period_name: '',
        description: '',
        due_date: '',
        amount_per_family: '',
    });

    const qrPreview = useMemo(() => {
        if (!form.period_name.trim()) return 'QR-PAY-';
        return `QR-PAY-${form.period_name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`;
    }, [form.period_name]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const selectedDate = form.due_date ? new Date(form.due_date) : new Date();
        const numericAmount = Number(String(form.amount_per_family).replace(/[^\d]/g, ''));

        try {
            await createPeriod.mutateAsync({
                period_name: form.period_name,
                month: selectedDate.getMonth() + 1,
                year: selectedDate.getFullYear(),
                amount_per_family: numericAmount,
            });
            router.visit('/keuangan/iuran');
        } catch {
            // Toast error ditangani oleh hook useCreateIuranPeriod.
        }
    };

    return (
        <DashboardLayout>
            <Head title="Tambah Iuran - Wargify" />
            
            <form onSubmit={handleSubmit} className="p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/keuangan/iuran" className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Iuran</h1>
                </div>
                <p className="text-gray-600 ml-12 mb-10 text-lg">Tambah iuran untuk perkembangan desa</p>

                {/* Form Section */}
                <div className="ml-12 space-y-6 max-w-3xl">
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="nama" className="text-sm font-medium text-gray-900">Nama Iuran</Label>
                        <Input
                            id="nama"
                            placeholder="Contoh: Iuran Bulanan"
                            className="border-gray-300 focus-visible:ring-[#00468B]"
                            value={form.period_name}
                            onChange={(event) => updateForm('period_name', event.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                        <Label htmlFor="deskripsi" className="text-sm font-medium text-gray-900 pt-3">Deskripsi</Label>
                        <Textarea
                            id="deskripsi"
                            placeholder="Tulis deskripsi kebutuhan iuran"
                            className="min-h-[150px] border-gray-300 focus-visible:ring-[#00468B] resize-none"
                            value={form.description}
                            onChange={(event) => updateForm('description', event.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="tenggat" className="text-sm font-medium text-gray-900">Tenggat pembayaran</Label>
                        <Input
                            id="tenggat"
                            type="date"
                            className="border-gray-300 focus-visible:ring-[#00468B] w-64"
                            value={form.due_date}
                            onChange={(event) => updateForm('due_date', event.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="jumlah" className="text-sm font-medium text-gray-900">Jumlah untuk dibayar</Label>
                        <Input
                            id="jumlah"
                            placeholder="Contoh: 100000"
                            inputMode="numeric"
                            className="border-gray-300 focus-visible:ring-[#00468B]"
                            value={form.amount_per_family}
                            onChange={(event) => updateForm('amount_per_family', event.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label className="text-sm font-medium text-gray-900">QR Pembayaran</Label>
                        <div>
                            <Button type="button" className="bg-[#00468B] hover:bg-[#003366] text-white">
                                <QrCode className="w-4 h-4 mr-2" />
                                {qrPreview}
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-8">
                        <Button type="submit" disabled={createPeriod.isPending} className="bg-[#00468B] hover:bg-[#003366] text-white">
                            {createPeriod.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
