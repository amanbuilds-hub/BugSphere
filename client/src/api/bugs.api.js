import apiClient from './apiClient';

/**
 * Bug API
 */
export const getBugs = async (params) => {
    const response = await apiClient.get('/bugs', { params });
    return response.data;
};

export const getBug = async (id) => {
    const response = await apiClient.get(`/bugs/${id}`);
    return response.data;
};

export const createBug = async (data) => {
    const response = await apiClient.post('/bugs', data);
    return response.data;
};

export const updateBugStatus = async (id, data) => {
    const response = await apiClient.patch(`/bugs/${id}/status`, data);
    return response.data;
};

export const assignBug = async (id, data) => {
    const response = await apiClient.patch(`/bugs/${id}/assign`, data);
    return response.data;
};

export const addComment = async (id, data) => {
    const response = await apiClient.post(`/bugs/${id}/comments`, data);
    return response.data;
};

export const getRecommendations = async (id) => {
    const response = await apiClient.get(`/bugs/${id}/recommend`);
    return response.data;
};

export const getResolutionSuggestion = async (id) => {
    const response = await apiClient.get(`/bugs/${id}/suggest`);
    return response.data;
};

export const exportBugs = async (format, ids) => {
    const response = await apiClient.get(`/bugs/export/${format}`, {
        params: { ids },
        responseType: 'blob'
    });
    return response.data;
};
