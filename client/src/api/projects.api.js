import apiClient from './apiClient';

/**
 * Projects API
 */
export const getProjects = async () => {
    const response = await apiClient.get('/projects');
    return response.data;
};

export const getProject = async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
};

export const createProject = async (data) => {
    const response = await apiClient.post('/projects', data);
    return response.data;
};

export const addMember = async (id, data) => {
    const response = await apiClient.post(`/projects/${id}/members`, data);
    return response.data;
};

export const removeMember = async (id, uid) => {
    const response = await apiClient.delete(`/projects/${id}/members/${uid}`);
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
};
