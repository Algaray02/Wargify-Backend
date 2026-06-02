import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getAnnouncements = async () => unwrap(await api.get('/api/v1/announcements'));

const isFormData = (payload) => typeof FormData !== 'undefined' && payload instanceof FormData;

const createAnnouncement = async (payload) => {
    if (isFormData(payload)) {
        return unwrap(await api.post('/api/v1/announcements', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }));
    }

    return unwrap(await api.post('/api/v1/announcements', payload));
};

const updateAnnouncement = async ({ announcementId, payload }) => {
    if (isFormData(payload)) {
        payload.append('_method', 'PATCH');

        return unwrap(await api.post(`/api/v1/announcements/${announcementId}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }));
    }

    return unwrap(await api.patch(`/api/v1/announcements/${announcementId}`, payload));
};

const deleteAnnouncement = async (announcementId) => unwrap(await api.delete(`/api/v1/announcements/${announcementId}`));

const publishAnnouncement = async (announcementId) => unwrap(await api.post(`/api/v1/announcements/${announcementId}/publish`));

export const announcementService = {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
};
