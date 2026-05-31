import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getReports = async () => unwrap(await api.get('/api/v1/facility-reports'));

const updateReportStatus = async (reportId, payload) => unwrap(await api.patch(`/api/v1/facility-reports/${reportId}/status`, payload));

const toReportFormData = (payload) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
        }
    });

    return formData;
};

const respondReport = async (reportId, payload) => {
    const formData = toReportFormData(payload);
    formData.append('_method', 'PATCH');

    return unwrap(await api.post(`/api/v1/facility-reports/${reportId}/response`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }));
};

export const facilityReportService = {
    getReports,
    updateReportStatus,
    respondReport,
};
