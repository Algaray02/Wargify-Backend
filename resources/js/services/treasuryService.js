import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getLogs = async (type) => {
    const params = type && type !== 'ALL' ? { type } : {};
    return unwrap(await api.get('/api/v1/treasury-logs', { params }));
};

const getSummary = async () => unwrap(await api.get('/api/v1/treasury-summary'));

const toLogFormData = (payload) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
        }
    });

    return formData;
};

const createLog = async (payload) => unwrap(await api.post('/api/v1/treasury-logs', toLogFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
}));

const updateLog = async (logId, payload) => {
    const formData = toLogFormData(payload);
    formData.append('_method', 'PATCH');

    return unwrap(await api.post(`/api/v1/treasury-logs/${logId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }));
};

const deleteLog = async (logId) => unwrap(await api.delete(`/api/v1/treasury-logs/${logId}`));

export const treasuryService = {
    getLogs,
    getSummary,
    createLog,
    updateLog,
    deleteLog,
};
