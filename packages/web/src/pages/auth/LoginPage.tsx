import { useState } from "react";
import { useAuthStore } from "../../lib/store";
import apiClient from "../../lib/api";
import { Lock, Mail, ArrowRight, ShieldCheck, Hospital, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Hospital className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Clinical OS</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 p-10">
          <div className="text-center mb-10">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Access your clinical dashboard</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Professional Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  className="input-modern pl-11 h-12"
                  placeholder="name@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-0.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Password</label>
                <button type="button" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  className="input-modern pl-11 h-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-gradient h-12 mt-4 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              New to Clinical OS?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-indigo-600 font-bold hover:underline underline-offset-4 transition-all"
              >
                Request Access
              </button>
            </p>
          </div>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-6 opacity-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">HIPAA Compliant</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">E2E Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
