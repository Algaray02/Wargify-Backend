import api from '@/lib/api';

const unwrap = (response) => response.data?.data ?? response.data;

const getGalleries = async () => unwrap(await api.get('/api/v1/galleries'));

const getGallery = async (galleryId) => unwrap(await api.get(`/api/v1/galleries/${galleryId}`));

const createGallery = async (payload) => unwrap(await api.post('/api/v1/galleries', payload));

const updateGallery = async (galleryId, payload) => unwrap(await api.patch(`/api/v1/galleries/${galleryId}`, payload));

const deleteGallery = async (galleryId) => unwrap(await api.delete(`/api/v1/galleries/${galleryId}`));

const uploadImages = async (galleryId, images) => {
    const formData = new FormData();

    images.forEach((image) => {
        formData.append('images[]', image);
    });

    return unwrap(await api.post(`/api/v1/galleries/${galleryId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }));
};

const deleteImage = async (imageId) => unwrap(await api.delete(`/api/v1/gallery-images/${imageId}`));

export const galleryService = {
    createGallery,
    deleteGallery,
    deleteImage,
    getGalleries,
    getGallery,
    updateGallery,
    uploadImages,
};
