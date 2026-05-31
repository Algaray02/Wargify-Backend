import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { facilityReportService } from '@/services/facilityReportService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const facilityReportKeys = {
    all: ['facility-reports'],
};

export const useFacilityReports = () => {
    return useQuery({
        queryKey: facilityReportKeys.all,
        queryFn: facilityReportService.getReports,
    });
};

export const useUpdateFacilityReportStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reportId, payload }) => facilityReportService.updateReportStatus(reportId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: facilityReportKeys.all });
            toast.success('Status laporan berhasil diperbarui.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal memperbarui status laporan.'));
        },
    });
};

export const useRespondFacilityReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reportId, payload }) => facilityReportService.respondReport(reportId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: facilityReportKeys.all });
            toast.success('Tanggapan laporan berhasil dikirim.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal mengirim tanggapan laporan.'));
        },
    });
};
