import { useState } from "react";
import { SPECIALTIES } from "@medical-app/shared";
import { useAuthStore } from "../../lib/store";
import apiClient from "../../lib/api";
import { Mail, Lock, Stethoscope, ArrowLeft, Hospital } from "lucide-react";
import { Container, Stack, Card } from "../../components/layout";
import { Alert, Button } from "../../components/ui";

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-medical-50 flex flex-col items-center justify-center px-4 py-8 md:py-12">
      <Container maxWidth="sm" className="flex flex-col justify-center">
        
        {/* Header Section */}
        <Stack spacing="lg" align="center" className="mb-8 md:mb-12">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-medical-500 to-medical-600 rounded-xl flex items-center justify-center shadow-lg">
            <Hospital className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Clinical OS</h1>
            <p className="text-sm md:text-base text-neutral-500 mt-2">Medical Patient Management System</p>
          </div>
        </Stack>

        {/* Register Card */}
        <Card padding="lg" shadow="lg" className="mb-6 md:mb-8">
          <Stack spacing="lg">
            {/* Welcome Text */}
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900">Create Professional Account</h2>
              <p className="text-sm md:text-base text-neutral-500 mt-2">Join the secure clinical network</p>
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
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-semibold text-neutral-700">Professional Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-medical-500 transition-colors" />
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-white border border-neutral-200 rounded-lg text-sm md:text-base focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-100 transition-all"
                    placeholder="name@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Specialty Field */}
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-semibold text-neutral-700">Medical Specialty</label>
                <div className="relative group">
                  <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-medical-500 transition-colors pointer-events-none" />
                  <select
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-white border border-neutral-200 rounded-lg text-sm md:text-base focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-100 transition-all appearance-none cursor-pointer"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value as any)}
                  >
                    {SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-semibold text-neutral-700">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-medical-500 transition-colors" />
                    <input
                      type="password"
                      className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-white border border-neutral-200 rounded-lg text-sm md:text-base focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-100 transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-semibold text-neutral-700">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-medical-500 transition-colors" />
                    <input
                      type="password"
                      className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-white border border-neutral-200 rounded-lg text-sm md:text-base focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-100 transition-all"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                fullWidth
                size="md"
              >
                Complete Registration
              </Button>
            </form>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
            </div>

            {/* Back to Login */}
            <Button
              onClick={onSwitchToLogin}
              variant="outline"
              fullWidth
              size="md"
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              Back to Sign In
            </Button>
          </Stack>
        </Card>

        {/* Footer - Info */}
        <div className="text-center text-xs text-neutral-500">
          <p className="font-medium">Verified Clinical Staff Only</p>
        </div>
      </Container>
    </div>
  );
}
