import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getSchedules = async () => unwrap(await api.get('/api/v1/ronda/schedules'));

const getGroups = async () => unwrap(await api.get('/api/v1/ronda/groups'));

const createGroup = async (payload) => unwrap(await api.post('/api/v1/ronda/groups', payload));

const submitAttendance = async (payload) => unwrap(await api.post('/api/v1/ronda/attendance', payload));

export const rondaService = {
    getSchedules,
    getGroups,
    createGroup,
    submitAttendance,
};
