import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rondaService } from '@/services/rondaService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const rondaKeys = {
    schedules: ['ronda', 'schedules'],
    groups: ['ronda', 'groups'],
};

export const useRondaSchedules = () => {
    return useQuery({
        queryKey: rondaKeys.schedules,
        queryFn: rondaService.getSchedules,
    });
};

export const useRondaGroups = () => {
    return useQuery({
        queryKey: rondaKeys.groups,
        queryFn: rondaService.getGroups,
    });
};

export const useCreateRondaGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rondaService.createGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rondaKeys.groups });
            toast.success('Kelompok ronda berhasil ditambahkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menambah kelompok ronda.'));
        },
    });
};

export const useSubmitRondaAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rondaService.submitAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rondaKeys.schedules });
            toast.success('Presensi ronda berhasil disimpan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menyimpan presensi ronda.'));
        },
    });
};
