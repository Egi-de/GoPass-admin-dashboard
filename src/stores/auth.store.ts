import { create } from 'zustand';
import { User, AuthTokens } from '@/types';
import { authApi } from '@/lib/api/auth';

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setTokens: (tokens) => set({ tokens }),

  login: async (email, password) => {
    try {
      set({ isLoading: true });
      const response = await authApi.login({ email, password });

      // Store in localStorage
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
      });
    }
  },

  loadStoredAuth: () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userString = localStorage.getItem('user');

      if (accessToken && refreshToken && userString) {
        const user = JSON.parse(userString);
        set({
          user,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 0,
          },
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Load stored auth error:', error);
    }
  },
}));
