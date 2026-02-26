import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const TOKEN_KEY = 'auth_token';

type AuthState = {
  token: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;

  /** Hydrate from SecureStore on app launch */
  hydrate: () => Promise<void>;

  /** Save token after login and mark as signed in */
  signIn: (token: string) => Promise<void>;

  /** Clear token and mark as signed out */
  signOut: () => Promise<void>;
};

const _useAuth = create<AuthState>((set, get) => ({
  token: null,
  isLoaded: false,
  isSignedIn: false,

  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    set({
      token,
      isSignedIn: !!token,
      isLoaded: true,
    });
  },

  signIn: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, isSignedIn: true });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, isSignedIn: false });
  },
}));

/**
 * Hook: replaces `useAuth()` from `@clerk/clerk-expo`.
 *
 * Provides: `isSignedIn`, `isLoaded`, `signIn(token)`, `signOut()`
 */
export const useAuth = () => _useAuth();

/**
 * Get the current JWT token synchronously (for axios interceptors).
 */
export const getToken = () => _useAuth.getState().token;

/**
 * Decode the JWT payload (no verification — that's the server's job).
 */
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * Get the signed-in user's email from the JWT payload.
 */
export const getUserEmail = (): string | null => {
  const token = getToken();
  if (!token) return null;
  return (decodePayload(token)?.email as string) ?? null;
};

/**
 * Hydrate auth state from SecureStore — call once on app launch.
 */
export const hydrateAuth = () => _useAuth.getState().hydrate();
