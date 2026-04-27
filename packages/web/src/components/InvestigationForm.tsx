import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { Plus, Loader2, AlertCircle } from "lucide-react";

interface InvestigationFormProps {
  patientId: string;
  onClose: () => void;
}

export default function InvestigationForm({ patientId, onClose }: InvestigationFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<"Lab" | "Imaging" | "ECG" | "Other">("Lab");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.createInvestigation(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({ name, type, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Test Name</label>
        <input
          type="text"
          className="input-field w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. CBC, Chest X-ray"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Category</label>
        <select 
          className="input-field w-full"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="Lab">Laboratory</option>
          <option value="Imaging">Imaging (Radiology)</option>
          <option value="ECG">ECG / Cardiac</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Notes / Indications</label>
        <textarea
          className="input-field w-full"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason for investigation..."
        />
      </div>

      {mutation.isError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Error ordering investigation.</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
        <button 
          type="submit" 
          className="flex-[2] btn-primary flex items-center justify-center space-x-2"
          disabled={mutation.isPending || !name}
        >
          {mutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Order Investigation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
