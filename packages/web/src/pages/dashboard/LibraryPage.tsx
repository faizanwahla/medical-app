import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/api";
import { Search, BookOpen, ChevronRight, Hash, Star, Info } from "lucide-react";

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<any>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["diseases"],
    queryFn: () => apiClient.getDiseases(),
  });

  const diseases = response?.data || [];
  const filteredDiseases = diseases.filter((d: any) => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.icdCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="heading-1">Clinical Library</h2>
          <p className="text-gray-500 font-medium">Verified medical database & diagnostic criteria</p>
        </div>
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-medical-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by Disease or ICD-10..."
            className="input-field pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Disease List */}
        <div className="lg:col-span-4 space-y-4 h-[calc(100vh-250px)] overflow-auto pr-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))
          ) : filteredDiseases.map((disease: any) => (
            <button
              key={disease.id}
              onClick={() => setSelectedDisease(disease)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all group ${
                selectedDisease?.id === disease.id
                  ? 'bg-medical-50 border-medical-500 shadow-lg shadow-medical-100'
                  : 'bg-white border-transparent hover:border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded">
                  {disease.icdCode}
                </span>
                <span className="text-[10px] font-bold text-medical-600 uppercase tracking-tighter">
                  {disease.specialty}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 leading-tight group-hover:text-medical-700 transition-colors">
                {disease.name}
              </h4>
              <div className="flex items-center mt-3 text-gray-400">
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-medical-500 w-full opacity-30"></div>
                </div>
                <ChevronRight className="w-4 h-4 ml-2" />
              </div>
            </button>
          ))}
        </div>

        {/* Disease Details */}
        <div className="lg:col-span-8">
          {selectedDisease ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-[calc(100vh-250px)] flex flex-col">
              <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-medical-600 text-white rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-gray-900">{selectedDisease.name}</h3>
                    <p className="text-medical-600 font-bold uppercase tracking-widest text-[10px]">
                      ICD-10: {selectedDisease.icdCode} • {selectedDisease.specialty}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 overflow-auto space-y-10 flex-1 custom-scrollbar">
                <section>
                  <SectionTitle icon={<Info className="w-4 h-4" />} title="Definition & Pathophysiology" />
                  <p className="text-gray-600 leading-relaxed mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    {selectedDisease.definition}
                    <br /><br />
                    <span className="font-bold text-gray-900">Pathophysiology:</span> {selectedDisease.pathophysiology}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <SectionTitle icon={<Star className="w-4 h-4" />} title="Clinical Presentation" />
                    <div className="mt-4 space-y-4">
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Symptoms</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedDisease.symptoms.map((s: string) => (
                            <span key={s} className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Physical Signs</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedDisease.signs.map((s: string) => (
                            <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <SectionTitle icon={<Hash className="w-4 h-4" />} title="Diagnostic Criteria" />
                    <ul className="mt-4 space-y-3">
                      {selectedDisease.diagnosticCriteria.map((c: string) => (
                        <li key={c} className="flex items-start text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-medical-500 mt-2 mr-3 flex-shrink-0"></div>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section>
                  <SectionTitle icon={<Activity className="w-4 h-4" />} title="Management Protocol" />
                  <div className="mt-4 bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
                    <p className="text-emerald-900 font-medium leading-relaxed">
                      {selectedDisease.management}
                    </p>
                  </div>
                </section>

                <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>Reference: {selectedDisease.reference}</span>
                  <span>Database Ver: 2024.Q2</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 h-[calc(100vh-250px)] flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-400">Select a disease from the directory</h3>
              <p className="text-gray-400 mt-2 max-w-xs">Access verified clinical definitions, criteria, and management protocols.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center space-x-2 pb-2 border-b-2 border-gray-100">
      <div className="text-medical-600">{icon}</div>
      <h5 className="font-black uppercase tracking-widest text-xs text-gray-900">{title}</h5>
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
