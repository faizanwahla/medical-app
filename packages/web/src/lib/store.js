import { create } from "zustand";
export const useAuthStore = create((set) => ({
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
        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
        });
    },
}));
export const useUIStore = create((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
//# sourceMappingURL=store.js.map