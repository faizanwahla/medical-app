import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { Search, Plus, Loader2, AlertCircle, Pill, ClipboardPen } from "lucide-react";
import {
  DiseaseTreatmentRecommendation,
  Medicine,
  TreatmentCreateInput,
} from "@medical-app/shared";

interface TreatmentFormProps {
  patientId: string;
  onClose: () => void;
  initialRecommendation?: DiseaseTreatmentRecommendation | null;
  onSaved?: (treatment: any) => void;
}

type PrescriptionMode = "formulary" | "manual";

export default function TreatmentForm({
  patientId,
  onClose,
  initialRecommendation = null,
  onSaved,
}: TreatmentFormProps) {
  const queryClient = useQueryClient();
  const initialMode: PrescriptionMode =
    initialRecommendation && !initialRecommendation.medicineId ? "manual" : "formulary";

  const [mode, setMode] = useState<PrescriptionMode>(initialMode);
  const [searchTerm, setSearchTerm] = useState(initialRecommendation?.medicineName || "");
  const [selectedMedicineId, setSelectedMedicineId] = useState(
    initialRecommendation?.medicineId || ""
  );
  const [medicineName, setMedicineName] = useState(
    initialRecommendation?.medicineName || ""
  );
  const [medicineType, setMedicineType] = useState("");
  const [referenceDosage, setReferenceDosage] = useState(
    initialRecommendation?.dose || ""
  );
  const [dosage, setDosage] = useState(initialRecommendation?.dose || "");
  const [frequency, setFrequency] = useState(initialRecommendation?.frequency || "");
  const [duration, setDuration] = useState(initialRecommendation?.duration || "");
  const [instructions, setInstructions] = useState(
    initialRecommendation?.instructions || ""
  );

  const { data: medicineResults, isLoading: searching } = useQuery({
    queryKey: ["medicines", searchTerm],
    queryFn: () => apiClient.getMedicines(searchTerm),
    enabled:
      mode === "formulary" &&
      searchTerm.trim().length > 1 &&
      (!selectedMedicineId ||
        searchTerm.trim().toLowerCase() !== medicineName.trim().toLowerCase()),
  });

  const mutation = useMutation({
    mutationFn: (data: TreatmentCreateInput) => apiClient.addTreatment(patientId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      onSaved?.(response?.data);
      onClose();
    },
  });

  const medicines = medicineResults?.data?.medicines || [];
  const canSubmit =
    !!dosage.trim() &&
    !!frequency.trim() &&
    !!duration.trim() &&
    ((mode === "formulary" && !!selectedMedicineId) ||
      (mode === "manual" && !!medicineName.trim()));

  const handleSelectMedicine = (medicine: Medicine) => {
    setSelectedMedicineId(medicine.id);
    setMedicineName(medicine.name);
    setMedicineType(medicine.type);
    setReferenceDosage(medicine.dosage);
    setDosage(medicine.dosage);
    setSearchTerm(medicine.name);
  };

  const clearSelection = () => {
    setSelectedMedicineId("");
    setMedicineName("");
    setMedicineType("");
    setReferenceDosage("");
    setSearchTerm("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    mutation.mutate({
      medicineId: mode === "formulary" ? selectedMedicineId : undefined,
      medicineName: medicineName.trim(),
      medicineType: mode === "manual" ? medicineType.trim() || "Custom prescription" : undefined,
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      instructions: instructions.trim() || undefined,
      startedAt: new Date(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("formulary")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            mode === "formulary"
              ? "bg-white text-sky-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Formulary
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("manual");
            setSelectedMedicineId("");
          }}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            mode === "manual"
              ? "bg-white text-sky-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Manual
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <section className="space-y-3">
          {mode === "formulary" ? (
            <>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 mb-1 block">
                  Search Medicine
                </label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <input
                    type="text"
                    className="input-modern pl-10"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedMedicineId("");
                      setMedicineName("");
                      setMedicineType("");
                      setReferenceDosage("");
                    }}
                  />
                </div>
              </div>

              {selectedMedicineId ? (
                <div className="glass-card-compact border-sky-100 bg-sky-50/50 flex items-start justify-between gap-3 py-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-white shadow-sm border border-sky-100">
                      <Pill className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sky-900 text-[13px] truncate">{medicineName}</p>
                      <p className="text-[10px] text-sky-700 font-medium">
                        {medicineType || "Formulary"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-[9px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-800"
                  >
                    Clear
                  </button>
                </div>
              ) : null}

              {searching ? (
                <div className="py-4 flex justify-center">
                  <div className="w-5 h-5 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                </div>
              ) : null}

              {medicineResults?.success && medicines.length > 0 && !selectedMedicineId ? (
                <div className="border border-slate-200/60 rounded-xl divide-y divide-slate-50 max-h-48 overflow-y-auto bg-white shadow-sm scrollbar-hide">
                  {medicines.map((medicine: Medicine) => (
                    <button
                      type="button"
                      key={medicine.id}
                      onClick={() => handleSelectMedicine(medicine)}
                      className="w-full text-left p-3 hover:bg-sky-50/50 flex items-center justify-between transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] truncate">{medicine.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{medicine.type} • {medicine.dosage}</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-sky-500 opacity-40" />
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="space-y-3 p-3 glass-card-compact border-slate-200/60">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardPen className="w-4 h-4 text-sky-500" />
                <p className="font-bold text-slate-800 text-[11px]">Manual Prescription</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Name</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="Drug name"
                    required={mode === "manual"}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Type</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={medicineType}
                    onChange={(e) => setMedicineType(e.target.value)}
                    placeholder="Category"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-3 glass-card-compact border-slate-200/60">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Dosage</label>
              <input
                type="text"
                className="input-modern"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="500mg"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Frequency</label>
              <input
                type="text"
                className="input-modern"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="BD / TID"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Duration</label>
              <input
                type="text"
                className="input-modern"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="5d"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Special Instructions</label>
            <textarea
              className="input-modern py-2 min-h-[60px]"
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Take with food..."
            />
          </div>
        </section>
      </div>

      {mutation.isError && (
        <div className="p-2 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 text-[10px] font-bold border border-rose-100">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Error finalizing order.</span>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="flex-1 btn-secondary-glass h-10 text-[11px]">
          Cancel
        </button>
        <button
          type="submit"
          className="flex-[2] btn-primary-gradient h-10 text-[11px]"
          disabled={mutation.isPending || !canSubmit}
        >
          {mutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Finalize Order</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
}
