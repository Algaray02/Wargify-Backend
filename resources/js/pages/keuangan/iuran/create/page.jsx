import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QrPreview from '@/components/common/QrPreview';
import { ArrowLeft, CalendarDays, WalletCards } from 'lucide-react';
import { useCreateIuranPeriod } from '@/hooks/useIuran';

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(value || 0);

export default function CreateIuranPage() {
    const createPeriod = useCreateIuranPeriod();
    const [form, setForm] = useState({
        period_name: '',
        description: '',
        due_date: '',
        amount_per_family: '',
    });

    const numericAmount = Number(String(form.amount_per_family).replace(/[^\d]/g, ''));
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

        await createPeriod.mutateAsync({
            period_name: form.period_name,
            month: selectedDate.getMonth() + 1,
            year: selectedDate.getFullYear(),
            amount_per_family: numericAmount,
        });
        router.visit('/keuangan/iuran');
    };

    return (
        <DashboardLayout>
            <Head title="Tambah Iuran - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex items-start gap-3">
                    <Link href="/keuangan/iuran" className="rounded-full p-2 transition-colors hover:bg-gray-100">
                        <ArrowLeft className="size-5 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tambah Iuran</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Buat periode iuran dan QR pembayaran untuk keluarga warga.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Detail periode</CardTitle>
                            <CardDescription>Periode iuran memakai bulan dan tahun dari tanggal yang dipilih.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama iuran</Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: Iuran Juni 2026"
                                    value={form.period_name}
                                    onChange={(event) => updateForm('period_name', event.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi internal</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Opsional, catatan kebutuhan iuran"
                                    className="min-h-28 resize-none"
                                    value={form.description}
                                    onChange={(event) => updateForm('description', event.target.value)}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="due_date">Bulan iuran</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={form.due_date}
                                        onChange={(event) => updateForm('due_date', event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Nominal per KK</Label>
                                    <Input
                                        id="amount"
                                        placeholder="Contoh: 50000"
                                        inputMode="numeric"
                                        value={form.amount_per_family}
                                        onChange={(event) => updateForm('amount_per_family', event.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-500">Nominal yang akan dibuat</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(numericAmount)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <WalletCards className="size-4" />
                                    QR pembayaran
                                </CardTitle>
                                <CardDescription>QR periode dibuat otomatis dari nama iuran.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <QrPreview label={form.period_name || 'Iuran baru'} value={qrPreview} />
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg">
                            <CardContent className="flex items-start gap-3">
                                <CalendarDays className="mt-1 size-5 text-[#00468B]" />
                                <p className="text-sm text-slate-600">
                                    Setelah periode dibuat, buka menu kelola untuk checklist keluarga yang sudah membayar.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Link href="/keuangan/iuran">
                                <Button type="button" variant="outline">Batal</Button>
                            </Link>
                            <Button type="submit" disabled={createPeriod.isPending} className="bg-[#00468B] text-white hover:bg-[#003366]">
                                {createPeriod.isPending ? 'Menyimpan...' : 'Simpan iuran'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
