import { useQuery } from '@tanstack/react-query';
import { familyService } from '@/services/familyService';

export const familyKeys = {
    all: ['families'],
    detail: (familyId) => ['families', familyId],
};

export const useFamilies = () => {
    return useQuery({
        queryKey: familyKeys.all,
        queryFn: familyService.getFamilies,
    });
};

export const useFamily = (familyId) => {
    return useQuery({
        queryKey: familyKeys.detail(familyId),
        queryFn: () => familyService.getFamily(familyId),
        enabled: Boolean(familyId),
    });
};
