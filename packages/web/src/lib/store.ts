import { create } from "zustand";
import { User } from "@medical-app/shared";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string) => void;
  setAuthenticated: (auth: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setAccessToken: (token) => {
    localStorage.setItem("accessToken", token);
    set({ accessToken: token, isAuthenticated: !!token });
  },
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  logout: () => {
    localStorage.removeItem("accessToken");
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));

// UI State
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
