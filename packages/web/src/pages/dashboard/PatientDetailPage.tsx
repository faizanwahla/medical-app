import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  Brain,
  Clipboard,
  Heart,
  History,
  Pill,
  Plus,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  Droplets,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Clock,
} from "lucide-react";
import { Disease, DiseaseInvestigationRecommendation, DiseaseTreatmentRecommendation } from "@medical-app/shared";
import DDxGenerator from "../../components/DDxGenerator";
import DiseasePlaybookPanel from "../../components/DiseasePlaybookPanel";
import InvestigationForm from "../../components/InvestigationForm";
import Modal from "../../components/Modal";
import TreatmentForm from "../../components/TreatmentForm";
import VitalsChart from "../../components/VitalsChart";
import VitalsForm from "../../components/VitalsForm";
import apiClient from "../../lib/api";
import { useAppSettingsStore } from "../../lib/store";

interface PatientDetailPageProps {
  patientId: string;
  onBack: () => void;
}

export default function PatientDetailPage({ patientId, onBack }: PatientDetailPageProps) {
  const queryClient = useQueryClient();
  const [isDDxModalOpen, setIsDDxModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedDiagnosisName, setSelectedDiagnosisName] = useState<string | null>(null);
  const [pendingTreatmentRecommendation, setPendingTreatmentRecommendation] =
    useState<DiseaseTreatmentRecommendation | null>(null);
  const [workflowMessage, setWorkflowMessage] = useState<string | null>(null);
  const {
    feverThreshold,
    tachycardiaThreshold,
    hypoxiaThreshold,
    systolicHypertensionThreshold,
    confirmBeforeCarePlanOrders,
    showReferenceDetails,
  } = useAppSettingsStore();

  const { data: patientResponse, isLoading, isError } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => apiClient.getPatient(patientId),
  });

  const { data: diseaseLibraryResponse } = useQuery({
    queryKey: ["diseases"],
    queryFn: () => apiClient.getDiseases(),
  });

  const patient = patientResponse?.data;
  const diseases = (diseaseLibraryResponse?.data || []) as Disease[];

  const activeDiagnosisName =
    patient?.differentialDiagnoses?.some(
      (diagnosis: { diagnosis: string }) => diagnosis.diagnosis === selectedDiagnosisName
    )
      ? selectedDiagnosisName
      : patient?.differentialDiagnoses?.[0]?.diagnosis || null;

  const selectedDisease =
    diseases.find((disease) => disease.name === activeDiagnosisName) || null;

  const orderInvestigationMutation = useMutation({
    mutationFn: (recommendation: DiseaseInvestigationRecommendation) =>
      apiClient.createInvestigation(patientId, {
        name: recommendation.name,
        type: recommendation.type,
        notes: recommendation.reason,
      }),
    onSuccess: (_, recommendation) => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      setWorkflowMessage(`Ordered ${recommendation.name}.`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
          Accessing Clinical Records...
        </p>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="card border-red-100 bg-red-50 p-10 text-center">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700">Clinical Data Missing</h2>
        <p className="text-red-600 mb-6">
          The system could not retrieve the records for ID: {patientId}
        </p>
        <button onClick={onBack} className="btn-primary">
          Return to Directory
        </button>
      </div>
    );
  }

  const latestVital = patient.vitals?.[0];
  const existingInvestigationNames = (patient.investigations || []).map(
    (investigation: { name: string }) => investigation.name
  );
  const existingTreatmentMedicineIds = (patient.treatments || [])
    .filter((treatment: { status: string }) => treatment.status === "Active")
    .map((treatment: { medicineId: string }) => treatment.medicineId);
  const existingTreatmentNames = (patient.treatments || [])
    .filter((treatment: { status: string }) => treatment.status === "Active")
    .map((treatment: { medicine?: { name?: string | null } }) => treatment.medicine?.name)
    .filter(Boolean) as string[];

  const handleOrderInvestigation = async (
    recommendation: DiseaseInvestigationRecommendation
  ) => {
    const exists = existingInvestigationNames.some(
      (name: string) => name.toLowerCase() === recommendation.name.toLowerCase()
    );

    if (exists) {
      setWorkflowMessage(`${recommendation.name} is already on the chart.`);
      return;
    }

    if (
      confirmBeforeCarePlanOrders &&
      !window.confirm(`Order ${recommendation.name} for this patient?`)
    ) {
      return;
    }

    await orderInvestigationMutation.mutateAsync(recommendation);
  };

  const handleOrderRecommendedWorkup = async () => {
    if (!selectedDisease?.clinicalPlaybook?.investigationPlan?.length) {
      return;
    }

    const pendingRecommendations = selectedDisease.clinicalPlaybook.investigationPlan.filter(
      (recommendation) =>
        !existingInvestigationNames.some(
          (name: string) => name.toLowerCase() === recommendation.name.toLowerCase()
        )
    );

    if (!pendingRecommendations.length) {
      setWorkflowMessage("All recommended investigations are already present.");
      return;
    }

    if (
      confirmBeforeCarePlanOrders &&
      !window.confirm(
        `Order ${pendingRecommendations.length} recommended investigations for ${selectedDisease.name}?`
      )
    ) {
      return;
    }

    await Promise.all(
      pendingRecommendations.map((recommendation) =>
        apiClient.createInvestigation(patientId, {
          name: recommendation.name,
          type: recommendation.type,
          notes: recommendation.reason,
        })
      )
    );

    queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
    setWorkflowMessage(
      `Applied the recommended workup bundle for ${selectedDisease.name}.`
    );
  };

  const handleStartTreatment = (
    recommendation: DiseaseTreatmentRecommendation
  ) => {
    const alreadyActive =
      (!!recommendation.medicineId &&
        existingTreatmentMedicineIds.includes(recommendation.medicineId)) ||
      existingTreatmentNames.some(
        (name) => name.toLowerCase() === recommendation.medicineName.toLowerCase()
      );
    if (alreadyActive) {
      setWorkflowMessage(`${recommendation.medicineName} is already active.`);
      return;
    }
    setPendingTreatmentRecommendation(recommendation);
    setIsTreatmentModalOpen(true);
  };

  const handleOpenBlankTreatmentForm = () => {
    setPendingTreatmentRecommendation(null);
    setIsTreatmentModalOpen(true);
  };

  const handleCloseTreatmentModal = () => {
    setIsTreatmentModalOpen(false);
    setPendingTreatmentRecommendation(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-900" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xl shadow-slate-900/10">
              {(patient.firstName?.[0] || "")}
              {(patient.lastName?.[0] || "")}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-2">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="badge-premium bg-slate-100 border-slate-200 text-slate-600">{patient.gender}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{patient.age} years</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-indigo-600">Rh {patient.bloodType || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsVitalsModalOpen(true)}
            className="btn-primary-gradient px-5 h-10"
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            <span>Examine Patient</span>
          </button>
          <button
            onClick={() => window.print()}
            className="btn-secondary-glass px-4 h-10"
          >
            <Clipboard className="w-4 h-4 text-slate-400 mr-2" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {workflowMessage ? (
        <div className="bg-indigo-600 text-white flex items-center justify-between gap-4 py-3 px-5 rounded-xl shadow-lg shadow-indigo-600/10 animate-fade-in">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-200" />
            <p className="text-sm font-medium">{workflowMessage}</p>
          </div>
          <button
            onClick={() => setWorkflowMessage(null)}
            className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Thermometer className="w-4 h-4 text-slate-500" />}
          label="Temperature"
          value={latestVital?.temperature ? `${latestVital.temperature}°C` : "--"}
          status={
            latestVital?.temperature && latestVital.temperature >= feverThreshold
              ? "critical"
              : "normal"
          }
        />
        <StatCard
          icon={<Heart className="w-4 h-4 text-slate-500" />}
          label="Pulse Rate"
          value={latestVital?.pulse ? `${latestVital.pulse} bpm` : "--"}
          status={
            latestVital?.pulse &&
            (latestVital.pulse >= tachycardiaThreshold || latestVital.pulse < 60)
              ? "warning"
              : "normal"
          }
        />
        <StatCard
          icon={<Activity className="w-4 h-4 text-slate-500" />}
          label="Blood Pressure"
          value={
            latestVital?.bloodPressureSystolic
              ? `${latestVital.bloodPressureSystolic}/${latestVital.bloodPressureDiastolic}`
              : "--"
          }
          status={
            latestVital?.bloodPressureSystolic &&
            latestVital.bloodPressureSystolic >= systolicHypertensionThreshold
              ? "warning"
              : "normal"
          }
        />
        <StatCard
          icon={<Droplets className="w-4 h-4 text-slate-500" />}
          label="Oxygen Saturation"
          value={latestVital?.oxygenSaturation ? `${latestVital.oxygenSaturation}%` : "--"}
          status={
            latestVital?.oxygenSaturation &&
            latestVital.oxygenSaturation <= hypoxiaThreshold
              ? "critical"
              : "normal"
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
             <VitalsChart data={patient.vitals || []} type="bp" title="Blood Pressure Monitoring" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
             <VitalsChart data={patient.vitals || []} type="pulse" title="Heart Rate Trending" />
          </div>
        </div>

        <div className="space-y-6">
          {/* History Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-3">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Clinical History</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Presenting Complaint</p>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {patient.presentingComplaint || "No data recorded"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Medical Context</p>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {patient.pastMedicalHistory?.join(", ") || "No significant history found"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {(patient.allergies || []).map((allergy: string) => (
                  <span key={allergy} className="badge-premium badge-error">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Medications Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Pill className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Active Medications</h3>
              </div>
              <button
                onClick={handleOpenBlankTreatmentForm}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors border border-transparent hover:border-slate-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {(patient.treatments || []).filter(
                (treatment: { status: string }) => treatment.status === "Active"
              ).length > 0 ? (
                (patient.treatments || [])
                  .filter((treatment: { status: string }) => treatment.status === "Active")
                  .map((treatment: any) => (
                    <div
                      key={treatment.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-xs">
                          {treatment.medicine?.name || "Unknown"}
                        </p>
                        <p className="text-[10px] font-bold text-indigo-600 mt-1 uppercase tracking-tight">
                          {treatment.dosage} • {treatment.frequency}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 opacity-40 italic text-xs font-medium">
                  No active pharmaceutical orders
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Investigation & DDx Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investigations */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Clipboard className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Clinical Investigations</h3>
            </div>
            <button
              onClick={() => setIsInvestigationModalOpen(true)}
              className="btn-secondary-glass px-4 py-1.5 text-[11px]"
            >
              Order Tests
            </button>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50">
                  <th className="px-3 py-2.5">Diagnostic Test</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(patient.investigations || []).map((investigation: any) => (
                  <tr key={investigation.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-800">{investigation.name}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={investigation.status === "Completed" ? "badge-premium badge-success" : "badge-premium badge-warning"}>
                        {investigation.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-400 font-medium text-right text-xs">
                      {new Date(investigation.requestedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!patient.investigations || patient.investigations.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-3 py-10 text-center opacity-40 font-medium text-xs">
                      No investigation history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DDx Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Brain className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Differential Diagnosis</h3>
            </div>
            <button
              onClick={() => setIsDDxModalOpen(true)}
              className="btn-secondary-glass px-4 py-1.5 text-[11px]"
            >
              Update Engine
            </button>
          </div>

          {(patient.differentialDiagnoses || []).length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(patient.differentialDiagnoses || []).map((diagnosis: any) => (
                <button
                  key={diagnosis.id}
                  onClick={() => setSelectedDiagnosisName(diagnosis.diagnosis)}
                  className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${
                    activeDiagnosisName === diagnosis.diagnosis
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10"
                      : "bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2.5 relative z-10">
                    <p className={`font-bold truncate text-xs ${activeDiagnosisName === diagnosis.diagnosis ? "text-white" : "text-slate-800"}`}>
                      {diagnosis.diagnosis}
                    </p>
                    <p className={`text-[11px] font-bold ${activeDiagnosisName === diagnosis.diagnosis ? "text-indigo-400" : "text-indigo-600"}`}>
                      {diagnosis.probability}%
                    </p>
                  </div>
                  <div className={`h-1.5 w-full rounded-full relative z-10 ${activeDiagnosisName === diagnosis.diagnosis ? "bg-white/10" : "bg-slate-200"}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${activeDiagnosisName === diagnosis.diagnosis ? "bg-indigo-400" : "bg-indigo-600"}`} 
                      style={{ width: `${diagnosis.probability}%` }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
              <Brain className="w-12 h-12 text-slate-200 mb-4" />
              <button onClick={() => setIsDDxModalOpen(true)} className="btn-primary-gradient px-6 py-2.5">
                Initialize DDx Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Playbook Section */}
      {selectedDisease ? (
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-8 space-y-6 shadow-xl shadow-indigo-100/20 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-50 pb-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <BookOpen className="w-6 h-6" />
               </div>
               <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1">Standardized Clinical Playbook</p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {selectedDisease.name}
                </h3>
              </div>
            </div>
            <button
              onClick={handleOrderRecommendedWorkup}
              disabled={
                !selectedDisease.clinicalPlaybook?.investigationPlan?.length ||
                orderInvestigationMutation.isPending
              }
              className="btn-primary-gradient px-8 py-3"
            >
              Order Full Protocol
            </button>
          </div>

          <DiseasePlaybookPanel
            disease={selectedDisease}
            existingInvestigationNames={existingInvestigationNames}
            existingTreatmentMedicineIds={existingTreatmentMedicineIds}
            existingTreatmentNames={existingTreatmentNames}
            onOrderInvestigation={handleOrderInvestigation}
            onStartTreatment={handleStartTreatment}
            isOrderingInvestigation={orderInvestigationMutation.isPending}
            showReference={showReferenceDetails}
          />
        </div>
      ) : null}

      {/* Modals */}
      <Modal isOpen={isDDxModalOpen} onClose={() => setIsDDxModalOpen(false)} title="Diagnostic Decision Support">
        <DDxGenerator patientId={patientId} patient={patient} onClose={() => setIsDDxModalOpen(false)} />
      </Modal>
      <Modal isOpen={isInvestigationModalOpen} onClose={() => setIsInvestigationModalOpen(false)} title="Clinical Order Entry">
        <InvestigationForm patientId={patientId} onClose={() => setIsInvestigationModalOpen(false)} />
      </Modal>
      <Modal isOpen={isTreatmentModalOpen} onClose={handleCloseTreatmentModal} title="Pharma Order Entry">
        <TreatmentForm
          patientId={patientId}
          initialRecommendation={pendingTreatmentRecommendation}
          onClose={handleCloseTreatmentModal}
          onSaved={(treatment) => setWorkflowMessage(`Pharmaceutical order for ${treatment?.medicine?.name || "medicine"} verified and started.`)}
        />
      </Modal>
      <Modal isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)} title="Clinical Physical Examination">
        <VitalsForm patientId={patientId} onClose={() => setIsVitalsModalOpen(false)} />
      </Modal>
    </div>
  );
}

function StatCard({ icon, label, value, status }: { icon: React.ReactNode; label: string; value: string; status: "normal" | "warning" | "critical"; }) {
  const statusClasses = {
    normal: "bg-white border-slate-200",
    warning: "bg-amber-50/50 border-amber-200 ring-4 ring-amber-100/10",
    critical: "bg-rose-50/50 border-rose-200 ring-4 ring-rose-100/10",
  };

  const textClasses = {
    normal: "text-slate-900",
    warning: "text-amber-700",
    critical: "text-rose-700",
  };

  return (
    <div className={`flex items-center space-x-4 p-4 border rounded-2xl transition-all duration-300 ${statusClasses[status]} shadow-sm hover:shadow-md`}>
      <div className={`w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0 ${status !== "normal" && "animate-pulse"}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 truncate">{label}</p>
        <p className={`text-lg font-bold truncate tracking-tight ${textClasses[status]}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
