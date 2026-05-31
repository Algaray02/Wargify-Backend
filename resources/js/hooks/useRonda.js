import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rondaService } from '@/services/rondaService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const rondaKeys = {
    schedules: ['ronda', 'schedules'],
    groups: ['ronda', 'groups'],
    checkpoints: ['ronda', 'checkpoints'],
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

export const useRondaCheckpoints = () => {
    return useQuery({
        queryKey: rondaKeys.checkpoints,
        queryFn: rondaService.getCheckpoints,
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

export const useUpdateRondaGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }) => rondaService.updateGroup(groupId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rondaKeys.groups });
            queryClient.invalidateQueries({ queryKey: rondaKeys.schedules });
            toast.success('Kelompok ronda berhasil diperbarui.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal memperbarui kelompok ronda.'));
        },
    });
};

export const useCreateRondaSchedule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rondaService.createSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rondaKeys.schedules });
            toast.success('Jadwal ronda berhasil ditambahkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menambah jadwal ronda.'));
        },
    });
};

export const useUpdateRondaSchedule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ scheduleId, payload }) => rondaService.updateSchedule(scheduleId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rondaKeys.schedules });
            toast.success('Jadwal ronda berhasil diperbarui.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal memperbarui jadwal ronda.'));
        },
    });
};

export const useCreateRondaCheckpoint = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rondaService.createCheckpoint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rondaKeys.checkpoints });
            toast.success('Checkpoint ronda berhasil ditambahkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menambah checkpoint ronda.'));
        },
    });
};

export const useCreatePatrolCheckpointLog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ scheduleId, payload }) => rondaService.createCheckpointLog(scheduleId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rondaKeys.schedules });
            toast.success('Scan checkpoint berhasil dicatat.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal mencatat scan checkpoint.'));
        },
    });
};

export const useCreateRondaLog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ scheduleId, payload }) => rondaService.createRondaLog(scheduleId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rondaKeys.schedules });
            toast.success('Log rute ronda berhasil disimpan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menyimpan log rute ronda.'));
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
