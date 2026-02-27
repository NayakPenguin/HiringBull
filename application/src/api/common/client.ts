import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { Env } from '@env';
import { authService } from '@/service/auth-service';

const TAG = '[API]';

// API URL from environment variables
// Production: https://api.hiringbull.org
// For local dev, set EXPO_PUBLIC_API_URL in your .env.development file
// const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.hiringbull.org';
  const BASE_URL="http://10.240.46.168:4000"

console.log(`${TAG} Base URL: ${BASE_URL}`);

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
    console.log(`${TAG} → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, token ? '(auth)' : '(no-auth)');
    return config;
  },
  (error) => {
    console.error(`${TAG} Request error:`, error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors
client.interceptors.response.use(
  (response) => {
    console.log(`${TAG} ← ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const data = error.response?.data;
    console.error(`${TAG} ← ${status ?? 'NETWORK'} ${error.config?.method?.toUpperCase()} ${url}`, data ?? error.message);
    // TODO: Handle 401 — trigger logout or token refresh
    return Promise.reject(error);
  }
);
