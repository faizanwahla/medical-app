import { useState } from "react";
import { useAuthStore } from "../../lib/store";
import apiClient from "../../lib/api";
import { Lock, Mail, ArrowRight, ShieldCheck, Hospital } from "lucide-react";
import { Container, Stack, Card } from "../../components/layout";
import { Alert, Button } from "../../components/ui";

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: (token: string) => void;
}

export default function LoginPage({
  onSwitchToRegister,
  onLoginSuccess,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser, setAccessToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.login(email, password);
      
      if (response.success) {
        const token = response.data.accessToken || response.data.token;
        
        if (!token) {
          throw new Error("No token received from server");
        }

        apiClient.setSessionTokens(token, response.data.refreshToken);
        setAccessToken(token);
        setUser(response.data.user);
        onLoginSuccess(token);
      } else {
        setError(response.error || "Invalid credentials");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Connection failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-neutral-50 via-white to-medical-50 flex items-center justify-center overflow-auto">
      <div className="w-full max-w-sm px-4 py-4 md:py-0">
        
        {/* Header Section */}
        <div className="flex flex-col items-center gap-3 md:gap-4 mb-5 md:mb-6">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-medical-500 to-medical-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Hospital className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Clinical OS</h1>
            <p className="text-xs md:text-sm text-neutral-500 mt-1 md:mt-2">Medical Patient Management System</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-lg p-4 md:p-6 mb-3 md:mb-4">
          {/* Welcome Text */}
          <div className="text-center mb-4 md:mb-5">
            <h2 className="text-lg md:text-xl font-bold text-neutral-900">Welcome Back</h2>
            <p className="text-xs md:text-sm text-neutral-500 mt-1 md:mt-2">Access your clinical dashboard</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="error"
              message={error}
              onClose={() => setError("")}
              dismissible
            />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-xs font-semibold text-neutral-700">Professional Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-neutral-400 group-focus-within:text-medical-500 transition-colors" />
                <input
                  type="email"
                  className="w-full pl-10 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3 bg-white border border-neutral-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-100 transition-all"
                  placeholder="name@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 md:space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Password</label>
                <button 
                  type="button" 
                  className="text-xs text-medical-600 hover:text-medical-700 font-semibold transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-neutral-400 group-focus-within:text-medical-500 transition-colors" />
                <input
                  type="password"
                  className="w-full pl-10 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3 bg-white border border-neutral-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-100 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              fullWidth
              size="md"
              icon={!loading && <ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative py-2 md:py-3 my-3 md:my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-neutral-500">New to Clinical OS?</span>
            </div>
          </div>

          {/* Register Link */}
          <Button
            onClick={onSwitchToRegister}
            variant="outline"
            fullWidth
            size="md"
          >
            Create New Account
          </Button>
        </div>

        {/* Footer - Security Info */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-xs text-neutral-500 opacity-75">
          <div className="flex items-center gap-1.5 md:gap-2">
            <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="font-medium">HIPAA Compliant</span>
          </div>
          <div className="hidden md:block w-1 h-1 bg-neutral-300 rounded-full" />
          <div className="flex items-center gap-1.5 md:gap-2">
            <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="font-medium">E2E Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
