import apiClient from './apiClient';

/**
 * Authentication API
 */
export const logIn = async (data) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
};

export const registerUser = async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
};

export const logOut = async (data) => {
    const response = await apiClient.post('/auth/logout', data);
    return response.data;
};

export const setup2FA = async () => {
    const response = await apiClient.post('/auth/2fa/setup');
    return response.data;
};

export const verify2FA = async (data) => {
    const response = await apiClient.post('/auth/2fa/verify', data);
    return response.data;
};
