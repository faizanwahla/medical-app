import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { Plus, Loader2, AlertCircle, Thermometer, Activity, Droplets, Heart } from "lucide-react";

interface VitalsFormProps {
  patientId: string;
  onClose: () => void;
}

export default function VitalsForm({ patientId, onClose }: VitalsFormProps) {
  const queryClient = useQueryClient();
  const [vitals, setVitals] = useState({
    temperature: "",
    pulse: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    notes: ""
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.addVital(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      onClose();
    },
    onError: (err: any) => {
      const details = err.response?.data?.details;
      const msg = details 
        ? details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ')
        : (err.response?.data?.error || err.message);
      alert("Validation Error: " + msg);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = { ...vitals };
    // Convert to numbers
    Object.keys(data).forEach(key => {
      if (!data[key]) {
        delete data[key];
      } else if (key === "temperature" || key === "oxygenSaturation") {
        data[key] = parseFloat(data[key]);
      } else if (key !== "notes") {
        data[key] = parseInt(data[key], 10);
      }
    });

    mutation.mutate(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <VitalInput 
          label="Temperature (°C)" 
          name="temperature" 
          value={vitals.temperature} 
          onChange={handleChange} 
          icon={<Thermometer className="w-4 h-4 text-red-500" />} 
          placeholder="36.5"
        />
        <VitalInput 
          label="Pulse (bpm)" 
          name="pulse" 
          value={vitals.pulse} 
          onChange={handleChange} 
          icon={<Heart className="w-4 h-4 text-rose-500" />} 
          placeholder="72"
        />
        <VitalInput 
          label="BP Systolic" 
          name="bloodPressureSystolic" 
          value={vitals.bloodPressureSystolic} 
          onChange={handleChange} 
          icon={<Activity className="w-4 h-4 text-blue-500" />} 
          placeholder="120"
        />
        <VitalInput 
          label="BP Diastolic" 
          name="bloodPressureDiastolic" 
          value={vitals.bloodPressureDiastolic} 
          onChange={handleChange} 
          icon={<Activity className="w-4 h-4 text-blue-400" />} 
          placeholder="80"
        />
        <VitalInput 
          label="Resp. Rate" 
          name="respiratoryRate" 
          value={vitals.respiratoryRate} 
          onChange={handleChange} 
          icon={<Activity className="w-4 h-4 text-green-500" />} 
          placeholder="16"
        />
        <VitalInput 
          label="SpO2 (%)" 
          name="oxygenSaturation" 
          value={vitals.oxygenSaturation} 
          onChange={handleChange} 
          icon={<Droplets className="w-4 h-4 text-cyan-500" />} 
          placeholder="98"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Notes</label>
        <textarea
          name="notes"
          className="input-field w-full"
          rows={2}
          value={vitals.notes}
          onChange={handleChange}
          placeholder="Optional notes..."
        />
      </div>

      {mutation.isError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Error recording vitals.</span>
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
              <span>Record Vitals</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function VitalInput({ label, name, value, onChange, icon, placeholder }: any) {
  return (
    <div>
      <label className="flex items-center space-x-1 text-xs font-bold text-gray-600 uppercase mb-1">
        {icon}
        <span>{label}</span>
      </label>
      <input
        type="number"
        step="any"
        name={name}
        className="input-field w-full"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
