import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';

export const userKeys = {
    all: ['users'],
    detail: (userId) => ['users', userId],
};

export const useUsers = () => {
    return useQuery({
        queryKey: userKeys.all,
        queryFn: userService.getUsers,
    });
};

export const useUser = (userId) => {
    return useQuery({
        queryKey: userKeys.detail(userId),
        queryFn: () => userService.getUser(userId),
        enabled: Boolean(userId),
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userService.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, payload }) => userService.updateUser(userId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
        },
    });
};
