import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { Search, Plus, Loader2, AlertCircle, Pill } from "lucide-react";
import { Medicine } from "@medical-app/shared";

interface TreatmentFormProps {
  patientId: string;
  onClose: () => void;
}

export default function TreatmentForm({ patientId, onClose }: TreatmentFormProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");

  const { data: medicineResults, isLoading: searching } = useQuery({
    queryKey: ["medicines", searchTerm],
    queryFn: () => apiClient.getMedicines(searchTerm),
    enabled: searchTerm.length > 1,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.addTreatment(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine || !dosage || !frequency) return;
    
    mutation.mutate({
      medicineId: selectedMedicine.id,
      dosage,
      frequency,
      duration,
      instructions,
      status: "Active",
      startedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Medicine Search */}
      <section>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Search Medicine</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field w-full pl-10"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (selectedMedicine) setSelectedMedicine(null);
            }}
          />
        </div>

        {searching && (
          <div className="mt-2 text-center py-2">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-medical-600" />
          </div>
        )}

        {medicineResults?.success && medicineResults.data.length > 0 && !selectedMedicine && (
          <div className="mt-2 border rounded-lg divide-y max-h-48 overflow-y-auto bg-white shadow-sm">
            {medicineResults.data.map((med: Medicine) => (
              <button
                key={med.id}
                onClick={() => {
                  setSelectedMedicine(med);
                  setDosage(med.dosage);
                  setSearchTerm(med.name);
                }}
                className="w-full text-left p-3 hover:bg-medical-50 flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{med.name}</p>
                  <p className="text-xs text-gray-500">{med.type}</p>
                </div>
                <Plus className="w-4 h-4 text-medical-600" />
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedMedicine && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-3 bg-medical-50 rounded-lg border border-medical-100 flex items-center space-x-3">
            <div className="p-2 bg-white rounded-full">
              <Pill className="w-5 h-5 text-medical-600" />
            </div>
            <div>
              <p className="font-bold text-medical-900">{selectedMedicine.name}</p>
              <p className="text-xs text-medical-700">Standard: {selectedMedicine.dosage}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Dosage</label>
              <input
                type="text"
                className="input-field w-full"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500mg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Frequency</label>
              <input
                type="text"
                className="input-field w-full"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. TID, BD"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Duration</label>
              <input
                type="text"
                className="input-field w-full"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 7 days"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Instructions</label>
              <input
                type="text"
                className="input-field w-full"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. After food"
              />
            </div>
          </div>

          {mutation.isError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Error adding treatment.</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button 
              type="submit" 
              className="flex-[2] btn-primary flex items-center justify-center space-x-2"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Start Treatment</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
