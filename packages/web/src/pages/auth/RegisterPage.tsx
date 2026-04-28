import { useState } from "react";
import { SPECIALTIES } from "@medical-app/shared";
import { useAuthStore } from "../../lib/store";
import apiClient from "../../lib/api";
import { Mail, Lock, Stethoscope, ArrowLeft, Hospital, AlertCircle } from "lucide-react";

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export default function RegisterPage({
  onSwitchToLogin,
  onRegisterSuccess,
}: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser, setAccessToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.register(email, password, specialty);
      if (response.success) {
        apiClient.setSessionTokens(response.data.accessToken, response.data.refreshToken);
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        onRegisterSuccess();
      } else {
        setError(response.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Hospital className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Clinical OS</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 p-10">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Professional Account</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Join the secure clinical network</p>
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
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Specialty</label>
              <div className="relative group">
                <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <select
                  className="input-modern pl-11 h-12 appearance-none cursor-pointer"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value as any)}
                >
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Password</label>
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

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="password"
                    className="input-modern pl-11 h-12"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
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
                "Complete Registration"
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onSwitchToLogin}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
            <p className="text-slate-400 text-[11px] font-medium italic">Verified Clinical Staff Only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
