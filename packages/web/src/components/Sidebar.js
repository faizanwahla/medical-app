import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useUIStore } from "../lib/store";
export default function Sidebar({ currentPage, onNavigate, onLogout }) {
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const menuItems = [
        { id: "patients", label: "👥 Patients", icon: "patients" },
        { id: "appointments", label: "📅 Appointments", icon: "appointments" },
        { id: "reports", label: "📊 Reports", icon: "reports" },
        { id: "settings", label: "⚙️ Settings", icon: "settings" },
    ];
    return (_jsxs("div", { className: `${sidebarOpen ? "w-64" : "w-20"} bg-medical-700 text-white h-screen transition-all duration-300 flex flex-col shadow-lg`, children: [_jsxs("div", { className: "p-6 flex items-center justify-between border-b border-medical-600", children: [_jsx("h2", { className: `font-bold text-lg ${!sidebarOpen && "hidden"}`, children: "\uD83C\uDFE5 MedApp" }), _jsx("button", { onClick: toggleSidebar, className: "p-2 hover:bg-medical-600 rounded", children: sidebarOpen ? "←" : "→" })] }), _jsx("nav", { className: "flex-1 py-4", children: menuItems.map((item) => (_jsx("button", { onClick: () => onNavigate(item.id), className: `w-full px-6 py-3 text-left transition-all ${currentPage === item.id
                        ? "bg-medical-600 border-l-4 border-white"
                        : "hover:bg-medical-600"} ${!sidebarOpen && "px-2"}`, children: _jsx("span", { className: !sidebarOpen ? "text-xl" : "", children: item.label }) }, item.id))) }), _jsx("div", { className: "p-4 border-t border-medical-600", children: _jsx("button", { onClick: onLogout, className: "w-full py-2 px-3 bg-red-600 hover:bg-red-700 rounded text-sm font-medium", children: sidebarOpen ? "Logout" : "🚪" }) })] }));
}
//# sourceMappingURL=Sidebar.js.map