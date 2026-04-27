import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/api";
import PatientForm from "../../components/PatientForm";
export default function PatientListPage({ onSelectPatient, }) {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();
    const { data: response, isLoading, error, } = useQuery({
        queryKey: ["patients"],
        queryFn: () => apiClient.getPatients(),
    });
    const createMutation = useMutation({
        mutationFn: (data) => apiClient.createPatient(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            setShowForm(false);
        },
    });
    const patients = response?.data?.patients || [];
    const filteredPatients = patients.filter((p) => p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Patients" }), _jsx("button", { onClick: () => setShowForm(!showForm), className: "btn-primary", children: "+ New Patient" })] }), showForm && (_jsxs("div", { className: "card mb-6", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Add New Patient" }), _jsx(PatientForm, { onSubmit: (data) => createMutation.mutate(data), isLoading: createMutation.isPending, onCancel: () => setShowForm(false) })] })), _jsxs("div", { className: "card", children: [_jsx("div", { className: "mb-4", children: _jsx("input", { type: "text", placeholder: "Search patients...", className: "input", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }) }), isLoading && _jsx("p", { children: "Loading patients..." }), error && _jsx("p", { className: "text-red-600", children: "Error loading patients" }), filteredPatients.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No patients found. Create one to get started!" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Name" }), _jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Age" }), _jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Gender" }), _jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Blood Type" }), _jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Presenting Complaint" }), _jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y", children: filteredPatients.map((patient) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsxs("td", { className: "px-4 py-3", children: [patient.firstName, " ", patient.lastName] }), _jsx("td", { className: "px-4 py-3", children: patient.age }), _jsx("td", { className: "px-4 py-3", children: patient.gender }), _jsx("td", { className: "px-4 py-3", children: patient.bloodType || "-" }), _jsx("td", { className: "px-4 py-3 text-sm", children: patient.presentingComplaint || "-" }), _jsx("td", { className: "px-4 py-3", children: _jsx("button", { onClick: () => onSelectPatient(patient.id), className: "text-medical-600 hover:text-medical-700 font-medium", children: "View" }) })] }, patient.id))) })] }) }))] })] }));
}
//# sourceMappingURL=PatientListPage.js.map