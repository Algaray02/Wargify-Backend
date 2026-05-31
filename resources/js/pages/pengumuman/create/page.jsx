import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Image as ImageIcon, Megaphone, PenLine, Send, Users } from 'lucide-react';
import { useCreateAnnouncement, usePublishAnnouncement } from '@/hooks/useAnnouncements';

const defaultForm = {
    title: '',
    content: '',
    banner_url: '',
};

export default function TambahPengumumanPage() {
    const [imagePreview, setImagePreview] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [shouldPublish, setShouldPublish] = useState(true);
    const createAnnouncement = useCreateAnnouncement();
    const publishAnnouncement = usePublishAnnouncement();

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const announcement = await createAnnouncement.mutateAsync({
            ...form,
            banner_url: form.banner_url || null,
        });

        if (shouldPublish) {
            await publishAnnouncement.mutateAsync(announcement.announcement_id);
        }

        router.visit('/pengumuman');
    };

    const isSubmitting = createAnnouncement.isPending || publishAnnouncement.isPending;

    return (
        <DashboardLayout>
            <Head title="Buat Pengumuman Baru - Wargify" />

            <div className="space-y-6 p-8">
                <div className="flex items-start gap-3">
                    <Link href="/pengumuman" className="shrink-0 rounded-full p-2 transition-colors hover:bg-gray-100">
                        <ArrowLeft className="size-5 text-gray-900" strokeWidth={2.5} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tambah Pengumuman</h1>
                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Pengumuman diterbitkan untuk seluruh pengguna aplikasi.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Isi pengumuman</CardTitle>
                            <CardDescription>Konten ini akan dikirim dan ditampilkan untuk seluruh pengguna.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    placeholder="Contoh: Jadwal Rapat Warga Bulan Juni"
                                    value={form.title}
                                    onChange={(event) => updateForm('title', event.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content">Isi</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Tulis informasi pengumuman"
                                    rows={8}
                                    className="resize-none"
                                    value={form.content}
                                    onChange={(event) => updateForm('content', event.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Banner</Label>
                                <div className="relative h-52 max-w-md overflow-hidden rounded-lg border bg-slate-50">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview banner" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="grid h-full place-items-center text-slate-400">
                                            <div className="text-center">
                                                <ImageIcon className="mx-auto size-12" strokeWidth={1.5} />
                                                <p className="mt-2 text-xs font-semibold uppercase tracking-wide">No image</p>
                                            </div>
                                        </div>
                                    )}
                                    <label className="absolute right-3 top-3 cursor-pointer rounded-lg border bg-white p-2 text-[#00468B] shadow-sm transition hover:bg-slate-50">
                                        <PenLine className="size-4" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (!file) return;
                                                setImagePreview(URL.createObjectURL(file));
                                                updateForm('banner_url', `/storage/announcements/${file.name}`);
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                                <div>
                                    <Label htmlFor="publish" className="font-semibold">Terbitkan langsung</Label>
                                    <p className="mt-1 text-xs text-slate-500">Jika mati, pengumuman disimpan sebagai draft.</p>
                                </div>
                                <Switch id="publish" checked={shouldPublish} onCheckedChange={setShouldPublish} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="size-4" />
                                    Penerima
                                </CardTitle>
                                <CardDescription>Tidak ada pemilihan khusus untuk pengumuman.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Seluruh pengguna</p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        FCM dan daftar pengumuman akan dikirim ke semua pengguna yang memiliki token aktif.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Link href="/pengumuman">
                                <Button type="button" variant="outline">Batal</Button>
                            </Link>
                            <Button type="submit" className="bg-[#00468B] text-white hover:bg-[#003366]" disabled={isSubmitting}>
                                {shouldPublish ? <Send className="size-4" /> : <Megaphone className="size-4" />}
                                {shouldPublish ? 'Simpan & Terbitkan' : 'Simpan draft'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
