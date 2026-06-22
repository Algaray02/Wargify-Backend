import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QrPreview from '@/components/common/QrPreview';
import { ArrowLeft, CalendarDays, Layers3, WalletCards } from 'lucide-react';
import { useCreateIuranPeriod } from '@/hooks/useIuran';
import { useIuranCategories } from '@/hooks/useIuranCategories';

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(value || 0);

const categorySlug = (category) => category.slug || String(category.name ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function CreateIuranPage() {
    const createPeriod = useCreateIuranPeriod();
    const { data: categoryOptions = [], isLoading: isLoadingCategories } = useIuranCategories();
    const [isCategoryInitialized, setIsCategoryInitialized] = useState(false);
    const [form, setForm] = useState({
        period_name: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        duration_months: 1,
        categories: [],
    });

    useEffect(() => {
        if (isCategoryInitialized || categoryOptions.length === 0) return;
        setForm((current) => ({ ...current, categories: [categorySlug(categoryOptions[0])] }));
        setIsCategoryInitialized(true);
    }, [categoryOptions, isCategoryInitialized]);

    const selectedCategories = categoryOptions.filter((category) => form.categories.includes(categorySlug(category)));
    const estimatedMonthly = selectedCategories.reduce((sum, category) => sum + Number(category.default_amount ?? 0), 0);
    const qrPreview = useMemo(() => {
        if (!form.period_name.trim()) return 'QR-PAY-';
        return `QR-PAY-${form.period_name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`;
    }, [form.period_name]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const toggleCategory = (value) => {
        setForm((current) => {
            const categories = current.categories.includes(value)
                ? current.categories.filter((category) => category !== value)
                : [...current.categories, value];

            return { ...current, categories };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        await createPeriod.mutateAsync({
            period_name: form.period_name,
            month: Number(form.month),
            year: Number(form.year),
            duration_months: Number(form.duration_months),
            categories: form.categories.filter(Boolean),
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
                            Buat periode iuran bulanan untuk satu atau beberapa komponen sekaligus.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Detail periode</CardTitle>
                            <CardDescription>Backend menerima bulan, tahun, durasi 1/3 bulan, dan slug kategori.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama batch iuran</Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: Iuran Rutin"
                                    value={form.period_name}
                                    onChange={(event) => updateForm('period_name', event.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="month">Bulan mulai</Label>
                                    <Input
                                        id="month"
                                        type="number"
                                        min="1"
                                        max="12"
                                        value={form.month}
                                        onChange={(event) => updateForm('month', event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="year">Tahun</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        min="2026"
                                        value={form.year}
                                        onChange={(event) => updateForm('year', event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="duration">Durasi</Label>
                                    <select
                                        id="duration"
                                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        value={form.duration_months}
                                        onChange={(event) => updateForm('duration_months', event.target.value)}
                                    >
                                        <option value="1">1 bulan</option>
                                        <option value="3">3 bulan</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label>Komponen iuran</Label>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {isLoadingCategories && <p className="text-sm text-slate-500">Memuat kategori...</p>}
                                    {categoryOptions.map((category) => {
                                        const slug = categorySlug(category);

                                        return (
                                        <label key={category.category_id ?? slug} className="flex cursor-pointer items-center justify-between rounded-lg border bg-white p-3 hover:bg-slate-50">
                                            <span>
                                                <span className="block text-sm font-semibold text-slate-900">{category.name}</span>
                                                <span className="text-xs text-slate-500">{formatCurrency(category.default_amount)} / KK</span>
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="size-4 accent-[#00468B]"
                                                checked={Boolean(slug && form.categories.includes(slug))}
                                                onChange={() => toggleCategory(slug)}
                                            />
                                        </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="rounded-lg border bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-500">Estimasi nominal per KK / bulan</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(estimatedMonthly)}</p>
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
                                <CardDescription>QR dibuat otomatis per periode dan kategori.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <QrPreview label={form.period_name || 'Iuran baru'} value={qrPreview} />
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg">
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Layers3 className="mt-1 size-5 text-[#00468B]" />
                                    <p className="text-sm text-slate-600">
                                        Akan membuat {form.categories.length} komponen × {form.duration_months} bulan.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CalendarDays className="mt-1 size-5 text-[#00468B]" />
                                    <p className="text-sm text-slate-600">
                                        Setelah dibuat, buka kelola iuran untuk memproses pembayaran per keluarga.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Link href="/keuangan/iuran">
                                <Button type="button" variant="outline">Batal</Button>
                            </Link>
                            <Button type="submit" disabled={createPeriod.isPending || form.categories.length === 0} className="bg-[#00468B] text-white hover:bg-[#003366]">
                                {createPeriod.isPending ? 'Menyimpan...' : 'Simpan iuran'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
