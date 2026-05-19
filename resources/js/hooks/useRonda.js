import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rondaService } from '@/services/rondaService';

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
        },
    });
};
