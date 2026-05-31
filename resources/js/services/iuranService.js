import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getPeriods = async () => unwrap(await api.get('/api/v1/iuran-periods'));

const getPeriodPayments = async (periodId) => unwrap(await api.get(`/api/v1/iuran-periods/${periodId}/payments`));

const createPeriod = async (payload) => unwrap(await api.post('/api/v1/iuran-periods', payload));

const updatePeriod = async (periodId, payload) => unwrap(await api.patch(`/api/v1/iuran-periods/${periodId}`, payload));

const deletePeriod = async (periodId) => unwrap(await api.delete(`/api/v1/iuran-periods/${periodId}`));

const createPayment = async (payload) => unwrap(await api.post('/api/v1/iuran-payments', payload));

const updatePayment = async (paymentId, payload) => unwrap(await api.patch(`/api/v1/iuran-payments/${paymentId}`, payload));

const deletePayment = async (paymentId) => unwrap(await api.delete(`/api/v1/iuran-payments/${paymentId}`));

export const iuranService = {
    getPeriods,
    getPeriodPayments,
    createPeriod,
    updatePeriod,
    deletePeriod,
    createPayment,
    updatePayment,
    deletePayment,
};
