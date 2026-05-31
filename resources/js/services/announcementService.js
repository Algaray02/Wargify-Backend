import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getAnnouncements = async () => unwrap(await api.get('/api/v1/announcements'));

const createAnnouncement = async (payload) => unwrap(await api.post('/api/v1/announcements', payload));

const publishAnnouncement = async (announcementId) => unwrap(await api.post(`/api/v1/announcements/${announcementId}/publish`));

export const announcementService = {
    getAnnouncements,
    createAnnouncement,
    publishAnnouncement,
};
