import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { iuranCategoryService } from '@/services/iuranCategoryService';
import { getErrorMessage } from '@/lib/error-message';

export const iuranCategoryKeys = {
    all: ['iuran-categories'],
};

export const useIuranCategories = () => {
    return useQuery({
        queryKey: iuranCategoryKeys.all,
        queryFn: iuranCategoryService.getCategories,
    });
};

export const useCreateIuranCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: iuranCategoryService.createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: iuranCategoryKeys.all });
            queryClient.invalidateQueries({ queryKey: ['iuran'] });
            toast.success('Kategori iuran berhasil dibuat.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal membuat kategori iuran.'));
        },
    });
};

export const useUpdateIuranCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ categoryId, payload }) => iuranCategoryService.updateCategory(categoryId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: iuranCategoryKeys.all });
            queryClient.invalidateQueries({ queryKey: ['iuran'] });
            toast.success('Kategori iuran berhasil diperbarui.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal memperbarui kategori iuran.'));
        },
    });
};

export const useDeleteIuranCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ categoryId }) => iuranCategoryService.deleteCategory(categoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: iuranCategoryKeys.all });
            queryClient.invalidateQueries({ queryKey: ['iuran'] });
            toast.success('Kategori iuran berhasil dihapus.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menghapus kategori iuran.'));
        },
    });
};
