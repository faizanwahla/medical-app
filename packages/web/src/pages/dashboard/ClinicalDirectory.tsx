import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/api";
import PatientForm from "../../components/ClinicalForm";
import { 
  Search, 
  Clock,
  Trash2,
  User,
  ChevronRight,
  Filter,
  Plus,
  AlertCircle
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
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => apiClient.getPatients(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowForm(false);
    },
    onError: (err: any) => {
      console.error(err);
      alert("Registration failed. Please check input requirements.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (err: any) => {
      console.error(err);
      alert("Failed to delete patient record.");
    }
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this clinical record?")) {
      deleteMutation.mutate(id);
    }
  };

  const patients = response?.data?.patients || [];
  const filteredPatients = (patients || []).filter(
    (p: any) =>
      (p?.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p?.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (isError) {
    return (
      <div className="glass-card p-12 text-center max-w-2xl mx-auto border-rose-100 bg-rose-50/30">
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Service Interruption</h3>
        <p className="text-slate-500 mb-8 font-medium">We encountered a network issue while retrieving the patient directory.</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["patients"] })} 
          className="btn-primary-gradient px-8"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 max-w-sm">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="input-modern pl-10 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn-secondary-glass h-10 px-4">
            <Filter className="w-4 h-4 mr-2" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary-gradient h-10 px-5"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 relative overflow-hidden rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Patient Admission</h3>
              <p className="text-xs text-slate-500 font-medium">Register a new clinical case</p>
            </div>
            <button 
              onClick={() => setShowForm(false)} 
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <PatientForm
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Patient Grid/Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Patient Profile</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Clinical Data</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Encounter</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-5">
                      <div className="h-10 bg-slate-50 rounded-lg w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                       <User className="w-12 h-12 mb-4 text-slate-300" />
                       <p className="text-sm font-semibold text-slate-500">No clinical records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient: any) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                    onClick={() => onSelectPatient(patient.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100 shadow-sm flex-shrink-0">
                          {(patient?.firstName?.[0] || "")}{(patient?.lastName?.[0] || "")}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {patient?.firstName} {patient?.lastName}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate uppercase tracking-tight">ID: {patient?.id?.slice(0, 12)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-600">{patient?.age}y • {patient?.gender}</span>
                        <span className="text-[10px] font-bold text-indigo-600 mt-1">{patient?.bloodType || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="badge-premium badge-success">Stable</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Clock className="w-3.5 h-3.5 opacity-40" />
                        <span>{patient?.updatedAt ? new Date(patient.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "--"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => handleDelete(e, patient.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <ChevronRight className="w-4 h-4" />
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
