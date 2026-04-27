import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/api";
import PatientForm from "../../components/ClinicalForm";
import { 
  Search, 
  UserPlus, 
  Clock,
  Trash2,
  User,
  ChevronRight,
  MoreVertical
} from "lucide-react";

interface PatientListPageProps {
  onSelectPatient: (id: string) => void;
}

export default function PatientListPage({ onSelectPatient }: PatientListPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => apiClient.getPatients(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowForm(false);
      alert("Patient registered successfully.");
    },
    onError: (err: any) => {
      const details = err.response?.data?.details;
      const msg = details 
        ? details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ')
        : (err.response?.data?.error || err.message);
      alert("Failed to register patient: " + msg);
      console.error(err);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      alert("Patient record deleted successfully.");
    },
    onError: (err: any) => {
      alert("Failed to delete patient: " + err.message);
      console.error(err);
    }
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const patients = response?.data?.patients || [];
  const filteredPatients = (patients || []).filter(
    (p: any) =>
      (p?.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p?.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (isError) {
    return (
      <div className="card border-red-100 bg-red-50 p-10 text-center">
        <h3 className="text-xl font-bold text-red-700 mb-2">Connection Failed</h3>
        <p className="text-red-600 mb-6">Unable to retrieve patient directory. {(error as any)?.message}</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ["patients"] })} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="heading-2">Patient Directory</h2>
          <p className="text-sm text-gray-500 font-medium">Real-time clinical database and tracking</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search by name..." 
               className="input-field pl-11 w-64 h-12 text-sm shadow-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button
             onClick={() => setShowForm(!showForm)}
             className="btn-primary h-12 px-6 flex items-center space-x-2"
           >
             <UserPlus className="w-5 h-5" />
             <span className="hidden sm:inline">New Admission</span>
           </button>
        </div>
      </div>

      {showForm && (
        <div className="card shadow-2xl border-medical-100 animate-fade-in relative z-20">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Register New Patient</h3>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
               <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <PatientForm
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Directory Table */}
      <div className="card p-0 overflow-hidden border-none shadow-xl shadow-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient Profile</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Biological Data</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Clinical Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Last Encounter</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-red-600 font-bold text-3xl">
                    SYSTEM LOADING PATIENT DATA...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                       <User className="w-16 h-16 mb-4" />
                       <p className="font-bold italic">Zero matching clinical records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient: any) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-medical-50/30 cursor-pointer transition-all duration-150 group"
                    onClick={() => onSelectPatient(patient.id)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-50 to-medical-100 flex items-center justify-center text-medical-700 font-black text-lg border border-medical-200 shadow-sm">
                          {(patient?.firstName?.[0] || "")}{(patient?.lastName?.[0] || "")}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-medical-700 transition-colors">
                            {patient?.firstName} {patient?.lastName}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {patient?.id?.slice(0, 8) || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-700">{patient?.age} Years • {patient?.gender}</p>
                        <p className="text-[10px] font-bold text-medical-600 uppercase tracking-widest">Type {patient?.bloodType || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="badge-success">Stable</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-xs font-bold text-gray-400">
                        <Clock className="w-4 h-4 mr-2 opacity-50" />
                        <span>{patient?.updatedAt ? new Date(patient.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}</span>
                      </div>
                    </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center space-x-3 transition-all duration-200">
                          <button 
                            onClick={(e) => handleDelete(e, patient.id)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Purge Record"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                         <div className="p-2.5 bg-medical-50 text-medical-700 rounded-xl">
                            <ChevronRight className="w-5 h-5" />
                         </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
