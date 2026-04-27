import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./lib/store";
import apiClient from "./lib/api";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardLayout from "./layouts/DashboardLayout";
import "./App.css";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
        },
    },
});
function App() {
    // We use isLoading (matching your store.ts) and setAuthenticated
    const { isAuthenticated, setUser, setLoading, isLoading, setAuthenticated } = useAuthStore();
    const [isRegistering, setIsRegistering] = useState(false);
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                apiClient.setAccessToken(token);
                const response = await apiClient.getCurrentUser();
                if (response.success && response.data) {
                    setUser(response.data);
                    setAuthenticated(true);
                }
                else {
                    localStorage.removeItem("accessToken");
                    setAuthenticated(false);
                }
            }
            catch (error) {
                console.error("Auth initialization failed:", error);
                localStorage.removeItem("accessToken");
                setAuthenticated(false);
            }
            finally {
                setLoading(false);
            }
        };
        initializeAuth();
    }, [setUser, setLoading, setAuthenticated]);
    // 1. LOADING GUARD
    // While isLoading is true, we show a clean loading state.
    // This prevents the login form from flashing on the screen.
    if (isLoading) {
        return (_jsxs("div", { className: "loading-screen", children: [_jsx("div", { className: "spinner" }), _jsx("p", { children: "Verifying session, please wait..." })] }));
    }
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx("div", { className: "app", children: isAuthenticated ? (_jsx(DashboardLayout, { onLogout: () => {
                    localStorage.removeItem("accessToken");
                    window.location.href = "/"; // Force a clean state reset
                } })) : (_jsx(_Fragment, { children: isRegistering ? (_jsx(RegisterPage, { onSwitchToLogin: () => setIsRegistering(false), onRegisterSuccess: () => setIsRegistering(false) })) : (_jsx(LoginPage, { onSwitchToRegister: () => setIsRegistering(true), onLoginSuccess: (token) => {
                        // 1. Give the token to the API client first!
                        apiClient.setAccessToken(token);
                        // 2. Then tell the store we are authenticated
                        setAuthenticated(true);
                    } })) })) }) }));
}
export default App;
//# sourceMappingURL=App.js.map