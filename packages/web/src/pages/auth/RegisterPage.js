import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { SPECIALTIES } from "@medical-app/shared";
import { useAuthStore } from "../../lib/store";
import apiClient from "../../lib/api";
export default function RegisterPage({ onSwitchToLogin, onRegisterSuccess, }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { setUser, setAccessToken } = useAuthStore();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        setLoading(true);
        try {
            const response = await apiClient.register(email, password, specialty);
            if (response.success) {
                setAccessToken(response.data.accessToken);
                setUser(response.data.user);
                onRegisterSuccess();
            }
            else {
                setError(response.error || "Registration failed");
            }
        }
        catch (err) {
            setError(err.response?.data?.error || "Registration failed");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "card w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-medical-700 mb-2", children: "\uD83C\uDFE5 Medical App" }), _jsx("p", { className: "text-gray-600", children: "Create Your Account" })] }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Email" }), _jsx("input", { type: "email", className: "input", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Specialty" }), _jsx("select", { className: "input", value: specialty, onChange: (e) => setSpecialty(e.target.value), children: SPECIALTIES.map((spec) => (_jsx("option", { value: spec, children: spec }, spec))) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Password" }), _jsx("input", { type: "password", className: "input", value: password, onChange: (e) => setPassword(e.target.value), required: true }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Min 8 chars, must include uppercase and number" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Confirm Password" }), _jsx("input", { type: "password", className: "input", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full", children: loading ? "Creating Account..." : "Register" })] }), _jsxs("p", { className: "text-center mt-6 text-gray-600", children: ["Already have an account?", " ", _jsx("button", { onClick: onSwitchToLogin, className: "text-medical-600 font-medium hover:underline", children: "Login" })] })] }) }));
}
//# sourceMappingURL=RegisterPage.js.map