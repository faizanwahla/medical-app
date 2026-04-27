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

  const startTreatmentMutation = useMutation({
    mutationFn: (recommendation: DiseaseTreatmentRecommendation) => {
      if (!recommendation.medicineId) {
        throw new Error(`${recommendation.medicineName} is not linked to the current formulary.`);
      }

      return apiClient.addTreatment(patientId, {
        medicineId: recommendation.medicineId,
        dosage: recommendation.dose,
        frequency: recommendation.frequency,
        duration: recommendation.duration,
        instructions: recommendation.instructions,
        startedAt: new Date().toISOString(),
      });
    },
    onSuccess: (_, recommendation) => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      setWorkflowMessage(`Started ${recommendation.medicineName}.`);
    },
    onError: (error: Error) => {
      setWorkflowMessage(error.message);
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

  const handleStartTreatment = async (
    recommendation: DiseaseTreatmentRecommendation
  ) => {
    if (!recommendation.medicineId) {
      setWorkflowMessage(
        `${recommendation.medicineName} is not linked to the current formulary.`
      );
      return;
    }

    const alreadyActive = existingTreatmentMedicineIds.includes(
      recommendation.medicineId
    );
    if (alreadyActive) {
      setWorkflowMessage(`${recommendation.medicineName} is already active.`);
      return;
    }

    if (
      confirmBeforeCarePlanOrders &&
      !window.confirm(
        `Start ${recommendation.medicineName} (${recommendation.dose}, ${recommendation.frequency})?`
      )
    ) {
      return;
    }

    await startTreatmentMutation.mutateAsync(recommendation);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={onBack}
            className="p-3 bg-white hover:bg-gray-100 rounded-2xl shadow-sm border border-gray-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-medical-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-medical-200">
              {(patient.firstName?.[0] || "")}
              {(patient.lastName?.[0] || "")}
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex items-center space-x-2 text-sm font-bold text-gray-500 mt-1">
                <span>{patient.gender}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{patient.age} Years</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="text-medical-600 font-black tracking-widest uppercase text-[10px]">
                  Blood {patient.bloodType || "N/A"}
                </span>
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

      {workflowMessage ? (
        <div className="card border border-medical-100 bg-medical-50 text-medical-900 flex items-center justify-between gap-4">
          <p className="font-medium">{workflowMessage}</p>
          <button
            onClick={() => setWorkflowMessage(null)}
            className="text-xs font-black uppercase tracking-widest text-medical-600"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Thermometer className="w-5 h-5 text-red-500" />}
          label="Temperature"
          value={latestVital?.temperature ? `${latestVital.temperature} deg C` : "--"}
          status={
            latestVital?.temperature && latestVital.temperature >= feverThreshold
              ? "critical"
              : "normal"
          }
        />
        <StatCard
          icon={<Heart className="w-5 h-5 text-rose-500" />}
          label="Pulse"
          value={latestVital?.pulse ? `${latestVital.pulse} bpm` : "--"}
          status={
            latestVital?.pulse &&
            (latestVital.pulse >= tachycardiaThreshold || latestVital.pulse < 60)
              ? "warning"
              : "normal"
          }
        />
        <StatCard
          icon={<Activity className="w-5 h-5 text-blue-500" />}
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
          icon={<Droplets className="w-5 h-5 text-cyan-500" />}
          label="SpO2"
          value={latestVital?.oxygenSaturation ? `${latestVital.oxygenSaturation}%` : "--"}
          status={
            latestVital?.oxygenSaturation &&
            latestVital.oxygenSaturation <= hypoxiaThreshold
              ? "critical"
              : "normal"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <VitalsChart data={patient.vitals || []} type="bp" title="Blood Pressure Analytics" />
          <VitalsChart data={patient.vitals || []} type="pulse" title="Heart Rate Analytics" />
        </div>

        <div className="space-y-8">
          <div className="card space-y-6">
            <div className="flex items-center space-x-3 text-medical-700">
              <History className="w-6 h-6" />
              <h3 className="text-lg font-black uppercase tracking-widest text-gray-800">
                Clinical Data
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-text">Presenting Complaint</label>
                <p className="text-gray-900 font-medium leading-relaxed">
                  {patient.presentingComplaint || "No data recorded"}
                </p>
              </div>
              <div>
                <label className="label-text">Medical History</label>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  {patient.pastMedicalHistory?.join(", ") || "No history found"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(patient.allergies || []).map((allergy: string) => (
                  <span key={allergy} className="badge-error">
                    Allergy: {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-medical-700">
                <Pill className="w-6 h-6" />
                <h3 className="text-lg font-black uppercase tracking-widest text-gray-800">
                  Treatments
                </h3>
              </div>
              <button
                onClick={() => setIsTreatmentModalOpen(true)}
                className="p-2 hover:bg-medical-50 rounded-lg text-medical-600"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {(patient.treatments || []).filter(
                (treatment: { status: string }) => treatment.status === "Active"
              ).length > 0 ? (
                (patient.treatments || [])
                  .filter((treatment: { status: string }) => treatment.status === "Active")
                  .map((treatment: any) => (
                    <div
                      key={treatment.id}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-medical-200 transition-colors"
                    >
                      <p className="font-bold text-gray-900">
                        {treatment.medicine?.name || "Unknown Medicine"}
                      </p>
                      <p className="text-[10px] font-black text-medical-600 uppercase tracking-widest mt-1">
                        {treatment.dosage} • {treatment.frequency}
                      </p>
                      {treatment.instructions ? (
                        <p className="text-xs text-gray-500 mt-2">{treatment.instructions}</p>
                      ) : null}
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 opacity-30 italic text-sm">
                  No active medications
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3 text-medical-700">
              <Clipboard className="w-6 h-6" />
              <h3 className="text-lg font-black uppercase tracking-widest text-gray-800">
                Investigations
              </h3>
            </div>
            <button
              onClick={() => setIsInvestigationModalOpen(true)}
              className="btn-secondary h-10 px-4 text-xs"
            >
              Order New
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
                {(patient.investigations || []).map((investigation: any) => (
                  <tr key={investigation.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{investigation.name}</p>
                      {investigation.notes ? (
                        <p className="text-xs text-gray-500 mt-1">{investigation.notes}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge ${
                          investigation.status === "Completed"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {investigation.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 font-medium text-right text-xs">
                      {new Date(investigation.requestedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!patient.investigations || patient.investigations.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center opacity-40 font-medium text-sm">
                      No clinical investigations ordered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-medical-700">
              <Brain className="w-6 h-6" />
              <h3 className="text-lg font-black uppercase tracking-widest text-gray-800">
                Differential Diagnoses
              </h3>
            </div>
            <button
              onClick={() => setIsDDxModalOpen(true)}
              className="btn-secondary h-10 px-4 text-xs font-black"
            >
              Re-evaluate
            </button>
          </div>

          {(patient.differentialDiagnoses || []).length ? (
            <div className="space-y-3">
              {(patient.differentialDiagnoses || []).map((diagnosis: any) => (
                <button
                  key={diagnosis.id}
                  onClick={() => setSelectedDiagnosisName(diagnosis.diagnosis)}
                  className={`w-full text-left flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                    activeDiagnosisName === diagnosis.diagnosis
                      ? "bg-medical-50 border-medical-200"
                      : "bg-gray-50 border-gray-100 hover:border-medical-200"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-gray-900 truncate">{diagnosis.diagnosis}</p>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">
                      Logic: {diagnosis.reasoning?.slice(0, 80)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-medical-600 leading-none">
                      {diagnosis.probability}%
                    </p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mt-1">
                      Confidence
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <button onClick={() => setIsDDxModalOpen(true)} className="btn-primary px-8">
                Generate AI DDx Suggestions
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedDisease ? (
        <div className="card space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-medical-600">
                Diagnosis Playbook
              </p>
              <h3 className="text-2xl font-black tracking-tight text-gray-900 mt-1">
                {selectedDisease.name}
              </h3>
            </div>
            <button
              onClick={handleOrderRecommendedWorkup}
              disabled={
                !selectedDisease.clinicalPlaybook?.investigationPlan?.length ||
                orderInvestigationMutation.isPending
              }
              className="btn-primary"
            >
              Apply Recommended Workup
            </button>
          </div>

          <DiseasePlaybookPanel
            disease={selectedDisease}
            existingInvestigationNames={existingInvestigationNames}
            existingTreatmentMedicineIds={existingTreatmentMedicineIds}
            onOrderInvestigation={handleOrderInvestigation}
            onStartTreatment={handleStartTreatment}
            isOrderingInvestigation={orderInvestigationMutation.isPending}
            isStartingTreatment={startTreatmentMutation.isPending}
            showReference={showReferenceDetails}
          />
        </div>
      ) : null}

      <Modal
        isOpen={isDDxModalOpen}
        onClose={() => setIsDDxModalOpen(false)}
        title="Clinical DDx Engine"
      >
        <DDxGenerator patientId={patientId} onClose={() => setIsDDxModalOpen(false)} />
      </Modal>
      <Modal
        isOpen={isInvestigationModalOpen}
        onClose={() => setIsInvestigationModalOpen(false)}
        title="Order Investigation"
      >
        <InvestigationForm
          patientId={patientId}
          onClose={() => setIsInvestigationModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isTreatmentModalOpen}
        onClose={() => setIsTreatmentModalOpen(false)}
        title="Prescribe Medication"
      >
        <TreatmentForm patientId={patientId} onClose={() => setIsTreatmentModalOpen(false)} />
      </Modal>
      <Modal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        title="Record Vitals"
      >
        <VitalsForm patientId={patientId} onClose={() => setIsVitalsModalOpen(false)} />
      </Modal>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: "normal" | "warning" | "critical";
}) {
  const statusClasses = {
    normal: "bg-white border-gray-100",
    warning: "bg-amber-50 border-amber-200 ring-4 ring-amber-100/50",
    critical: "bg-rose-50 border-rose-200 ring-4 ring-rose-100/50",
  };

  return (
    <div
      className={`card flex items-center space-x-5 p-5 border transition-all duration-300 ${statusClasses[status]}`}
    >
      <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-gray-50 text-medical-600">
        {icon}
      </div>
      <div>
        <p className="label-text mb-0.5">{label}</p>
        <p
          className={`text-2xl font-black ${
            status === "critical"
              ? "text-rose-700"
              : status === "warning"
                ? "text-amber-700"
                : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
