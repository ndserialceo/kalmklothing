import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setToken: (token: string) => {
        localStorage.setItem("auth_token", token);
        set({ token, isAuthenticated: true });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await auth.login({ email, password });
          const { user, token } = data.data;
          localStorage.setItem("auth_token", token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (registerData) => {
        set({ isLoading: true });
        try {
          const { data } = await auth.register(registerData);
          const { user, token } = data.data;
          localStorage.setItem("auth_token", token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await auth.logout();
        } catch {
          // Continue with logout even if API fails
        } finally {
          localStorage.removeItem("auth_token");
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      fetchProfile: async () => {
        const token = get().token;
        if (!token) return;

        set({ isLoading: true });
        try {
          const { data } = await auth.getProfile();
          set({ user: data.data, isLoading: false });
        } catch {
          localStorage.removeItem("auth_token");
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const { data } = await auth.updateProfile(profileData);
          set({ user: data.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "kalmklothing-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
