import api from '@/lib/api';

const login = async (credentials) => {
    return api.post('/api/v1/login', credentials);
};

const logout = async () => {
    return api.post('/api/v1/logout');
};

export const authService = {
    login,
    logout,
};
