/**
 * Auth Service - Bridges custom JWT auth with axios interceptors
 *
 * Reads the token from the Zustand auth store (backed by SecureStore).
 * No more Clerk dependency.
 */
import { getToken } from '@/lib/auth';

class AuthService {
  /** Get the current JWT from the auth store */
  async getToken(): Promise<string | null> {
    return getToken();
  }
}

export const authService = new AuthService();
