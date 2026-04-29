import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { Plus, AlertCircle, Thermometer, Activity, Droplets, Heart } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <VitalInput 
          label="Temperature" 
          name="temperature" 
          value={vitals.temperature} 
          onChange={handleChange} 
          icon={<Thermometer className="w-3.5 h-3.5 text-rose-500" />} 
          placeholder="36.5"
          suffix="°C"
        />
        <VitalInput 
          label="Pulse" 
          name="pulse" 
          value={vitals.pulse} 
          onChange={handleChange} 
          icon={<Heart className="w-3.5 h-3.5 text-rose-600" />} 
          placeholder="72"
          suffix="bpm"
        />
        <VitalInput 
          label="BP (Systolic)" 
          name="bloodPressureSystolic" 
          value={vitals.bloodPressureSystolic} 
          onChange={handleChange} 
          icon={<Activity className="w-3.5 h-3.5 text-sky-500" />} 
          placeholder="120"
        />
        <VitalInput 
          label="BP (Diastolic)" 
          name="bloodPressureDiastolic" 
          value={vitals.bloodPressureDiastolic} 
          onChange={handleChange} 
          icon={<Activity className="w-3.5 h-3.5 text-sky-400" />} 
          placeholder="80"
        />
        <VitalInput 
          label="Resp. Rate" 
          name="respiratoryRate" 
          value={vitals.respiratoryRate} 
          onChange={handleChange} 
          icon={<Activity className="w-3.5 h-3.5 text-emerald-500" />} 
          placeholder="16"
          suffix="/min"
        />
        <VitalInput 
          label="Oxygen Sat." 
          name="oxygenSaturation" 
          value={vitals.oxygenSaturation} 
          onChange={handleChange} 
          icon={<Droplets className="w-3.5 h-3.5 text-cyan-500" />} 
          placeholder="98"
          suffix="%"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Clinical Notes</label>
        <textarea
          name="notes"
          className="input-modern py-2 min-h-[60px]"
          rows={2}
          value={vitals.notes}
          onChange={handleChange}
          placeholder="Observation details..."
        />
      </div>

      {mutation.isError && (
        <div className="p-2 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 text-[10px] font-bold border border-rose-100">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Error recording data.</span>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="flex-1 btn-secondary-glass h-10 text-[11px]">Cancel</button>
        <button 
          type="submit" 
          className="flex-[2] btn-primary-gradient h-10 text-[11px]"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Record Snapshot</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
}

function VitalInput({ label, name, value, onChange, icon, placeholder, suffix }: any) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
        {icon}
        <span>{label}</span>
      </label>
      <div className="relative group">
        <input
          type="number"
          step="any"
          name={name}
          className="input-modern pr-10 h-9"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none group-focus-within:text-sky-400 transition-colors">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
