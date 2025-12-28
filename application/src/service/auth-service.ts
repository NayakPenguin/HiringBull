/**
 * Auth Service - Bridges Clerk authentication with axios interceptors
 *
 * This service acts as a bridge between Clerk's authentication system and axios HTTP clients.
 * It stores a reference to Clerk's getToken function and provides it to axios interceptors.
 *
 * Flow:
 * 1. React component calls setGetTokenFunction() with Clerk's getToken
 * 2. Axios interceptor calls getToken() to retrieve current JWT
 * 3. Token is injected into Authorization header
 */
class AuthService {
  private getTokenFn: (() => Promise<string | null>) | null = null;

  /**
   * Set the function that retrieves the authentication token
   * Called from React component with Clerk's getToken function
   */
  setGetTokenFunction(getTokenFn: () => Promise<string | null>) {
    this.getTokenFn = getTokenFn;
    console.log('Auth service initialized with Clerk token function');
  }

  /**
   * Get the current authentication token
   * Called from axios interceptors
   */
  async getToken(): Promise<string | null> {
    if (!this.getTokenFn) {
      console.warn('Auth service: No getToken function set');
      return null;
    }
    return await this.getTokenFn();
  }

  /**
   * Clear authentication state
   * Called on sign out
   */
  clearAuth() {
    this.getTokenFn = null;
    console.log('Auth service cleared');
  }
}

// Export singleton instance
export const authService = new AuthService();
