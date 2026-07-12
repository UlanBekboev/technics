import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useFavoritesStore } from './favorites';
import { useCartStore } from './cart';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hasHydrated: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        useFavoritesStore.getState().setIds([]);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        useFavoritesStore.getState().setIds([]);
        useCartStore.getState().clearCart();
        set({ user: null, token: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth',
      // Guards (e.g. admin layout) must wait for this before redirecting on a
      // missing user — otherwise a fresh page load reads `user: null` before
      // localStorage has been read back in yet, and bounces straight to /login.
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);
