import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { router } from '@inertiajs/react';

export const useAuth = () => {
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const response = await authService.login(credentials);
            return response.data;
        },
        onSuccess: (data) => {
            const userRole = data?.data?.user?.role;
            
            if (userRole !== 'SUPERADMIN') {
                alert('Akses Ditolak: Hanya Superadmin yang dapat login.');
                return;
            }

            const token = data?.token || data?.data?.token;
            if (token) {
                localStorage.setItem('auth_token', token);
            }
            router.visit('/');
        },
        onError: (error) => {
            console.error('Login error:', error);
            alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    });

    const login = async (credentials) => {
        return loginMutation.mutateAsync(credentials);
    };

    return {
        login,
        isPending: loginMutation.isPending,
        error: loginMutation.error,
    };
};
