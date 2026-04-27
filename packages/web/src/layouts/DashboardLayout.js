import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuthStore } from "../lib/store";
import Sidebar from "../components/Sidebar";
import PatientListPage from "../pages/dashboard/PatientListPage";
export default function DashboardLayout({ onLogout, }) {
    const [currentPage, setCurrentPage] = useState("patients");
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const { user, logout } = useAuthStore();
    const handleLogout = () => {
        logout();
        onLogout();
    };
    return (_jsxs("div", { className: "flex h-screen bg-gray-100", children: [_jsx(Sidebar, { currentPage: currentPage, onNavigate: (page) => setCurrentPage(page), onLogout: handleLogout }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "bg-white shadow px-6 py-4 flex justify-between items-center border-b border-gray-200", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Medical App" }), _jsx("p", { className: "text-sm text-gray-600", children: user?.specialty })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("span", { className: "text-gray-700", children: user?.email }), _jsx("button", { onClick: handleLogout, className: "btn-secondary", children: "Logout" })] })] }), _jsx("div", { className: "flex-1 overflow-auto p-6", children: currentPage === "patients" && (_jsx(PatientListPage, { onSelectPatient: (id) => {
                                setSelectedPatientId(id);
                                setCurrentPage("patient-detail");
                            } })) })] })] }));
}
//# sourceMappingURL=DashboardLayout.js.map