import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./lib/store";
import apiClient from "./lib/api";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardLayout from "./layouts/ClinicalLayout";
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
  console.log("APP COMPONENT RENDERED V2.3 - CLINICAL SYSTEM ACTIVE");
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
        } else {
          localStorage.removeItem("accessToken");
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem("accessToken");
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setLoading, setAuthenticated]);

  // 1. LOADING GUARD
  // While isLoading is true, we show a clean loading state.
  // This prevents the login form from flashing on the screen.
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying session, please wait...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        {/* 2. AUTHENTICATION ROUTING 
            We now use the store's 'isAuthenticated' as the Single Source of Truth */}
        {isAuthenticated ? (
          <DashboardLayout onLogout={() => {
            localStorage.removeItem("accessToken");
            window.location.href = "/"; // Force a clean state reset
          }} />
        ) : (
          <>
            {isRegistering ? (
              <RegisterPage 
                onSwitchToLogin={() => setIsRegistering(false)} 
                onRegisterSuccess={() => setIsRegistering(false)} 
              />
            ) : (
              <LoginPage
                onSwitchToRegister={() => setIsRegistering(true)}
                onLoginSuccess={(token: string) => {
                  // 1. Give the token to the API client first!
                  apiClient.setAccessToken(token);
                  // 2. Then tell the store we are authenticated
                  setAuthenticated(true);
                }}
              />
            )}
          </>
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
