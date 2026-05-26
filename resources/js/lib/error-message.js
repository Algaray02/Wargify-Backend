export const getErrorMessage = (error, fallback = 'Terjadi kesalahan. Silakan coba lagi.') => {
    const errors = error?.response?.data?.errors;
    const firstField = errors ? Object.keys(errors)[0] : null;
    const firstValidationMessage = firstField ? errors[firstField]?.[0] : null;

    return firstValidationMessage
        || error?.response?.data?.message
        || error?.message
        || fallback;
};
