import api from '@/lib/api';

const login = async (credentials) => {
    return api.post('/api/v1/login', credentials);
};

export const authService = {
    login,
};
