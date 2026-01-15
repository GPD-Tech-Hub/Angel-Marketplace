import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens } from '@/types';
import { secureStorage, STORAGE_KEYS } from '@/utils/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  login: (user: User, tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: async (tokens) => {
        await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      },

      getAccessToken: async () => {
        return await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      },

      getRefreshToken: async () => {
        return await secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      },

      login: async (user, tokens) => {
        await get().setTokens(tokens);
        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        await secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        set({ user: null, isAuthenticated: false });
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          const accessToken = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (accessToken) {
            // Token exists, user state will be restored from persist
            set({ isAuthenticated: true });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
