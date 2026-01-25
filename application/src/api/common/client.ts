import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { Env } from '@env';
import { authService } from '@/service/auth-service';


// API URL from environment variables
// Defaults to production URL if not set
const BASE_URL = 'https://api.hiringbull.org/';

// Debug: Log the API URL on startup
console.log('🔗 API BASE_URL:', BASE_URL);

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds Clerk token
client.interceptors.request.use(
  async (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    // Get token from auth service
    const token = await authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Token attached to request');
    } else {
      console.log('📤 No token available for request');
    }
    return config;
  },
  (error) => {
    console.error('📤 Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors
client.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.error('📥 API Error:', error.response?.status, error.config?.url, error.message);
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // You might want to trigger a logout or token refresh here
      console.log('Authentication failed');
    }
    return Promise.reject(error);
  }
);
