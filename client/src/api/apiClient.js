import axios from 'axios';

/**
 * Axios instance for all API calls
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Request Interceptor - Add access token
 */
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

/**
 * Response Interceptor - Handle 401 Unauthorized
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 and avoid infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
                        refreshToken
                    }, { withCredentials: true });

                    if (response.data.success) {
                        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                        localStorage.setItem('accessToken', accessToken);
                        localStorage.setItem('refreshToken', newRefreshToken);

                        // Re-call original request with new token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return apiClient(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Clear auth and logout if refresh fails
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error.response?.data || error);
    }
);

export default apiClient;
