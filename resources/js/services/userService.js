import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const hasProfilePicture = (payload) => payload?.profile_picture instanceof File;

const toUserFormData = (payload) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined) {
            return;
        }

        formData.append(key, value === null ? '' : value);
    });

    return formData;
};

const getUsers = async () => unwrap(await api.get('/api/v1/users'));

const getUser = async (userId) => unwrap(await api.get(`/api/v1/users/${userId}`));

const createUser = async (payload) => {
    if (hasProfilePicture(payload)) {
        return unwrap(await api.post('/api/v1/users', toUserFormData(payload), {
            headers: { 'Content-Type': 'multipart/form-data' },
        }));
    }

    return unwrap(await api.post('/api/v1/users', payload));
};

const updateUser = async (userId, payload) => {
    if (hasProfilePicture(payload)) {
        const formData = toUserFormData(payload);
        formData.append('_method', 'PATCH');

        return unwrap(await api.post(`/api/v1/users/${userId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }));
    }

    return unwrap(await api.patch(`/api/v1/users/${userId}`, payload));
};

const deleteUser = async (userId) => unwrap(await api.delete(`/api/v1/users/${userId}`));

export const userService = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
};
