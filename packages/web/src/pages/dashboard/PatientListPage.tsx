import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/api";
import PatientForm from "../../components/PatientForm";

interface PatientListPageProps {
  onSelectPatient: (id: string) => void;
}

export default function PatientListPage({
  onSelectPatient,
}: PatientListPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
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

  const filteredPatients = patients.filter(
    (p: any) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Patients</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          + New Patient
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Patient</h3>
          <PatientForm
            onSubmit={(data) => createMutation.mutate(data)}
            isLoading={createMutation.isPending}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="card">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search patients..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading && <p>Loading patients...</p>}
        {error && <p className="text-red-600">Error loading patients</p>}

        {filteredPatients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No patients found. Create one to get started!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">Age</th>
                  <th className="px-4 py-2 text-left font-semibold">Gender</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Blood Type
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Presenting Complaint
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPatients.map((patient: any) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="px-4 py-3">{patient.age}</td>
                    <td className="px-4 py-3">{patient.gender}</td>
                    <td className="px-4 py-3">{patient.bloodType || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      {patient.presentingComplaint || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectPatient(patient.id)}
                        className="text-medical-600 hover:text-medical-700 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
