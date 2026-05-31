import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emergencyService } from '@/services/emergencyService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const emergencyKeys = {
    all: ['emergency-alerts'],
};

export const useEmergencyAlerts = () => {
    return useQuery({
        queryKey: emergencyKeys.all,
        queryFn: emergencyService.getAlerts,
        refetchInterval: 15000,
    });
};

export const useResolveEmergencyAlert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: emergencyService.resolveAlert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: emergencyKeys.all });
            toast.success('SOS berhasil ditandai aman.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menandai SOS aman.'));
        },
    });
};
