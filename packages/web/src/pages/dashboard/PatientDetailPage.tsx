import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/api";
import VitalsChart from "../../components/VitalsChart";
import { 
  Activity, 
  Thermometer, 
  Heart, 
  Droplets, 
  Clipboard, 
  Stethoscope, 
  Pill, 
  ArrowLeft,
  Plus,
  Brain,
  History,
  ShieldAlert
} from "lucide-react";
import Modal from "../../components/Modal";
import DDxGenerator from "../../components/DDxGenerator";
import InvestigationForm from "../../components/InvestigationForm";
import TreatmentForm from "../../components/TreatmentForm";
import VitalsForm from "../../components/VitalsForm";
import { useState } from "react";

interface PatientDetailPageProps {
  patientId: string;
  onBack: () => void;
}

export default function PatientDetailPage({ patientId, onBack }: PatientDetailPageProps) {
  const [isDDxModalOpen, setIsDDxModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  // Fetch patient details
  const { data: patientResponse, isLoading, isError } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => apiClient.getPatient(patientId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Accessing Clinical Records...</p>
      </div>
    );
  }

  const patient = patientResponse?.data;

  if (isError || !patient) {
    return (
      <div className="card border-red-100 bg-red-50 p-10 text-center">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700">Clinical Data Missing</h2>
        <p className="text-red-600 mb-6">The system could not retrieve the records for ID: {patientId}</p>
        <button onClick={onBack} className="btn-primary">← Return to Directory</button>
      </div>
    );
  }

  const latestVital = patient?.vitals?.[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
      {/* Header with Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <button onClick={onBack} className="p-3 bg-white hover:bg-gray-100 rounded-2xl shadow-sm border border-gray-100 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-4">
             <div className="w-16 h-16 rounded-2xl bg-medical-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-medical-200">
               {(patient?.firstName?.[0] || "")}{(patient?.lastName?.[0] || "")}
             </div>
             <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {patient?.firstName} {patient?.lastName}
                </h2>
                <div className="flex items-center space-x-2 text-sm font-bold text-gray-500 mt-1">
                  <span>{patient?.gender}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{patient?.age} Years</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-medical-600 font-black tracking-widest uppercase text-[10px]">Blood {patient?.bloodType || "N/A"}</span>
                </div>
             </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsVitalsModalOpen(true)}
            className="btn-primary flex items-center space-x-2 h-12"
          >
            <Stethoscope className="w-5 h-5" />
            <span>Examine</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="btn-secondary h-12 px-6 flex items-center space-x-2"
          >
            <Clipboard className="w-5 h-5 text-gray-400" />
            <span>Summary</span>
          </button>
        </div>
      </div>

      {/* Clinical Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Thermometer className="w-5 h-5 text-red-500" />} 
          label="Temperature" 
          value={latestVital?.temperature ? `${latestVital.temperature}°C` : "--"} 
          status={latestVital?.temperature > 37.5 ? "critical" : "normal"}
        />
        <StatCard 
          icon={<Heart className="w-5 h-5 text-rose-500" />} 
          label="Pulse" 
          value={latestVital?.pulse ? `${latestVital.pulse} bpm` : "--"} 
          status={latestVital?.pulse > 100 || latestVital?.pulse < 60 ? "warning" : "normal"}
        />
        <StatCard 
          icon={<Activity className="w-5 h-5 text-blue-500" />} 
          label="Blood Pressure" 
          value={latestVital?.bloodPressureSystolic ? `${latestVital.bloodPressureSystolic}/${latestVital.bloodPressureDiastolic}` : "--"} 
          status={latestVital?.bloodPressureSystolic > 140 ? "warning" : "normal"}
        />
        <StatCard 
          icon={<Droplets className="w-5 h-5 text-cyan-500" />} 
          label="SpO2" 
          value={latestVital?.oxygenSaturation ? `${latestVital.oxygenSaturation}%` : "--"} 
          status={latestVital?.oxygenSaturation < 94 ? "critical" : "normal"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Trends Section */}
        <div className="lg:col-span-2 space-y-8">
          <VitalsChart 
            data={patient?.vitals || []} 
            type="bp" 
            title="Blood Pressure Analytics" 
          />
          <VitalsChart 
            data={patient?.vitals || []} 
            type="pulse" 
            title="Heart Rate Analytics" 
          />
        </div>

        {/* Clinical Summary & Treatments */}
        <div className="space-y-8">
          <div className="card space-y-6">
            <div className="flex items-center space-x-3 text-medical-700">
               <History className="w-6 h-6" />
               <h3 className="text-lg font-black uppercase tracking-widest text-gray-800">Clinical Data</h3>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="label-text">Presenting Complaint</label>
                  <p className="text-gray-900 font-medium leading-relaxed">{patient?.presentingComplaint || "No data recorded"}</p>
               </div>
               <div>
                  <label className="label-text">Medical History</label>
                  <p className="text-sm text-gray-600 leading-relaxed italic">{patient?.pastMedicalHistory?.join(", ") || "No history found"}</p>
               </div>
               <div className="flex flex-wrap gap-2">
                  {patient?.allergies?.map((a: string) => (
                    <span key={a} className="badge-error">Allergy: {a}</span>
                  ))}
               </div>
            </div>
          </div>

          <div className="card space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-medical-700">
                 <Pill className="w-6 h-6" />
                 <h3 className="text-lg font-black uppercase tracking-widest text-gray-800">Treatments</h3>
              </div>
              <button onClick={() => setIsTreatmentModalOpen(true)} className="p-2 hover:bg-medical-50 rounded-lg text-medical-600">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
               {(patient?.treatments?.filter((t: any) => t.status === "Active") || []).length > 0 ? (
                 patient?.treatments
                   ?.filter((t: any) => t.status === "Active")
                   .map((t: any) => (
                     <div key={t.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-medical-200 transition-colors">
                        <p className="font-bold text-gray-900">{t.medicine?.name || "Unknown Medicine"}</p>
                        <p className="text-[10px] font-black text-medical-600 uppercase tracking-widest mt-1">{t.dosage} • {t.frequency}</p>
                     </div>
                   ))
               ) : (
                 <div className="text-center py-6 opacity-30 italic text-sm">No active medications</div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3 text-medical-700">
                 <Clipboard className="w-6 h-6" />
                 <h3 className="text-lg font-black uppercase tracking-widest text-gray-800">Investigations</h3>
              </div>
              <button onClick={() => setIsInvestigationModalOpen(true)} className="btn-secondary h-10 px-4 text-xs">
                + Order New
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-medical-50/50 text-[10px] font-black uppercase tracking-widest text-medical-600 border-b border-gray-100">
                    <th className="px-5 py-4">Test Name</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Requested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {patient?.investigations?.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-gray-900">{inv.name}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${inv.status === "Completed" ? "badge-success" : "badge-warning"}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 font-medium text-right text-xs">{new Date(inv.requestedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {(!patient?.investigations || patient.investigations.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-5 py-12 text-center opacity-40 font-medium text-sm">No clinical investigations ordered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3 text-medical-700">
                 <Brain className="w-6 h-6" />
                 <h3 className="text-lg font-black uppercase tracking-widest text-gray-800">Differential Diagnoses</h3>
              </div>
              <button onClick={() => setIsDDxModalOpen(true)} className="btn-secondary h-10 px-4 text-xs font-black">
                RE-EVALUATE
              </button>
            </div>
            <div className="space-y-4">
              {patient?.differentialDiagnoses?.map((ddx: any) => (
                <div key={ddx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-medical-200 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-gray-900 truncate">{ddx.diagnosis}</p>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">Logic: {ddx.reasoning?.slice(0, 50)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-medical-600 leading-none">{ddx.probability}%</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mt-1">CONFIDENCE</p>
                  </div>
                </div>
              ))}
              {(!patient?.differentialDiagnoses || patient.differentialDiagnoses.length === 0) && (
                <div className="text-center py-12">
                   <button onClick={() => setIsDDxModalOpen(true)} className="btn-primary px-8">
                      Generate AI DDx Suggestions
                   </button>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isDDxModalOpen} onClose={() => setIsDDxModalOpen(false)} title="Clinical DDx Engine">
        <DDxGenerator patientId={patientId} onClose={() => setIsDDxModalOpen(false)} />
      </Modal>
      <Modal isOpen={isInvestigationModalOpen} onClose={() => setIsInvestigationModalOpen(false)} title="Order Investigation">
        <InvestigationForm patientId={patientId} onClose={() => setIsInvestigationModalOpen(false)} />
      </Modal>
      <Modal isOpen={isTreatmentModalOpen} onClose={() => setIsTreatmentModalOpen(false)} title="Prescribe Medication">
        <TreatmentForm patientId={patientId} onClose={() => setIsTreatmentModalOpen(false)} />
      </Modal>
      <Modal isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)} title="Record Vitals">
        <VitalsForm patientId={patientId} onClose={() => setIsVitalsModalOpen(false)} />
      </Modal>
    </div>
  );
}

function StatCard({ icon, label, value, status }: { icon: React.ReactNode, label: string, value: string, status: "normal" | "warning" | "critical" }) {
  const statusClasses = {
    normal: "bg-white border-gray-100",
    warning: "bg-amber-50 border-amber-200 ring-4 ring-amber-100/50",
    critical: "bg-rose-50 border-rose-200 ring-4 ring-rose-100/50"
  };

  return (
    <div className={`card flex items-center space-x-5 p-5 border transition-all duration-300 ${statusClasses[status]}`}>
      <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-gray-50 text-medical-600">
        {icon}
      </div>
      <div>
        <p className="label-text mb-0.5">{label}</p>
        <p className={`text-2xl font-black ${status === "critical" ? "text-rose-700" : status === "warning" ? "text-amber-700" : "text-gray-900"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
