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

export const getProfile = async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
}

export const updateProfile = async (data) => {
    const response = await apiClient.patch('/auth/profile', data);
    return response.data;
}
export const getUsers = async (search = '') => {
    const response = await apiClient.get(`/auth/users?search=${search}`);
    return response.data;
};
