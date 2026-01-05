import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { authService } from '@/service/auth-service';


const BASE_URL = 'https://hiringbull-api.scale8ai.com/';


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
    // Get token from auth service
    const token = await authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors
client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // You might want to trigger a logout or token refresh here
      console.log('Authentication failed');
    }
    return Promise.reject(error);
  }
);
