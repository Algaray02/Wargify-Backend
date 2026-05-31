import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getAlerts = async () => unwrap(await api.get('/api/v1/emergency-alerts'));

const resolveAlert = async (alertId) => unwrap(await api.post(`/api/v1/emergency-alerts/${alertId}/resolve`));

export const emergencyService = {
    getAlerts,
    resolveAlert,
};
