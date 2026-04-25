import { useUIStore } from "../lib/store";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const menuItems = [
    { id: "patients", label: "👥 Patients", icon: "patients" },
    { id: "appointments", label: "📅 Appointments", icon: "appointments" },
    { id: "reports", label: "📊 Reports", icon: "reports" },
    { id: "settings", label: "⚙️ Settings", icon: "settings" },
  ];

  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-20"
      } bg-medical-700 text-white h-screen transition-all duration-300 flex flex-col shadow-lg`}
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between border-b border-medical-600">
        <h2 className={`font-bold text-lg ${!sidebarOpen && "hidden"}`}>
          🏥 MedApp
        </h2>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-medical-600 rounded"
        >
          {sidebarOpen ? "←" : "→"}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full px-6 py-3 text-left transition-all ${
              currentPage === item.id
                ? "bg-medical-600 border-l-4 border-white"
                : "hover:bg-medical-600"
            } ${!sidebarOpen && "px-2"}`}
          >
            <span className={!sidebarOpen ? "text-xl" : ""}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-medical-600">
        <button
          onClick={onLogout}
          className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
        >
          {sidebarOpen ? "Logout" : "🚪"}
        </button>
      </div>
    </div>
  );
}
