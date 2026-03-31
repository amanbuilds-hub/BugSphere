import apiClient from './apiClient';

/**
 * Notifications API
 */
export const getNotifications = async (params) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
};
