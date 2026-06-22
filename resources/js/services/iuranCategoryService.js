import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getCategories = async () => unwrap(await api.get('/api/v1/iuran-categories'));

const createCategory = async (payload) => unwrap(await api.post('/api/v1/iuran-categories', payload));

const updateCategory = async (categoryId, payload) => unwrap(await api.patch(`/api/v1/iuran-categories/${categoryId}`, payload));

const deleteCategory = async (categoryId) => unwrap(await api.delete(`/api/v1/iuran-categories/${categoryId}`));

export const iuranCategoryService = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
