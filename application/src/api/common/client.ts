import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { Env } from '@env';
import { authService } from '@/service/auth-service';


// API URL from environment variables
// Production: https://api.hiringbull.org
// For local dev, set EXPO_PUBLIC_API_URL in your .env.development file
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.hiringbull.org';

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds JWT auth token
client.interceptors.request.use(
  async (config) => {
    const token = await authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles errors
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // TODO: Handle 401 — trigger logout or token refresh
    return Promise.reject(error);
  }
);
