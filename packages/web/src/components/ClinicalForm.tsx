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
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* 1. PERSONAL DETAILS */}
      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-medical-50 text-medical-600 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs text-gray-500">Step 01</h4>
            <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormGroup label="First Name" error={errors.firstName}>
            <input
              type="text"
              name="firstName"
              className="input-field"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
            />
          </FormGroup>

          <FormGroup label="Last Name" error={errors.lastName}>
            <input
              type="text"
              name="lastName"
              className="input-field"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Age" error={errors.age}>
              <input
                type="number"
                name="age"
                className="input-field"
                value={formData.age}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup label="Gender">
              <select
                name="gender"
                className="input-field"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormGroup label="Clinical Specialty" error={errors.specialty}>
            <select
              name="specialty"
              className="input-field"
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
              className="input-field"
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

      {/* 2. CLINICAL PRESENTATION - THE SYMPTOM TAPPER */}
      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Clipboard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest text-xs text-gray-500">Step 02</h4>
              <h3 className="text-xl font-bold text-gray-900">Symptom Assessment</h3>
            </div>
          </div>
          <div className="px-4 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase flex items-center">
            <Sparkles className="w-3 h-3 mr-2" />
            Tap to select symptoms
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SymptomSelector 
              selectedSymptoms={selectedSymptoms}
              onChange={handleSymptomsChange}
            />
          </div>
          <div className="space-y-6">
            <FormGroup label="Duration of Illness">
              <input
                type="text"
                name="durationOfIllness"
                className="input-field"
                value={formData.durationOfIllness}
                onChange={handleChange}
                placeholder="e.g. 3 days, 2 weeks"
              />
            </FormGroup>
            <FormGroup label="Additional Observations">
              <textarea
                name="examFindings"
                className="input-field"
                rows={4}
                value={formData.examFindings}
                onChange={handleChange}
                placeholder="Initial physical signs or notes..."
              />
            </FormGroup>
          </div>
        </div>
      </section>

      {/* 3. MEDICAL BACKGROUND */}
      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs text-gray-500">Step 03</h4>
            <h3 className="text-xl font-bold text-gray-900">Medical Background</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TagInput 
            label="Allergies"
            tags={formData.allergies}
            onChange={(tags) => setFormData(prev => ({ ...prev, allergies: tags }))}
            placeholder="Type and press Enter (e.g. Penicillin)"
            suggestions={['Penicillin', 'Sulfa', 'Latex', 'Peanuts', 'Aspirin', 'NSAIDS']}
          />
          <TagInput 
            label="Past Medical History"
            tags={formData.pastMedicalHistory}
            onChange={(tags) => setFormData(prev => ({ ...prev, pastMedicalHistory: tags }))}
            placeholder="Type and press Enter (e.g. Hypertension)"
            suggestions={['Hypertension', 'Diabetes', 'Asthma', 'COPD', 'Stroke', 'MI', 'CKD']}
          />
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-6 pt-8 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors"
          >
            Cancel Entry
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary px-12 py-4 shadow-2xl shadow-medical-500/20 disabled:opacity-50 text-sm"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Record...
            </span>
          ) : (initialData ? "Update Record" : "Finalize & Register Patient")}
        </button>
      </div>
    </form>
  );
}

function FormGroup({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        {error && (
          <span className="text-[10px] text-red-500 font-black uppercase flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {error}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}