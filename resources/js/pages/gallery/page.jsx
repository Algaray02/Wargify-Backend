import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    CalendarDays,
    Image as ImageIcon,
    Images,
    MapPin,
    Pencil,
    Plus,
    Search,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import {
    useCreateGallery,
    useDeleteGallery,
    useDeleteGalleryImage,
    useGalleries,
    useUpdateGallery,
    useUploadGalleryImages,
} from '@/hooks/useGalleries';
import { useActivities } from '@/hooks/useActivities';

const emptyForm = {
    album_name: '',
    event_date: '',
    activity_id: 'none',
};

export default function GalleryPage() {
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGallery, setEditingGallery] = useState(null);
    const [selectedGalleryId, setSelectedGalleryId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFiles, setImageFiles] = useState([]);

    const { data: galleries = [], isLoading, isError } = useGalleries();
    const { data: activities = [] } = useActivities();
    const createGallery = useCreateGallery();
    const updateGallery = useUpdateGallery();
    const deleteGallery = useDeleteGallery();
    const uploadImages = useUploadGalleryImages();
    const deleteImage = useDeleteGalleryImage();

    const filteredGalleries = useMemo(() => {
        const keyword = search.toLowerCase();

        return galleries.filter((gallery) => [
            gallery.album_name,
            gallery.activity?.title,
            gallery.activity?.location_name,
        ].some((value) => String(value ?? '').toLowerCase().includes(keyword)));
    }, [galleries, search]);

    const selectedGallery = galleries.find((gallery) => gallery.gallery_id === selectedGalleryId)
        ?? filteredGalleries[0]
        ?? null;
    const selectedActivity = activities.find((activity) => activity.activity_id === form.activity_id);

    const formatDate = (value) => value
        ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value))
        : '-';

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const openCreateForm = () => {
        setEditingGallery(null);
        setForm(emptyForm);
        setIsFormOpen(true);
    };

    const openEditForm = (gallery) => {
        setEditingGallery(gallery);
        setForm({
            album_name: gallery.album_name ?? '',
            event_date: gallery.event_date ?? '',
            activity_id: gallery.activity_id ?? 'none',
        });
        setIsFormOpen(true);
    };

    const submitGallery = async (event) => {
        event.preventDefault();

        const payload = {
            album_name: form.album_name,
            event_date: form.event_date,
            activity_id: form.activity_id === 'none' ? null : form.activity_id,
        };

        if (editingGallery) {
            await updateGallery.mutateAsync({ galleryId: editingGallery.gallery_id, payload });
        } else {
            const gallery = await createGallery.mutateAsync(payload);
            setSelectedGalleryId(gallery.gallery_id);
        }

        setIsFormOpen(false);
        setForm(emptyForm);
        setEditingGallery(null);
    };

    const submitImages = async (event) => {
        event.preventDefault();

        if (!selectedGallery || imageFiles.length === 0) {
            return;
        }

        await uploadImages.mutateAsync({
            galleryId: selectedGallery.gallery_id,
            images: imageFiles,
        });
        setImageFiles([]);
    };

    const removePendingImage = (index) => {
        setImageFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
    };

    return (
        <DashboardLayout>
            <Head title="Kelola Dokumentasi Kegiatan - Wargify" />

            <div className="p-8">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Dokumentasi Kegiatan</h1>
                        <p className="mt-3 max-w-2xl text-sm font-medium text-gray-500">
                            Buat album, unggah foto kegiatan, dan kelola arsip dokumentasi warga.
                        </p>
                    </div>

                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" onClick={openCreateForm} className="bg-[#00468B] text-white hover:bg-[#003366]">
                                <Plus className="mr-2 size-4" />
                                Buat Album
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingGallery ? 'Edit Album' : 'Buat Album Baru'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submitGallery} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="album_name">Nama album</Label>
                                    <Input
                                        id="album_name"
                                        value={form.album_name}
                                        onChange={(event) => updateForm('album_name', event.target.value)}
                                        placeholder="Contoh: Kerja Bakti Minggu Pagi"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="event_date">Tanggal kegiatan</Label>
                                    <Input
                                        id="event_date"
                                        type="date"
                                        value={form.event_date}
                                        onChange={(event) => updateForm('event_date', event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kegiatan terkait</Label>
                                    <Select value={form.activity_id} onValueChange={(value) => updateForm('activity_id', value)}>
                                        <SelectTrigger className="w-full">
                                            <span className="block truncate text-left">
                                                {form.activity_id === 'none'
                                                    ? 'Tidak terkait kegiatan'
                                                    : selectedActivity?.title ?? 'Pilih kegiatan'}
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Tidak terkait kegiatan</SelectItem>
                                            {activities.map((activity) => (
                                                <SelectItem key={activity.activity_id} value={activity.activity_id}>
                                                    {activity.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createGallery.isPending || updateGallery.isPending}
                                        className="bg-[#00468B] text-white hover:bg-[#003366]"
                                    >
                                        {editingGallery ? 'Simpan' : 'Buat Album'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="mb-6 flex max-w-xl items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm">
                    <Search className="size-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari album, kegiatan, atau lokasi"
                        className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <div className="grid content-start gap-4 md:grid-cols-2">
                        {isLoading && (
                            <div className="rounded-xl border bg-white p-5 text-sm font-semibold text-slate-500">Memuat album galeri...</div>
                        )}
                        {isError && (
                            <div className="rounded-xl border bg-white p-5 text-sm font-semibold text-red-600">Gagal memuat album galeri.</div>
                        )}
                        {!isLoading && !isError && filteredGalleries.length === 0 && (
                            <div className="rounded-xl border bg-white p-5 text-sm font-semibold text-slate-500">Belum ada album galeri.</div>
                        )}
                        {filteredGalleries.map((gallery) => {
                            const coverImage = gallery.images?.[0]?.image_url;
                            const isSelected = selectedGallery?.gallery_id === gallery.gallery_id;

                            return (
                                <Card
                                    key={gallery.gallery_id}
                                    className={`cursor-pointer bg-white transition hover:border-[#00468B]/35 hover:shadow-md ${isSelected ? 'ring-2 ring-[#00468B]/25' : ''}`}
                                    onClick={() => setSelectedGalleryId(gallery.gallery_id)}
                                >
                                    <CardContent className="p-0">
                                        <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                                            {coverImage ? (
                                                <img src={coverImage} alt={gallery.album_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="grid h-full place-items-center text-[#00468B]">
                                                    <Images className="size-12" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-4 p-5">
                                            <div>
                                                <h3 className="line-clamp-2 text-lg font-black text-gray-900">{gallery.album_name}</h3>
                                                <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium text-gray-500">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CalendarDays className="size-4" />
                                                        {formatDate(gallery.event_date)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin className="size-4" />
                                                        {gallery.activity?.location_name ?? 'Dokumentasi warga'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <Badge variant="secondary" className="bg-[#E6F6FF] text-[#00468B]">
                                                    {gallery.images_count ?? gallery.images?.length ?? 0} foto
                                                </Badge>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="outline"
                                                        className="size-8"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            openEditForm(gallery);
                                                        }}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="outline"
                                                        className="size-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        disabled={deleteGallery.isPending}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            deleteGallery.mutate(gallery.gallery_id);
                                                        }}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <aside className="rounded-xl border bg-white p-5 shadow-sm">
                        {selectedGallery ? (
                            <div className="space-y-5">
                                <div>
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">{selectedGallery.album_name}</h2>
                                            <p className="mt-1 text-sm font-semibold text-slate-500">{formatDate(selectedGallery.event_date)}</p>
                                        </div>
                                        <Badge className="bg-[#00468B] text-white">
                                            {selectedGallery.images?.length ?? 0} foto
                                        </Badge>
                                    </div>
                                    {selectedGallery.activity && (
                                        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                                            {selectedGallery.activity.title}
                                        </p>
                                    )}
                                </div>

                                <form onSubmit={submitImages} className="rounded-xl border border-dashed border-[#00468B]/30 bg-[#F3FAFF] p-4">
                                    <Label htmlFor="gallery_images" className="mb-3 block text-sm font-black text-slate-900">
                                        Upload foto album
                                    </Label>
                                    <Input
                                        id="gallery_images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="bg-white"
                                        onChange={(event) => {
                                            setImageFiles(Array.from(event.target.files ?? []));
                                        }}
                                    />
                                    {imageFiles.length > 0 && (
                                        <div className="mt-3 grid grid-cols-3 gap-2">
                                            {imageFiles.map((file, index) => (
                                                <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-lg border bg-white">
                                                    <img src={URL.createObjectURL(file)} alt={file.name} className="aspect-square w-full object-cover" />
                                                    <button
                                                        type="button"
                                                        className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
                                                        onClick={() => removePendingImage(index)}
                                                    >
                                                        <X className="size-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={imageFiles.length === 0 || uploadImages.isPending}
                                        className="mt-4 w-full bg-[#00468B] text-white hover:bg-[#003366]"
                                    >
                                        <Upload className="mr-2 size-4" />
                                        {uploadImages.isPending ? 'Mengunggah...' : 'Upload Foto'}
                                    </Button>
                                </form>

                                <div className="grid grid-cols-2 gap-3">
                                    {(selectedGallery.images ?? []).map((image) => (
                                        <div key={image.image_id} className="group relative overflow-hidden rounded-xl border bg-slate-100">
                                            <img src={image.image_url} alt={selectedGallery.album_name} className="aspect-square w-full object-cover" />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                disabled={deleteImage.isPending}
                                                className="absolute right-2 top-2 size-8 border-red-200 bg-white/90 text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100"
                                                onClick={() => deleteImage.mutate(image.image_id)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {selectedGallery.images?.length === 0 && (
                                        <div className="col-span-2 rounded-xl border border-dashed p-6 text-center text-sm font-semibold text-slate-500">
                                            Belum ada foto di album ini.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid min-h-96 place-items-center text-center">
                                <div>
                                    <ImageIcon className="mx-auto mb-3 size-12 text-slate-300" />
                                    <p className="text-sm font-semibold text-slate-500">Pilih album untuk mengelola foto.</p>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
}
