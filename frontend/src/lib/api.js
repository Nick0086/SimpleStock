import axios from 'axios';
import { queryClient } from './react-query';

// Use the environment variable from your .env file
const BASE_URL = import.meta.env.VITE_BASE_URL_LOCAL || 'http://192.168.1.9:5000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await api.post('/v1/auth/refresh');
        const { accessToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);

        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear all auth state and redirect to login
        localStorage.removeItem('accessToken');
        queryClient.clear();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API error handler
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with a status code outside the 2xx range
    return error.response.data.message || 'Server error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error - no response received';
  } else {
    // Something happened in setting up the request
    return 'Request failed - please try again';
  }
};

// API response handler
export const handleApiResponse = (response) => {
  return response.data;
}; 