import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '@/services/announcementService';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const announcementKeys = {
    all: ['announcements'],
};

export const useAnnouncements = () => {
    return useQuery({
        queryKey: announcementKeys.all,
        queryFn: announcementService.getAnnouncements,
    });
};

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: announcementService.createAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: announcementKeys.all });
            toast.success('Pengumuman berhasil disimpan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menyimpan pengumuman.'));
        },
    });
};

export const usePublishAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: announcementService.publishAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: announcementKeys.all });
            toast.success('Pengumuman berhasil diterbitkan.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Gagal menerbitkan pengumuman.'));
        },
    });
};
