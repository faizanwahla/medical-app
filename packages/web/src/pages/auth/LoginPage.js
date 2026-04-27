import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuthStore } from "../../lib/store";
import apiClient from "../../lib/api";
export default function LoginPage({ onSwitchToRegister, onLoginSuccess, }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { setUser, setAccessToken } = useAuthStore();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await apiClient.login(email, password);
            if (response.success) {
                // 1. Get the token (checking both common names)
                const token = response.data.accessToken || response.data.token;
                if (!token) {
                    throw new Error("No token received from server");
                }
                // 2. IMPORTANT: Update the API Client first so the next request works!
                apiClient.setAccessToken(token);
                // 3. Update the Zustand store
                setAccessToken(token);
                setUser(response.data.user);
                // 4. Call callback with token
                onLoginSuccess(token);
            }
            else {
                setError(response.error || "Login failed");
            }
        }
        catch (err) {
            console.error("Login detail:", err);
            setError(err.response?.data?.error || err.message || "Login failed");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "card w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-medical-700 mb-2", children: "\uD83C\uDFE5 Medical App" }), _jsx("p", { className: "text-gray-600", children: "Patient Management System" })] }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Email" }), _jsx("input", { type: "email", className: "input", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Password" }), _jsx("input", { type: "password", className: "input", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full", children: loading ? "Logging in..." : "Login" })] }), _jsxs("p", { className: "text-center mt-6 text-gray-600", children: ["Don't have an account?", " ", _jsx("button", { onClick: onSwitchToRegister, className: "text-medical-600 font-medium hover:underline", children: "Register" })] })] }) }));
}
//# sourceMappingURL=LoginPage.js.map