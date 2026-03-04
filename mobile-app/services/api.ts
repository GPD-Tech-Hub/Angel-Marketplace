import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '@/constants/config';
import { ENDPOINTS } from '@/constants/endpoints';
import { secureStorage, STORAGE_KEYS } from '@/utils/storage';
import { useAuthStore } from '@/store/authStore';

// Create axios instance
export const api = axios.create({
  baseURL: config.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${config.API_URL}${ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Save new tokens
        await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
