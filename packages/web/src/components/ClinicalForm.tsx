import { useState } from "react";
import { SPECIALTIES } from "@medical-app/shared";
import { User, Clipboard, Activity, AlertCircle, Sparkles } from "lucide-react";
import SymptomSelector from "./SymptomSelector";
import TagInput from "./TagInput";

interface PatientFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onCancel?: () => void;
  initialData?: any;
}

export default function PatientForm({
  onSubmit,
  isLoading = false,
  onCancel,
  initialData,
}: PatientFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    age: initialData?.age || "",
    gender: initialData?.gender || "Male",
    bloodType: initialData?.bloodType || "",
    allergies: initialData?.allergies || [],
    pastMedicalHistory: initialData?.pastMedicalHistory || [],
    presentingComplaint: initialData?.presentingComplaint || "",
    durationOfIllness: initialData?.durationOfIllness || "",
    systemicReview: initialData?.systemicReview || "",
    examFindings: initialData?.examFindings || "",
    specialty: initialData?.specialty || ""
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    initialData?.presentingComplaint ? initialData.presentingComplaint.split(", ") : []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) newErrors.firstName = "Required";
    if (!formData.lastName?.trim()) newErrors.lastName = "Required";
    if (!formData.specialty?.trim()) newErrors.specialty = "Specialty required";

    const ageValue = parseInt(formData.age || "0");
    if (ageValue < 0 || ageValue > 150) newErrors.age = "Invalid age";
    if (isNaN(ageValue)) newErrors.age = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSymptomsChange = (symptoms: string[]) => {
    setSelectedSymptoms(symptoms);
    setFormData(prev => ({
      ...prev,
      presentingComplaint: symptoms.join(", ")
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload: any = {
      ...formData,
      age: parseInt(formData.age),
      specialty: formData.specialty as string,
    };
    if (!payload.bloodType) {
      delete payload.bloodType;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. PERSONAL DETAILS */}
      <section className="glass-card-compact border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
        <div className="flex items-center space-x-3 mb-5 pl-1">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-[9px] text-slate-400">Step 01</h4>
            <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormGroup label="First Name" error={errors.firstName}>
            <input
              type="text"
              name="firstName"
              className="input-modern"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
            />
          </FormGroup>

          <FormGroup label="Last Name" error={errors.lastName}>
            <input
              type="text"
              name="lastName"
              className="input-modern"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Age" error={errors.age}>
              <input
                type="number"
                name="age"
                className="input-modern"
                value={formData.age}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup label="Gender">
              <select
                name="gender"
                className="input-modern appearance-none"
                value={formData.gender}
                onChange={handleChange}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </FormGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormGroup label="Clinical Specialty" error={errors.specialty}>
            <select
              name="specialty"
              className="input-modern appearance-none"
              value={formData.specialty}
              onChange={handleChange}
            >
              <option value="">Select Specialty...</option>
              {SPECIALTIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormGroup>
          <FormGroup label="Blood Group">
            <select
              name="bloodType"
              className="input-modern appearance-none"
              value={formData.bloodType}
              onChange={handleChange}
            >
              <option value="">Unknown</option>
              {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormGroup>
        </div>
      </section>

      {/* 2. CLINICAL PRESENTATION */}
      <section className="glass-card-compact border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <div className="flex items-center justify-between mb-5 pl-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Clipboard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest text-[9px] text-slate-400">Step 02</h4>
              <h3 className="text-sm font-bold text-slate-900">Symptom Assessment</h3>
            </div>
          </div>
          <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[8px] font-black uppercase flex items-center border border-emerald-100">
            <Sparkles className="w-2.5 h-2.5 mr-1.5" />
            Selection Engine
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <SymptomSelector 
              selectedSymptoms={selectedSymptoms}
              onChange={handleSymptomsChange}
            />
          </div>
          <div className="space-y-4">
            <FormGroup label="Duration of Illness">
              <input
                type="text"
                name="durationOfIllness"
                className="input-modern"
                value={formData.durationOfIllness}
                onChange={handleChange}
                placeholder="e.g. 3 days"
              />
            </FormGroup>
            <FormGroup label="Exam Findings">
              <textarea
                name="examFindings"
                className="input-modern min-h-[100px] py-3"
                rows={4}
                value={formData.examFindings}
                onChange={handleChange}
                placeholder="Physical signs..."
              />
            </FormGroup>
          </div>
        </div>
      </section>

      {/* 3. MEDICAL BACKGROUND */}
      <section className="glass-card-compact border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
        <div className="flex items-center space-x-3 mb-5 pl-1">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-[9px] text-slate-400">Step 03</h4>
            <h3 className="text-sm font-bold text-slate-900">Medical Background</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TagInput 
            label="Allergies"
            tags={formData.allergies}
            onChange={(tags) => setFormData(prev => ({ ...prev, allergies: tags }))}
            placeholder="Type and press Enter"
            suggestions={['Penicillin', 'Sulfa', 'Latex', 'Peanuts', 'Aspirin', 'NSAIDS']}
          />
          <TagInput 
            label="Past History"
            tags={formData.pastMedicalHistory}
            onChange={(tags) => setFormData(prev => ({ ...prev, pastMedicalHistory: tags }))}
            placeholder="Type and press Enter"
            suggestions={['Hypertension', 'Diabetes', 'Asthma', 'COPD', 'Stroke', 'MI', 'CKD']}
          />
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 font-bold uppercase tracking-widest text-[9px] hover:text-slate-600 transition-colors"
          >
            Cancel Entry
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary-gradient px-8 py-2.5 h-10 shadow-lg shadow-sky-500/20 disabled:opacity-50 text-xs"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : (initialData ? "Update Record" : "Finalize & Register Patient")}
        </button>
      </div>
    </form>
  );
}

function FormGroup({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) {
  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</label>
        {error && (
          <span className="text-[9px] text-rose-500 font-bold uppercase flex items-center">
            <AlertCircle className="w-2.5 h-2.5 mr-1" />
            {error}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}