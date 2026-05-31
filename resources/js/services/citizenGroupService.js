import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getCitizenGroups = async () => unwrap(await api.get('/api/v1/citizen-groups'));

const getCitizenGroup = async (groupId) => unwrap(await api.get(`/api/v1/citizen-groups/${groupId}`));

const createCitizenGroup = async (payload) => unwrap(await api.post('/api/v1/citizen-groups', payload));

const updateCitizenGroup = async (groupId, payload) => unwrap(await api.patch(`/api/v1/citizen-groups/${groupId}`, payload));

const deleteCitizenGroup = async (groupId) => unwrap(await api.delete(`/api/v1/citizen-groups/${groupId}`));

export const citizenGroupService = {
    getCitizenGroups,
    getCitizenGroup,
    createCitizenGroup,
    updateCitizenGroup,
    deleteCitizenGroup,
};
