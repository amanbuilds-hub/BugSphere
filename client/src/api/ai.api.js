import apiClient from './apiClient';

/**
 * AI API
 */
export const chatWithAI = async (data) => {
    const response = await apiClient.post('/ai/chat', data);
    return response.data;
};
