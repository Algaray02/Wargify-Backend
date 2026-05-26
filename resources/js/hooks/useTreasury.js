import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { treasuryService } from '@/services/treasuryService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const treasuryKeys = {
    logs: (type = 'ALL') => ['treasury', 'logs', type],
    summary: ['treasury', 'summary'],
};

export const useTreasuryLogs = (type = 'ALL') => {
    return useQuery({
        queryKey: treasuryKeys.logs(type),
        queryFn: () => treasuryService.getLogs(type),
    });
};

export const useTreasurySummary = () => {
    return useQuery({
        queryKey: treasuryKeys.summary,
        queryFn: treasuryService.getSummary,
    });
};

export const useCreateTreasuryLog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: treasuryService.createLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['treasury'] });
            toast.success('Catatan kas berhasil ditambahkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menambah catatan kas.'));
        },
    });
};
