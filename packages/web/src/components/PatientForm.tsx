import { useState } from "react";

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
    allergies: initialData?.allergies?.join(", ") || "",
    pastMedicalHistory: initialData?.pastMedicalHistory?.join(", ") || "",
    presentingComplaint: initialData?.presentingComplaint || "",
    durationOfIllness: initialData?.durationOfIllness || "",
    systemicReview: initialData?.systemicReview || "",
    examFindings: initialData?.examFindings || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      ...formData,
      age: parseInt(formData.age),
      allergies: formData.allergies
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a),
      pastMedicalHistory: formData.pastMedicalHistory
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">First Name *</label>
          <input
            type="text"
            name="firstName"
            className="input"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Last Name *</label>
          <input
            type="text"
            name="lastName"
            className="input"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Age *</label>
          <input
            type="number"
            name="age"
            className="input"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Gender *</label>
          <select
            name="gender"
            className="input"
            value={formData.gender}
            onChange={handleChange}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Blood Type</label>
          <select
            name="bloodType"
            className="input"
            value={formData.bloodType}
            onChange={handleChange}
          >
            <option value="">Select...</option>
            <option>O+</option>
            <option>O-</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="label">Allergies (comma separated)</label>
        <input
          type="text"
          name="allergies"
          className="input"
          value={formData.allergies}
          onChange={handleChange}
          placeholder="e.g., Penicillin, Peanuts"
        />
      </div>

      <div className="form-group">
        <label className="label">Past Medical History (comma separated)</label>
        <input
          type="text"
          name="pastMedicalHistory"
          className="input"
          value={formData.pastMedicalHistory}
          onChange={handleChange}
          placeholder="e.g., Hypertension, Diabetes"
        />
      </div>

      <div className="form-group">
        <label className="label">Presenting Complaint</label>
        <input
          type="text"
          name="presentingComplaint"
          className="input"
          value={formData.presentingComplaint}
          onChange={handleChange}
          placeholder="Main complaint of patient"
        />
      </div>

      <div className="form-group">
        <label className="label">Duration of Illness</label>
        <input
          type="text"
          name="durationOfIllness"
          className="input"
          value={formData.durationOfIllness}
          onChange={handleChange}
          placeholder="e.g., 3 days"
        />
      </div>

      <div className="form-group">
        <label className="label">Systemic Review</label>
        <textarea
          name="systemicReview"
          className="input"
          rows={3}
          value={formData.systemicReview}
          onChange={handleChange}
          placeholder="Review of systems"
        />
      </div>

      <div className="form-group">
        <label className="label">Examination Findings</label>
        <textarea
          name="examFindings"
          className="input"
          rows={3}
          value={formData.examFindings}
          onChange={handleChange}
          placeholder="Physical examination findings"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1"
        >
          {isLoading ? "Saving..." : "Save Patient"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
