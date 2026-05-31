import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getFamilies = async () => unwrap(await api.get('/api/v1/families'));

const getFamily = async (familyId) => unwrap(await api.get(`/api/v1/families/${familyId}`));

const createFamily = async (payload) => unwrap(await api.post('/api/v1/families', payload));

const updateFamily = async (familyId, payload) => unwrap(await api.patch(`/api/v1/families/${familyId}`, payload));

const deleteFamily = async (familyId) => unwrap(await api.delete(`/api/v1/families/${familyId}`));

const addMember = async (familyId, userId) => unwrap(await api.post(`/api/v1/families/${familyId}/members`, { user_id: userId }));

const removeMember = async (familyId, userId) => unwrap(await api.delete(`/api/v1/families/${familyId}/members/${userId}`));

const setHeadOfFamily = async (familyId, userId) => unwrap(await api.patch(`/api/v1/families/${familyId}/head`, { user_id: userId }));

export const familyService = {
    addMember,
    getFamilies,
    getFamily,
    createFamily,
    updateFamily,
    deleteFamily,
    removeMember,
    setHeadOfFamily,
};
