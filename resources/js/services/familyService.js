import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getFamilies = async () => unwrap(await api.get('/api/v1/families'));

const getFamily = async (familyId) => unwrap(await api.get(`/api/v1/families/${familyId}`));

const createFamily = async (payload) => unwrap(await api.post('/api/v1/families', payload));

const deleteFamily = async (familyId) => unwrap(await api.delete(`/api/v1/families/${familyId}`));

export const familyService = {
    getFamilies,
    getFamily,
    createFamily,
    deleteFamily,
};
