import { useUIStore, useAuthStore } from "../lib/store";
import { 
  Users, 
  Calendar, 
  BarChart2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Hospital,
  BookOpen
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const menuItems = [
    { id: "patients", label: "Directory", icon: Users },
    { id: "appointments", label: "Schedule", icon: Calendar },
    { id: "library", label: "Clinical Library", icon: BookOpen },
    { id: "reports", label: "Analytics", icon: BarChart2, roles: ["ADMIN", "PHYSICIAN"] },
    { id: "settings", label: "Preferences", icon: Settings },
  ].filter(item => !item.roles || item.roles.includes(user?.role || "PHYSICIAN"));

  return (
    <div
      className={`${
        sidebarOpen ? "w-56" : "w-16"
      } bg-[#0f172a] text-white h-screen transition-all duration-300 ease-in-out flex flex-col relative z-30 border-r border-slate-800 shadow-xl`}
    >
      {/* Brand Header */}
      <div className="p-4 mb-4">
        <div className={`flex items-center gap-3 transition-all duration-300 ${!sidebarOpen && "justify-center"}`}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Hospital className="w-5 h-5 text-white" />
          </div>
          <div className={`flex flex-col transition-all duration-300 ${!sidebarOpen ? "opacity-0 invisible w-0" : "opacity-100"}`}>
            <span className="font-bold text-sm tracking-tight leading-none text-white">Clinical OS</span>
            <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">v2.1</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === "patients" && currentPage === "patient-detail");
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center p-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
              }`}
            >
              <div className={`flex items-center ${!sidebarOpen && "mx-auto"}`}>
                {Icon && <Icon className={`w-4 h-4 transition-transform duration-200 ${sidebarOpen && "mr-3"} ${isActive ? "scale-100" : "group-hover:scale-110"}`} />}
                <span className={`text-xs font-semibold transition-all duration-200 whitespace-nowrap ${!sidebarOpen ? "opacity-0 w-0" : "opacity-100"}`}>
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Control Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex flex-col gap-2">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-500 hover:text-slate-300"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onLogout}
            className={`flex items-center rounded-lg transition-all duration-200 group ${
              sidebarOpen 
                ? "hover:bg-rose-500/10 p-2.5 text-slate-400 hover:text-rose-500" 
                : "p-2.5 text-slate-400 hover:bg-rose-500 hover:text-white justify-center"
            }`}
          >
            <LogOut className={`w-4 h-4 transition-all duration-200 ${sidebarOpen && "mr-3"}`} />
            <span className={`font-bold text-[10px] tracking-wider uppercase ${!sidebarOpen && "hidden"}`}>
              Log Out
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
