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
  Stethoscope,
  Thermometer,
  Droplets,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Disease, DiseaseInvestigationRecommendation, DiseaseTreatmentRecommendation } from "@medical-app/shared";
import DDxGenerator from "../../components/DDxGenerator";
import DiseasePlaybookPanel from "../../components/DiseasePlaybookPanel";
import InvestigationForm from "../../components/InvestigationForm";
import Modal from "../../components/Modal";
import TreatmentForm from "../../components/TreatmentForm";
import VitalsChart from "../../components/VitalsChart";
import VitalsForm from "../../components/VitalsForm";
import { Button, Alert, Skeleton } from "../../components/ui";
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
      <div className="max-w-7xl mx-auto space-y-6 pb-10 px-4 sm:px-6">
        <div className="flex gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="flex-1">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Alert
          variant="error"
          title="Clinical Data Missing"
          message={`The system could not retrieve the records for ID: ${patientId}`}
        />
        <Button
          onClick={onBack}
          className="mt-6"
        >
          Return to Directory
        </Button>
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
          <Button
            variant="ghost"
            size="md"
            onClick={onBack}
            icon={<ArrowLeft className="w-4 h-4" />}
          />
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-medical-700 text-white flex items-center justify-center font-bold text-lg shadow-lg">
              {(patient.firstName?.[0] || "")}
              {(patient.lastName?.[0] || "")}
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 leading-none mb-2">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                <span className="px-2 py-1 bg-neutral-100 rounded-md">{patient.gender}</span>
                <span>•</span>
                <span>{patient.age} years</span>
                <span>•</span>
                <span className="text-medical-600">Rh {patient.bloodType || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsVitalsModalOpen(true)}
            size="md"
            icon={<Stethoscope className="w-4 h-4" />}
          >
            Examine Patient
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => window.print()}
            icon={<Clipboard className="w-4 h-4" />}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {workflowMessage && (
        <Alert
          variant="success"
          title="Success"
          message={workflowMessage}
          onClose={() => setWorkflowMessage(null)}
          dismissible
        />
      )}

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
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
             <VitalsChart data={patient.vitals || []} type="bp" title="Blood Pressure Monitoring" />
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
             <VitalsChart data={patient.vitals || []} type="pulse" title="Heart Rate Trending" />
          </div>
        </div>

        <div className="space-y-6">
          {/* History Panel */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <History className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900">Clinical History</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-1.5">Presenting Complaint</p>
                <p className="text-sm font-medium text-neutral-700">
                  {patient.presentingComplaint || "No data recorded"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-1.5">Medical Context</p>
                <p className="text-sm text-neutral-600 font-medium">
                  {patient.pastMedicalHistory?.join(", ") || "No significant history found"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {(patient.allergies || []).map((allergy: string) => (
                  <span key={allergy} className="inline-flex items-center gap-1 px-2 py-1 bg-error-50 border border-error-200 rounded-md text-xs font-semibold text-error-700">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Medications Panel */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-neutral-400" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900">Active Medications</h3>
              </div>
              <Button
                onClick={handleOpenBlankTreatmentForm}
                variant="ghost"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              />
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
                      className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-100 flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-neutral-800 text-xs">
                          {treatment.medicine?.name || "Unknown"}
                        </p>
                        <p className="text-xs font-semibold text-medical-600 mt-1 uppercase tracking-tight">
                          {treatment.dosage} • {treatment.frequency}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 text-neutral-400 italic text-xs font-medium">
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
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Clipboard className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900">Clinical Investigations</h3>
            </div>
            <Button
              onClick={() => setIsInvestigationModalOpen(true)}
              variant="secondary"
              size="sm"
            >
              Order Tests
            </Button>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wide text-neutral-500 border-b border-neutral-100">
                  <th className="px-3 py-2.5">Diagnostic Test</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(patient.investigations || []).map((investigation: any) => (
                  <tr key={investigation.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-neutral-800">{investigation.name}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${investigation.status === "Completed" ? "bg-success-100 text-success-700" : "bg-warning-100 text-warning-700"}`}>
                        {investigation.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-neutral-400 font-medium text-right text-xs">
                      {new Date(investigation.requestedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!patient.investigations || patient.investigations.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-3 py-10 text-center text-neutral-400 font-medium text-xs">
                      No investigation history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DDx Panel */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900">Differential Diagnosis</h3>
            </div>
            <Button
              onClick={() => setIsDDxModalOpen(true)}
              variant="secondary"
              size="sm"
            >
              Update Engine
            </Button>
          </div>

          {(patient.differentialDiagnoses || []).length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(patient.differentialDiagnoses || []).map((diagnosis: any) => (
                <button
                  key={diagnosis.id}
                  onClick={() => setSelectedDiagnosisName(diagnosis.diagnosis)}
                  className={`text-left p-3.5 rounded-lg border transition-all relative overflow-hidden group ${
                    activeDiagnosisName === diagnosis.diagnosis
                      ? "bg-medical-700 border-medical-700 text-white shadow-lg shadow-medical-700/20"
                      : "bg-neutral-50 border-neutral-100 hover:border-neutral-200 hover:bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2.5 relative z-10">
                    <p className={`font-bold truncate text-xs ${activeDiagnosisName === diagnosis.diagnosis ? "text-white" : "text-neutral-800"}`}>
                      {diagnosis.diagnosis}
                    </p>
                    <p className={`text-xs font-bold ${activeDiagnosisName === diagnosis.diagnosis ? "text-blue-300" : "text-medical-600"}`}>
                      {diagnosis.probability}%
                    </p>
                  </div>
                  <div className={`h-1.5 w-full rounded-full relative z-10 ${activeDiagnosisName === diagnosis.diagnosis ? "bg-white/10" : "bg-neutral-200"}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${activeDiagnosisName === diagnosis.diagnosis ? "bg-blue-300" : "bg-medical-600"}`}
                      style={{ width: `${diagnosis.probability}%` }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Playbook Section */}
      {selectedDisease ? (
        <div className="bg-gradient-to-br from-medical-50 to-white border border-medical-200 rounded-lg p-6 space-y-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-600 to-medical-400"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-medical-100 flex items-center justify-center text-medical-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-medical-600 mb-0.5">Standardized Clinical Playbook</p>
                <h3 className="text-xl font-bold text-neutral-900">
                  {selectedDisease.name}
                </h3>
              </div>
            </div>
            <Button
              onClick={handleOrderRecommendedWorkup}
              disabled={
                !selectedDisease.clinicalPlaybook?.investigationPlan?.length ||
                orderInvestigationMutation.isPending
              }
              loading={orderInvestigationMutation.isPending}
            >
              Order Full Protocol
            </Button>
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
  const statusConfig = {
    normal: {
      bg: "bg-white",
      border: "border-neutral-200",
      label: "text-neutral-500",
      value: "text-neutral-900",
    },
    warning: {
      bg: "bg-warning-50",
      border: "border-warning-200 ring-2 ring-warning-100",
      label: "text-warning-600",
      value: "text-warning-700",
    },
    critical: {
      bg: "bg-error-50",
      border: "border-error-200 ring-2 ring-error-100",
      label: "text-error-600",
      value: "text-error-700",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`
      flex items-center gap-4 p-4
      border rounded-lg transition-all
      ${config.bg} ${config.border}
      hover:shadow-md
    `}>
      <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wide ${config.label}`}>
          {label}
        </p>
        <p className={`text-lg font-bold truncate mt-0.5 ${config.value}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
