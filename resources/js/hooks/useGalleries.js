import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { galleryService } from '@/services/galleryService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const galleryKeys = {
    all: ['galleries'],
    detail: (galleryId) => ['galleries', galleryId],
};

export const useGalleries = () => {
    return useQuery({
        queryKey: galleryKeys.all,
        queryFn: galleryService.getGalleries,
    });
};

export const useCreateGallery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: galleryService.createGallery,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.all });
            toast.success('Album galeri berhasil dibuat.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal membuat album galeri.'));
        },
    });
};

export const useUpdateGallery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ galleryId, payload }) => galleryService.updateGallery(galleryId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.all });
            queryClient.invalidateQueries({ queryKey: galleryKeys.detail(variables.galleryId) });
            toast.success('Album galeri berhasil diperbarui.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal memperbarui album galeri.'));
        },
    });
};

export const useDeleteGallery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: galleryService.deleteGallery,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.all });
            toast.success('Album galeri berhasil dihapus.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menghapus album galeri.'));
        },
    });
};

export const useUploadGalleryImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ galleryId, images }) => galleryService.uploadImages(galleryId, images),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.all });
            queryClient.invalidateQueries({ queryKey: galleryKeys.detail(variables.galleryId) });
            toast.success('Foto galeri berhasil diunggah.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal mengunggah foto galeri.'));
        },
    });
};

export const useDeleteGalleryImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: galleryService.deleteImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: galleryKeys.all });
            toast.success('Foto berhasil dihapus.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menghapus foto.'));
        },
    });
};
