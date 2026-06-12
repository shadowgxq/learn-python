import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { requestClient } from '../../shared/api';
import { authApi } from './auth.api';
import type { CurrentUser } from './auth.types';

interface AuthState {
  token: string | null;
  user: CurrentUser | null;
  setToken: (token: string) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setToken(token: string) {
        set({ token });
        requestClient.defaults.headers.common.Authorization = `Bearer ${token}`;
      },

      async login(username, password) {
        const res = await authApi.login({ username, password });
        get().setToken(res.access_token);
        await get().fetchUser();
      },

      async register(username, password) {
        await authApi.register({ username, password });
        await get().login(username, password);
      },

      async fetchUser() {
        try {
          const user = await authApi.me();
          set({ user });
        } catch {
          get().logout();
        }
      },

      logout() {
        set({ token: null, user: null });
        delete requestClient.defaults.headers.common.Authorization;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          requestClient.defaults.headers.common.Authorization = `Bearer ${state.token}`;
          state.fetchUser();
        }
      },
    },
  ),
);
