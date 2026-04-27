import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessToken: (token) => {
    localStorage.setItem("accessToken", token);
    set({ accessToken: token, isAuthenticated: !!token });
  },
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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

interface AppSettingsState {
  defaultLibrarySpecialty: string;
  showReferenceDetails: boolean;
  confirmBeforeCarePlanOrders: boolean;
  feverThreshold: number;
  tachycardiaThreshold: number;
  hypoxiaThreshold: number;
  systolicHypertensionThreshold: number;
  updateSettings: (settings: Partial<Omit<AppSettingsState, "updateSettings" | "resetSettings">>) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  defaultLibrarySpecialty: "All Specialties",
  showReferenceDetails: true,
  confirmBeforeCarePlanOrders: true,
  feverThreshold: 38,
  tachycardiaThreshold: 100,
  hypoxiaThreshold: 92,
  systolicHypertensionThreshold: 140,
};

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "medical-app-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        defaultLibrarySpecialty: state.defaultLibrarySpecialty,
        showReferenceDetails: state.showReferenceDetails,
        confirmBeforeCarePlanOrders: state.confirmBeforeCarePlanOrders,
        feverThreshold: state.feverThreshold,
        tachycardiaThreshold: state.tachycardiaThreshold,
        hypoxiaThreshold: state.hypoxiaThreshold,
        systolicHypertensionThreshold: state.systolicHypertensionThreshold,
      }),
    }
  )
);
