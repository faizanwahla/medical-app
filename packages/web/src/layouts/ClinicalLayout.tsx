import { useState } from "react";
import { useAuthStore } from "../lib/store";
import Sidebar from "../components/ClinicalSidebar";

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

  // Safe Page Renderer
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
          <div className="p-20 text-center text-gray-400">No patient selected</div>
        );
      }

      if (currentPage === "reports") return <ReportsPage />;
      if (currentPage === "settings") return <SettingsPage />;
      if (currentPage === "appointments") return <AppointmentsPage />;
      if (currentPage === "library") return <LibraryPage />;
      
      return <div className="p-10">Page {currentPage} not found</div>;
    } catch (err) {
      return <div className="p-10 text-red-600 font-bold">Error rendering {currentPage}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
          <h1 className="font-bold text-gray-800 uppercase tracking-widest text-sm">
            Clinical System / {currentPage}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500 font-bold">{user?.email}</span>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-xs font-bold">LOGOUT</button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
