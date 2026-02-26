import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { Env } from '@env';
import { authService } from '@/service/auth-service';


// API URL from environment variables
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.240.46.168:4000';

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
