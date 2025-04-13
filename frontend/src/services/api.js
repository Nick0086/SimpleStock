import axios from 'axios';
import { toast } from 'sonner';

const TOKEN_KEY = 'simpleStock_token';

/**
 * Base API client configuration
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error('Network error occurred. Please check your connection.');
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't attempt token refresh for login or refresh token requests
    if (originalRequest.url.includes('/auth/login') || 
        originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data;
        
        localStorage.setItem(TOKEN_KEY, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        toast.error('Your session has expired. Please login again.');
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error occurred. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle specific error status codes
    switch (error.response.status) {
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('The requested resource was not found.');
        break;
      case 500:
        toast.error('Server error occurred. Please try again later.');
        break;
      default:
        // Show error toast for user feedback
        const errorMessage = error.response?.data?.message || 'An error occurred';
        toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api; 