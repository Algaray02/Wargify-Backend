import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { iuranService } from '@/services/iuranService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const iuranKeys = {
    periods: ['iuran', 'periods'],
    payments: (periodId) => ['iuran', 'periods', periodId, 'payments'],
};

export const useIuranPeriods = () => {
    return useQuery({
        queryKey: iuranKeys.periods,
        queryFn: iuranService.getPeriods,
    });
};

export const useIuranPeriodPayments = (periodId) => {
    return useQuery({
        queryKey: iuranKeys.payments(periodId),
        queryFn: () => iuranService.getPeriodPayments(periodId),
        enabled: Boolean(periodId),
    });
};

export const useCreateIuranPeriod = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: iuranService.createPeriod,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: iuranKeys.periods });
            toast.success('Periode iuran berhasil ditambahkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menambah periode iuran.'));
        },
    });
};

export const useUpdateIuranPeriod = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ periodId, payload }) => iuranService.updatePeriod(periodId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: iuranKeys.periods });
            if (variables?.periodId) {
                queryClient.invalidateQueries({ queryKey: iuranKeys.payments(variables.periodId) });
            }
            toast.success('Periode iuran berhasil diperbarui.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal memperbarui periode iuran.'));
        },
    });
};

export const useDeleteIuranPeriod = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ periodId }) => iuranService.deletePeriod(periodId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: iuranKeys.periods });
            toast.success('Periode iuran berhasil dihapus.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menghapus periode iuran.'));
        },
    });
};

export const useCreateIuranPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: iuranService.createPayment,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: iuranKeys.periods });
            if (variables?.period_id) {
                queryClient.invalidateQueries({ queryKey: iuranKeys.payments(variables.period_id) });
            }
            toast.success('Pembayaran iuran berhasil dicatat.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal mencatat pembayaran iuran.'));
        },
    });
};

export const useUpdateIuranPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ paymentId, payload, periodId }) => iuranService.updatePayment(paymentId, payload, periodId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: iuranKeys.periods });
            if (variables?.periodId) {
                queryClient.invalidateQueries({ queryKey: iuranKeys.payments(variables.periodId) });
            }
            toast.success('Pembayaran iuran berhasil diperbarui.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal memperbarui pembayaran iuran.'));
        },
    });
};

export const useDeleteIuranPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ paymentId }) => iuranService.deletePayment(paymentId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: iuranKeys.periods });
            if (variables?.periodId) {
                queryClient.invalidateQueries({ queryKey: iuranKeys.payments(variables.periodId) });
            }
            toast.success('Pembayaran iuran berhasil dibatalkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal membatalkan pembayaran iuran.'));
        },
    });
};
