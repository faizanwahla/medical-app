import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { Plus, X, Brain, AlertCircle, Loader2 } from "lucide-react";

interface DDxGeneratorProps {
  patientId: string;
  onClose: () => void;
}

export default function DDxGenerator({ patientId, onClose }: DDxGeneratorProps) {
  const queryClient = useQueryClient();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [signs, setSigns] = useState<string[]>([]);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  
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
    <div className="space-y-6">
      <div className="bg-medical-50 p-4 rounded-xl border border-medical-100 flex items-start space-x-3">
        <Brain className="w-6 h-6 text-medical-600 mt-1" />
        <div>
          <h4 className="font-semibold text-medical-900">Diagnosis Engine</h4>
          <p className="text-sm text-medical-700">
            Enter clinical findings to generate AI-powered differential diagnosis suggestions.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Symptoms */}
        <section>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms (Patient's complaints)</label>
          <form onSubmit={handleAddSymptom} className="flex gap-2 mb-2">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="e.g. fever, cough, chest pain"
              className="flex-1 input-field"
            />
            <button type="submit" className="p-2 bg-medical-100 text-medical-700 rounded-lg hover:bg-medical-200">
              <Plus className="w-5 h-5" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {symptoms.map(s => (
              <Tag key={s} label={s} onRemove={() => removeTag(symptoms, setSymptoms, s)} color="blue" />
            ))}
          </div>
        </section>

        {/* Signs */}
        <section>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Signs (Physical examination findings)</label>
          <form onSubmit={handleAddSign} className="flex gap-2 mb-2">
            <input
              type="text"
              value={signInput}
              onChange={(e) => setSignInput(e.target.value)}
              placeholder="e.g. rales, jaundice, tachycardia"
              className="flex-1 input-field"
            />
            <button type="submit" className="p-2 bg-medical-100 text-medical-700 rounded-lg hover:bg-medical-200">
              <Plus className="w-5 h-5" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {signs.map(s => (
              <Tag key={s} label={s} onRemove={() => removeTag(signs, setSigns, s)} color="green" />
            ))}
          </div>
        </section>

        {/* Risk Factors */}
        <section>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Factors & Epidemiology</label>
          <form onSubmit={handleAddRiskFactor} className="flex gap-2 mb-2">
            <input
              type="text"
              value={riskFactorInput}
              onChange={(e) => setRiskFactorInput(e.target.value)}
              placeholder="e.g. smoker, diabetes, travel history"
              className="flex-1 input-field"
            />
            <button type="submit" className="p-2 bg-medical-100 text-medical-700 rounded-lg hover:bg-medical-200">
              <Plus className="w-5 h-5" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {riskFactors.map(rf => (
              <Tag key={rf} label={rf} onRemove={() => removeTag(riskFactors, setRiskFactors, rf)} color="purple" />
            ))}
          </div>
        </section>
      </div>

      {mutation.isError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Error generating suggestions. Please try again.</span>
        </div>
      )}

      <div className="pt-4 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 btn-secondary"
          disabled={mutation.isPending}
        >
          Cancel
        </button>
        <button
          onClick={handleGenerate}
          className="flex-[2] btn-primary flex items-center justify-center space-x-2"
          disabled={mutation.isPending || (symptoms.length === 0 && signs.length === 0)}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Findings...</span>
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              <span>Generate DDx Suggestions</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Tag({ label, onRemove, color }: { label: string, onRemove: () => void, color: "blue" | "green" | "purple" }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[color]}`}>
      {label}
      <button onClick={onRemove} className="ml-2 hover:text-black">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
