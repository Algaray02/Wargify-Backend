import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-message';

export const useAuth = () => {
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const response = await authService.login(credentials);
            return response.data;
        },
        onSuccess: (data) => {
            const userRole = data?.data?.user?.role;
            
            if (userRole !== 'SUPERADMIN') {
                toast.error('Akses ditolak. Hanya Superadmin yang dapat login.');
                return;
            }

            const token = data?.token || data?.data?.token;
            if (token) {
                localStorage.setItem('auth_token', token);
            }
            toast.success('Login berhasil.');
            router.visit('/');
        },
        onError: (error) => {
            console.error('Login error:', error);
            toast.error(getErrorMessage(error, 'Login gagal. Periksa kembali username dan password.'));
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
