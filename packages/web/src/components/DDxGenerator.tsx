import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { Plus, X, Brain, AlertCircle } from "lucide-react";

interface DDxGeneratorPatientData {
  presentingComplaint?: string | null;
  examFindings?: string | null;
  pastMedicalHistory?: string[];
}

interface DDxGeneratorProps {
  patientId: string;
  patient?: DDxGeneratorPatientData | null;
  onClose: () => void;
}

function parseClinicalList(value?: string | null): string[] {
  return (value || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueValues(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = value.toLowerCase();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(value);
  });

  return result;
}

export default function DDxGenerator({ patientId, patient, onClose }: DDxGeneratorProps) {
  const queryClient = useQueryClient();
  const [symptoms, setSymptoms] = useState<string[]>(() =>
    uniqueValues(parseClinicalList(patient?.presentingComplaint))
  );
  const [signs, setSigns] = useState<string[]>(() =>
    uniqueValues(parseClinicalList(patient?.examFindings))
  );
  const [riskFactors, setRiskFactors] = useState<string[]>(() =>
    uniqueValues(patient?.pastMedicalHistory || [])
  );
  
  const [symptomInput, setSymptomInput] = useState("");
  const [signInput, setSignInput] = useState("");
  const [riskFactorInput, setRiskFactorInput] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.generateDDx(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      onClose();
    },
  });

  const handleAddSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput("");
    }
  };

  const handleAddSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (signInput.trim() && !signs.includes(signInput.trim())) {
      setSigns([...signs, signInput.trim()]);
      setSignInput("");
    }
  };

  const handleAddRiskFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (riskFactorInput.trim() && !riskFactors.includes(riskFactorInput.trim())) {
      setRiskFactors([...riskFactors, riskFactorInput.trim()]);
      setRiskFactorInput("");
    }
  };

  const handleGenerate = () => {
    mutation.mutate({
      symptoms,
      signs,
      riskFactors,
    });
  };

  const removeTag = (list: string[], setList: (l: string[]) => void, item: string) => {
    setList(list.filter(i => i !== item));
  };

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-start space-x-3">
        <Brain className="w-5 h-5 text-indigo-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-indigo-900">Clinical Reasoning Engine</h4>
          <p className="text-[11px] text-indigo-700 leading-normal font-medium">
            Automated analysis of current patient vitals, medical history, and clinical signs.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Symptoms */}
        <section className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Reported Symptoms</label>
          <form onSubmit={handleAddSymptom} className="flex gap-2">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="e.g. Sharp chest pain"
              className="flex-1 input-modern h-10"
            />
            <button type="submit" className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 border border-slate-200 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {symptoms.map(s => (
              <Tag key={s} label={s} onRemove={() => removeTag(symptoms, setSymptoms, s)} type="info" />
            ))}
          </div>
        </section>

        {/* Signs */}
        <section className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Clinical Signs</label>
          <form onSubmit={handleAddSign} className="flex gap-2">
            <input
              type="text"
              value={signInput}
              onChange={(e) => setSignInput(e.target.value)}
              placeholder="e.g. Bilateral wheezing"
              className="flex-1 input-modern h-10"
            />
            <button type="submit" className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 border border-slate-200 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {signs.map(s => (
              <Tag key={s} label={s} onRemove={() => removeTag(signs, setSigns, s)} type="success" />
            ))}
          </div>
        </section>

        {/* Risk Factors */}
        <section className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Comorbidities & Risks</label>
          <form onSubmit={handleAddRiskFactor} className="flex gap-2">
            <input
              type="text"
              value={riskFactorInput}
              onChange={(e) => setRiskFactorInput(e.target.value)}
              placeholder="e.g. Hypertension"
              className="flex-1 input-modern h-10"
            />
            <button type="submit" className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 border border-slate-200 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {riskFactors.map(rf => (
              <Tag key={rf} label={rf} onRemove={() => removeTag(riskFactors, setRiskFactors, rf)} type="warning" />
            ))}
          </div>
        </section>
      </div>

      {mutation.isError && (
        <div className="p-3 bg-rose-50 text-rose-700 rounded-xl flex items-center space-x-3 text-xs font-bold border border-rose-100 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>The diagnostic engine encountered an error. Please verify clinical data.</span>
        </div>
      )}

      <div className="pt-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 btn-secondary-glass h-10"
          disabled={mutation.isPending}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          className="flex-[2] btn-primary-gradient h-10"
          disabled={mutation.isPending || (symptoms.length === 0 && signs.length === 0)}
        >
          {mutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing Pathophysiology...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span>Run DDx Engine</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

function Tag({ label, onRemove, type }: { label: string, onRemove: () => void, type: "info" | "success" | "warning" }) {
  const typeMap = {
    info: "badge-info",
    success: "badge-success",
    warning: "badge-warning"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${typeMap[type]}`}>
      {label}
      <button type="button" onClick={onRemove} className="hover:text-rose-500 transition-colors">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}
