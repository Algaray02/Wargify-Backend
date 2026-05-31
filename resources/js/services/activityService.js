import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getActivities = async () => unwrap(await api.get('/api/v1/activities'));

const getActivity = async (activityId) => unwrap(await api.get(`/api/v1/activities/${activityId}`));

const createActivity = async (payload) => unwrap(await api.post('/api/v1/activities', payload));

const updateActivity = async (activityId, payload) => unwrap(await api.patch(`/api/v1/activities/${activityId}`, payload));

const deleteActivity = async (activityId) => unwrap(await api.delete(`/api/v1/activities/${activityId}`));

const announceActivity = async (activityId) => unwrap(await api.post(`/api/v1/activities/${activityId}/announce`));

const completeActivity = async (activityId) => unwrap(await api.post(`/api/v1/activities/${activityId}/complete`));

const getParticipants = async (activityId) => unwrap(await api.get(`/api/v1/activities/${activityId}/participants`));

export const activityService = {
    getActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    announceActivity,
    completeActivity,
    getParticipants,
};
