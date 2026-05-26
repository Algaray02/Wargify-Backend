import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getLogs = async (type) => {
    const params = type && type !== 'ALL' ? { type } : {};
    return unwrap(await api.get('/api/v1/treasury-logs', { params }));
};

const getSummary = async () => unwrap(await api.get('/api/v1/treasury-summary'));

const createLog = async (payload) => unwrap(await api.post('/api/v1/treasury-logs', payload));

const updateLog = async (logId, payload) => unwrap(await api.patch(`/api/v1/treasury-logs/${logId}`, payload));

const deleteLog = async (logId) => unwrap(await api.delete(`/api/v1/treasury-logs/${logId}`));

export const treasuryService = {
    getLogs,
    getSummary,
    createLog,
    updateLog,
    deleteLog,
};
