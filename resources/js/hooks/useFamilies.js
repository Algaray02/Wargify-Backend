import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { familyService } from '@/services/familyService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const familyKeys = {
    all: ['families'],
    detail: (familyId) => ['families', familyId],
};

export const useFamilies = () => {
    return useQuery({
        queryKey: familyKeys.all,
        queryFn: familyService.getFamilies,
    });
};

export const useFamily = (familyId) => {
    return useQuery({
        queryKey: familyKeys.detail(familyId),
        queryFn: () => familyService.getFamily(familyId),
        enabled: Boolean(familyId),
    });
};

export const useCreateFamily = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: familyService.createFamily,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: familyKeys.all });
            toast.success('Keluarga berhasil ditambahkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menambah keluarga.'));
        },
    });
};

export const useDeleteFamily = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: familyService.deleteFamily,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: familyKeys.all });
            toast.success('Keluarga berhasil dihapus.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menghapus keluarga.'));
        },
    });
};
