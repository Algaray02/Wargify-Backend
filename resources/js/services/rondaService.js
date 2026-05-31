import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getSchedules = async () => unwrap(await api.get('/api/v1/ronda/schedules'));

const getGroups = async () => unwrap(await api.get('/api/v1/ronda/groups'));

const getCheckpoints = async () => unwrap(await api.get('/api/v1/ronda/checkpoints'));

const createGroup = async (payload) => unwrap(await api.post('/api/v1/ronda/groups', payload));

const updateGroup = async (groupId, payload) => unwrap(await api.patch(`/api/v1/ronda/groups/${groupId}`, payload));

const createSchedule = async (payload) => unwrap(await api.post('/api/v1/ronda/schedules', payload));

const updateSchedule = async (scheduleId, payload) => unwrap(await api.patch(`/api/v1/ronda/schedules/${scheduleId}`, payload));

const createCheckpointLog = async (scheduleId, payload) => unwrap(await api.post(`/api/v1/ronda/schedules/${scheduleId}/checkpoint-logs`, payload));

const createRondaLog = async (scheduleId, payload) => unwrap(await api.post(`/api/v1/ronda/schedules/${scheduleId}/logs`, payload));

const createCheckpoint = async (payload) => unwrap(await api.post('/api/v1/ronda/checkpoints', payload));

const submitAttendance = async (payload) => unwrap(await api.post('/api/v1/ronda/attendance', payload));

export const rondaService = {
    getSchedules,
    getGroups,
    getCheckpoints,
    createGroup,
    updateGroup,
    createSchedule,
    updateSchedule,
    createCheckpointLog,
    createRondaLog,
    createCheckpoint,
    submitAttendance,
};
