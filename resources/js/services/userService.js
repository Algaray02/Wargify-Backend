import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getUsers = async () => unwrap(await api.get('/api/v1/users'));

const getUser = async (userId) => unwrap(await api.get(`/api/v1/users/${userId}`));

const createUser = async (payload) => unwrap(await api.post('/api/v1/users', payload));

const updateUser = async (userId, payload) => unwrap(await api.patch(`/api/v1/users/${userId}`, payload));

const deleteUser = async (userId) => unwrap(await api.delete(`/api/v1/users/${userId}`));

export const userService = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
};
