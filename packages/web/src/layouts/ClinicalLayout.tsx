import { useState } from "react";
import { useAuthStore } from "../lib/store";
import Sidebar from "../components/ClinicalSidebar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Search, Bell, User } from "lucide-react";

// Direct imports to prevent lazy-loading issues
import PatientListPage from "../pages/dashboard/ClinicalDirectory";
import PatientDetailPage from "../pages/dashboard/PatientDetailPage";
import ReportsPage from "../pages/dashboard/ReportsPage";
import SettingsPage from "../pages/dashboard/SettingsPage";
import AppointmentsPage from "../pages/dashboard/AppointmentsPage";
import LibraryPage from "../pages/dashboard/LibraryPage";

interface DashboardLayoutProps {
  onLogout: () => void;
}

type DashboardPage = "patients" | "patient-detail" | "reports" | "settings" | "appointments" | "library";

export default function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const [currentPage, setCurrentPage] = useState<DashboardPage>("patients");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as DashboardPage);
    if (page !== "patient-detail") {
      setSelectedPatientId(null);
    }
  };

  const renderContent = () => {
    try {
      if (currentPage === "patients") {
        return (
          <PatientListPage
            onSelectPatient={(id) => {
              setSelectedPatientId(id);
              setCurrentPage("patient-detail");
            }}
          />
        );
      }
      
      if (currentPage === "patient-detail") {
        return selectedPatientId ? (
          <PatientDetailPage
            patientId={selectedPatientId}
            onBack={() => setCurrentPage("patients")}
          />
        ) : (
          <div className="p-20 text-center text-slate-400 font-medium">Select a patient from the directory</div>
        );
      }

      if (currentPage === "reports") return <ReportsPage />;
      if (currentPage === "settings") return <SettingsPage />;
      if (currentPage === "appointments") return <AppointmentsPage />;
      if (currentPage === "library") return <LibraryPage />;
      
      return <div className="p-10">Page {currentPage} not found</div>;
    } catch (error) {
      console.error("Render error:", error);
      return <div className="p-10 text-red-500 font-bold">Failed to load {currentPage}</div>;
    }
  };

  const pageTitles: Record<DashboardPage, string> = {
    "patients": "Patient Directory",
    "patient-detail": "Clinical Profile",
    "reports": "Analytics & Reports",
    "settings": "System Preferences",
    "appointments": "Schedule Manager",
    "library": "Clinical Library"
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-14 bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Breadcrumb
              items={[
                { label: "Dashboard", onClick: () => handleNavigate("patients") },
                { label: pageTitles[currentPage], isActive: true }
              ]}
            />
            <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              <span className="text-sky-500">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <input type="text" placeholder="Jump to..." className="bg-transparent border-0 focus:ring-0 text-xs w-32 placeholder:text-slate-400" />
            </div>
            
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-900 leading-none mb-0.5">{user?.email?.split('@')[0]}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{user?.role || "MD"}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg border border-sky-200 flex items-center justify-center text-sky-600">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5 bg-[#f8fafc]">
          <div className="max-w-[1600px] mx-auto animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
