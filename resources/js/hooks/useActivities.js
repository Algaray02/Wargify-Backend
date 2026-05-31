import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activityService } from '@/services/activityService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const activityKeys = {
    all: ['activities'],
    detail: (activityId) => ['activities', activityId],
};

export const useActivities = () => {
    return useQuery({
        queryKey: activityKeys.all,
        queryFn: activityService.getActivities,
    });
};

export const useActivity = (activityId) => {
    return useQuery({
        queryKey: activityKeys.detail(activityId),
        queryFn: () => activityService.getActivity(activityId),
        enabled: Boolean(activityId),
    });
};

export const useCreateActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: activityService.createActivity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            toast.success('Kegiatan berhasil dibuat.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal membuat kegiatan.'));
        },
    });
};

export const useUpdateActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ activityId, payload }) => activityService.updateActivity(activityId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            queryClient.invalidateQueries({ queryKey: activityKeys.detail(variables.activityId) });
            toast.success('Kegiatan berhasil diperbarui.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal memperbarui kegiatan.'));
        },
    });
};

export const useDeleteActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: activityService.deleteActivity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            toast.success('Kegiatan berhasil dihapus.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menghapus kegiatan.'));
        },
    });
};

export const useAnnounceActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: activityService.announceActivity,
        onSuccess: (_data, activityId) => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            queryClient.invalidateQueries({ queryKey: activityKeys.detail(activityId) });
            toast.success('Kegiatan berhasil diumumkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal mengumumkan kegiatan.'));
        },
    });
};

export const useCompleteActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: activityService.completeActivity,
        onSuccess: (_data, activityId) => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            queryClient.invalidateQueries({ queryKey: activityKeys.detail(activityId) });
            toast.success('Kegiatan berhasil diselesaikan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menyelesaikan kegiatan.'));
        },
    });
};

export const useActivityParticipants = (activityId) => {
    return useQuery({
        queryKey: [...activityKeys.detail(activityId), 'participants'],
        queryFn: () => activityService.getParticipants(activityId),
        enabled: Boolean(activityId),
    });
};
