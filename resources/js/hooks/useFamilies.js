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

export const useUpdateFamily = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ familyId, payload }) => familyService.updateFamily(familyId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: familyKeys.all });
            queryClient.invalidateQueries({ queryKey: familyKeys.detail(variables.familyId) });
            toast.success('Data keluarga berhasil disimpan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menyimpan keluarga.'));
        },
    });
};

export const useAddFamilyMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ familyId, userId }) => familyService.addMember(familyId, userId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: familyKeys.all });
            queryClient.invalidateQueries({ queryKey: familyKeys.detail(variables.familyId) });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Anggota berhasil ditambahkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menambah anggota.'));
        },
    });
};

export const useRemoveFamilyMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ familyId, userId }) => familyService.removeMember(familyId, userId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: familyKeys.all });
            queryClient.invalidateQueries({ queryKey: familyKeys.detail(variables.familyId) });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Anggota berhasil dilepas dari keluarga.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal melepas anggota.'));
        },
    });
};

export const useSetHeadOfFamily = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ familyId, userId }) => familyService.setHeadOfFamily(familyId, userId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: familyKeys.all });
            queryClient.invalidateQueries({ queryKey: familyKeys.detail(variables.familyId) });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Kepala keluarga berhasil diperbarui.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal memperbarui kepala keluarga.'));
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
