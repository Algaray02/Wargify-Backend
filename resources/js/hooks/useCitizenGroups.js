import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { citizenGroupService } from '@/services/citizenGroupService';
import { getErrorMessage } from '@/lib/error-message';

export const citizenGroupKeys = {
    all: ['citizen-groups'],
    detail: (groupId) => ['citizen-groups', groupId],
};

export const useCitizenGroups = () => {
    return useQuery({
        queryKey: citizenGroupKeys.all,
        queryFn: citizenGroupService.getCitizenGroups,
    });
};

export const useCitizenGroup = (groupId) => {
    return useQuery({
        queryKey: citizenGroupKeys.detail(groupId),
        queryFn: () => citizenGroupService.getCitizenGroup(groupId),
        enabled: Boolean(groupId),
    });
};

export const useCreateCitizenGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: citizenGroupService.createCitizenGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: citizenGroupKeys.all });
            toast.success('Kelompok warga berhasil dibuat.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal membuat kelompok warga.'));
        },
    });
};

export const useUpdateCitizenGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }) => citizenGroupService.updateCitizenGroup(groupId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: citizenGroupKeys.all });
            queryClient.invalidateQueries({ queryKey: citizenGroupKeys.detail(variables.groupId) });
            toast.success('Kelompok warga berhasil diperbarui.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal memperbarui kelompok warga.'));
        },
    });
};

export const useDeleteCitizenGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: citizenGroupService.deleteCitizenGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: citizenGroupKeys.all });
            toast.success('Kelompok warga berhasil dihapus.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menghapus kelompok warga.'));
        },
    });
};
