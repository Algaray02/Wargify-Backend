import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { householdService } from '@/services/householdService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const householdKeys = {
    all: ['households'],
    detail: (householdId) => ['households', householdId],
};

export const useHouseholds = () => {
    return useQuery({
        queryKey: householdKeys.all,
        queryFn: householdService.getHouseholds,
    });
};

export const useHousehold = (householdId) => {
    return useQuery({
        queryKey: householdKeys.detail(householdId),
        queryFn: () => householdService.getHousehold(householdId),
        enabled: Boolean(householdId),
    });
};

export const useCreateHousehold = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: householdService.createHousehold,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: householdKeys.all });
            toast.success('Data rumah berhasil ditambahkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menambah data rumah.'));
        },
    });
};

export const useUpdateHousehold = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ householdId, payload }) => householdService.updateHousehold(householdId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: householdKeys.all });
            queryClient.invalidateQueries({ queryKey: householdKeys.detail(variables.householdId) });
            toast.success('Data rumah berhasil disimpan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menyimpan data rumah.'));
        },
    });
};

export const useDeleteHousehold = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: householdService.deleteHousehold,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: householdKeys.all });
            toast.success('Data rumah berhasil dihapus.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menghapus data rumah.'));
        },
    });
};
