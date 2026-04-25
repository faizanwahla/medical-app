import { useState } from "react";
import { useAuthStore } from "../lib/store";
import Sidebar from "../components/Sidebar";
import PatientListPage from "../pages/dashboard/PatientListPage";

interface DashboardLayoutProps {
  onLogout: () => void;
}

type DashboardPage = "patients" | "patient-detail";

export default function DashboardLayout({
  onLogout,
}: DashboardLayoutProps) {
  const [currentPage, setCurrentPage] = useState<DashboardPage>("patients");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical App</h1>
            <p className="text-sm text-gray-600">{user?.specialty}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {currentPage === "patients" && (
            <PatientListPage
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                setCurrentPage("patient-detail");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
