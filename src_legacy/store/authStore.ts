import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/cloudstack';
import { mockUsers } from '../lib/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: 'admin' | 'user') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (role) => {
        const user = mockUsers.find((u) => u.role === role) || mockUsers[0];
        set({ user, isAuthenticated: true });
      },
      logout: () => set({ user: null, isAuthenticated: false })
    }),
    {
      name: 'cmp-auth-storage'
    }
  )
);