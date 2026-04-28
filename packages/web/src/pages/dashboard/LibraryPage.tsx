import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, Filter, ChevronRight, Book } from "lucide-react";
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
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Clinical Library</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Reference standardized medical protocols and diagnostic playbooks.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search diseases..."
              className="input-modern pl-10 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-60">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              className="input-modern pl-10 h-10 appearance-none cursor-pointer"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Sidebar: Disease List */}
        <div className="lg:col-span-4 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
            ))
          ) : filteredDiseases.length ? (
            filteredDiseases.map((disease) => (
              <button
                key={disease.id}
                onClick={() => setSelectedDiseaseId(disease.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                  selectedDisease?.id === disease.id
                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-start gap-3 mb-2 relative z-10">
                  <span className={`badge-premium ${selectedDisease?.id === disease.id ? "bg-indigo-500 border-indigo-400 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {disease.icdCode}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${selectedDisease?.id === disease.id ? "text-indigo-400" : "text-indigo-600"}`}>
                    {disease.specialty}
                  </span>
                </div>
                <h4 className={`font-bold leading-tight relative z-10 transition-colors ${selectedDisease?.id === disease.id ? "text-white" : "text-slate-900 group-hover:text-indigo-600"}`}>
                  {disease.name}
                </h4>
                <p className={`text-xs mt-2 line-clamp-2 relative z-10 leading-relaxed font-medium ${selectedDisease?.id === disease.id ? "text-slate-400" : "text-slate-500"}`}>
                  {disease.clinicalPlaybook?.summary || disease.definition}
                </p>
                {selectedDisease?.id === disease.id && (
                   <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                )}
              </button>
            ))
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl text-center py-20">
               <Book className="w-10 h-10 text-slate-200 mx-auto mb-4" />
               <p className="text-sm font-semibold text-slate-400">No clinical protocols matched</p>
            </div>
          )}
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {selectedDisease ? (
            <div className="overflow-y-auto flex-1 p-8 custom-scrollbar">
              <DiseasePlaybookPanel
                disease={selectedDisease}
                showReference={showReferenceDetails}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                <BookOpen className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Select a Protocol</h3>
              <p className="text-slate-500 mt-2 max-w-xs text-sm font-medium">
                Review clinical presentation, differential clues, and standardized treatment strategies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
