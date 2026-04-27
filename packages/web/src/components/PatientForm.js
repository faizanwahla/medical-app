import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function PatientForm({ onSubmit, isLoading = false, onCancel, initialData, }) {
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
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = (e) => {
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
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "First Name *" }), _jsx("input", { type: "text", name: "firstName", className: "input", value: formData.firstName, onChange: handleChange, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Last Name *" }), _jsx("input", { type: "text", name: "lastName", className: "input", value: formData.lastName, onChange: handleChange, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Age *" }), _jsx("input", { type: "number", name: "age", className: "input", value: formData.age, onChange: handleChange, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Gender *" }), _jsxs("select", { name: "gender", className: "input", value: formData.gender, onChange: handleChange, children: [_jsx("option", { children: "Male" }), _jsx("option", { children: "Female" }), _jsx("option", { children: "Other" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Blood Type" }), _jsxs("select", { name: "bloodType", className: "input", value: formData.bloodType, onChange: handleChange, children: [_jsx("option", { value: "", children: "Select..." }), _jsx("option", { children: "O+" }), _jsx("option", { children: "O-" }), _jsx("option", { children: "A+" }), _jsx("option", { children: "A-" }), _jsx("option", { children: "B+" }), _jsx("option", { children: "B-" }), _jsx("option", { children: "AB+" }), _jsx("option", { children: "AB-" })] })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Allergies (comma separated)" }), _jsx("input", { type: "text", name: "allergies", className: "input", value: formData.allergies, onChange: handleChange, placeholder: "e.g., Penicillin, Peanuts" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Past Medical History (comma separated)" }), _jsx("input", { type: "text", name: "pastMedicalHistory", className: "input", value: formData.pastMedicalHistory, onChange: handleChange, placeholder: "e.g., Hypertension, Diabetes" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Presenting Complaint" }), _jsx("input", { type: "text", name: "presentingComplaint", className: "input", value: formData.presentingComplaint, onChange: handleChange, placeholder: "Main complaint of patient" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Duration of Illness" }), _jsx("input", { type: "text", name: "durationOfIllness", className: "input", value: formData.durationOfIllness, onChange: handleChange, placeholder: "e.g., 3 days" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Systemic Review" }), _jsx("textarea", { name: "systemicReview", className: "input", rows: 3, value: formData.systemicReview, onChange: handleChange, placeholder: "Review of systems" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Examination Findings" }), _jsx("textarea", { name: "examFindings", className: "input", rows: 3, value: formData.examFindings, onChange: handleChange, placeholder: "Physical examination findings" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { type: "submit", disabled: isLoading, className: "btn-primary flex-1", children: isLoading ? "Saving..." : "Save Patient" }), onCancel && (_jsx("button", { type: "button", onClick: onCancel, className: "btn-secondary flex-1", children: "Cancel" }))] })] }));
}
//# sourceMappingURL=PatientForm.js.map