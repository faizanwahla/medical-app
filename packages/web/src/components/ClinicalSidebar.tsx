import { useUIStore } from "../lib/store";
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

  const menuItems = [
    { id: "patients", label: "Patients", icon: Users },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "reports", label: "Reports", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div
      className={`${
        sidebarOpen ? "w-72" : "w-24"
      } bg-medical-700 text-white h-screen transition-all duration-500 ease-in-out flex flex-col shadow-2xl relative z-30`}
    >
      {/* Brand Header */}
      <div className="p-8 flex items-center justify-between">
        <div className={`flex items-center space-x-3 transition-opacity duration-300 ${!sidebarOpen && "opacity-0 invisible absolute"}`}>
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
            <Hospital className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">MedApp</span>
        </div>
        {!sidebarOpen && (
           <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md mx-auto">
             <Hospital className="w-6 h-6 text-white" />
           </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === "patients" && currentPage === "patient-detail");
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-white text-medical-700 shadow-lg shadow-medical-800/20"
                  : "hover:bg-white/10 text-medical-100"
              }`}
            >
              {Icon && <Icon className={`w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110 ${sidebarOpen ? "mr-4" : "mx-auto"}`} />}
              <span className={`font-bold tracking-tight transition-all duration-300 ${!sidebarOpen ? "opacity-0 w-0" : "opacity-100"}`}>
                {item.label}
              </span>
              
              {isActive && !sidebarOpen && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-l-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Control Footer */}
      <div className="p-6 space-y-4">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-3 hover:bg-white/10 rounded-2xl transition-all text-medical-300"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center p-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl transition-all duration-300 group"
        >
          <LogOut className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${sidebarOpen ? "mr-4" : "mx-auto"}`} />
          <span className={`font-bold text-sm tracking-tight ${!sidebarOpen && "hidden"}`}>
            End Session
          </span>
        </button>
      </div>
    </div>
  );
}
