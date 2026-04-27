import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search } from "lucide-react";
import { Disease, SPECIALTIES } from "@medical-app/shared";
import DiseasePlaybookPanel from "../../components/DiseasePlaybookPanel";
import apiClient from "../../lib/api";
import { useAppSettingsStore } from "../../lib/store";

const specialtyOptions = ["All Specialties", ...SPECIALTIES, "Respiratory Medicine", "Critical Care", "Urology"];

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(null);
  const { defaultLibrarySpecialty, showReferenceDetails, updateSettings } =
    useAppSettingsStore();

  const { data: response, isLoading } = useQuery({
    queryKey: ["diseases"],
    queryFn: () => apiClient.getDiseases(),
  });

  const diseases = (response?.data || []) as Disease[];
  const filteredDiseases = diseases.filter((disease) => {
    const matchesSpecialty =
      defaultLibrarySpecialty === "All Specialties" ||
      disease.specialty === defaultLibrarySpecialty;
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      disease.name.toLowerCase().includes(search) ||
      disease.icdCode.toLowerCase().includes(search) ||
      disease.specialty.toLowerCase().includes(search);

    return matchesSpecialty && matchesSearch;
  });

  const selectedDisease =
    filteredDiseases.find((disease) => disease.id === selectedDiseaseId) ||
    filteredDiseases[0] ||
    null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="heading-1">Clinical Library</h2>
          <p className="text-gray-500 font-medium">
            Detailed disease playbooks with symptoms, vitals, investigations, complications, and drug guidance.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-medical-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by disease, ICD-10, or specialty"
              className="input-field pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input-field min-w-60"
            value={defaultLibrarySpecialty}
            onChange={(e) =>
              updateSettings({
                defaultLibrarySpecialty: e.target.value,
              })
            }
          >
            {specialtyOptions.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4 h-[calc(100vh-240px)] overflow-auto pr-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))
          ) : filteredDiseases.length ? (
            filteredDiseases.map((disease) => (
              <button
                key={disease.id}
                onClick={() => setSelectedDiseaseId(disease.id)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all group ${
                  selectedDisease?.id === disease.id
                    ? "bg-medical-50 border-medical-500 shadow-lg shadow-medical-100"
                    : "bg-white border-transparent hover:border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded">
                    {disease.icdCode}
                  </span>
                  <span className="text-[10px] font-bold text-medical-600 uppercase tracking-tight text-right">
                    {disease.specialty}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 leading-tight group-hover:text-medical-700 transition-colors">
                  {disease.name}
                </h4>
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                  {disease.clinicalPlaybook?.summary || disease.definition}
                </p>
              </button>
            ))
          ) : (
            <div className="card border border-dashed border-gray-200 text-center py-12 text-gray-400">
              No diseases matched the current library filter.
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          {selectedDisease ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-[calc(100vh-240px)] flex flex-col">
              <div className="p-8 overflow-auto flex-1 custom-scrollbar">
                <DiseasePlaybookPanel
                  disease={selectedDisease}
                  showReference={showReferenceDetails}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 h-[calc(100vh-240px)] flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-400">Select a disease from the library</h3>
              <p className="text-gray-400 mt-2 max-w-xs">
                Open the disease playbook to review clinical presentation, investigations, treatment options, and complications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
