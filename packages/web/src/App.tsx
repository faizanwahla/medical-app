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
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const { isAuthenticated, setUser, setLoading } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<
    "login" | "register" | "dashboard"
  >("login");

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          setLoading(true);
          apiClient.setAccessToken(token);
          const response = await apiClient.getCurrentUser();
          if (response.success) {
            setUser(response.data);
            setCurrentPage("dashboard");
          } else {
            localStorage.removeItem("accessToken");
          }
        } catch (error) {
          console.error("Failed to initialize auth", error);
          localStorage.removeItem("accessToken");
        } finally {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        {currentPage === "login" && (
          <LoginPage
            onSwitchToRegister={() => setCurrentPage("register")}
            onLoginSuccess={() => setCurrentPage("dashboard")}
          />
        )}
        {currentPage === "register" && (
          <RegisterPage
            onSwitchToLogin={() => setCurrentPage("login")}
            onRegisterSuccess={() => setCurrentPage("dashboard")}
          />
        )}
        {currentPage === "dashboard" && (
          <DashboardLayout onLogout={() => setCurrentPage("login")} />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
