import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getHouseholds = async () => unwrap(await api.get('/api/v1/households'));

const getHousehold = async (householdId) => unwrap(await api.get(`/api/v1/households/${householdId}`));

const createHousehold = async (payload) => unwrap(await api.post('/api/v1/households', payload));

const updateHousehold = async (householdId, payload) => unwrap(await api.patch(`/api/v1/households/${householdId}`, payload));

const deleteHousehold = async (householdId) => unwrap(await api.delete(`/api/v1/households/${householdId}`));

export const householdService = {
    getHouseholds,
    getHousehold,
    createHousehold,
    updateHousehold,
    deleteHousehold,
};
