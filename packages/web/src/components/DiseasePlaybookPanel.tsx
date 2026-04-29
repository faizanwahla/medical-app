import {
  Disease,
  DiseaseInvestigationRecommendation,
  DiseaseTreatmentRecommendation,
} from "@medical-app/shared";
import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  HeartPulse,
  Pill,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface DiseasePlaybookPanelProps {
  disease: Disease;
  existingInvestigationNames?: string[];
  existingTreatmentMedicineIds?: string[];
  existingTreatmentNames?: string[];
  onOrderInvestigation?: (recommendation: DiseaseInvestigationRecommendation) => void;
  onStartTreatment?: (recommendation: DiseaseTreatmentRecommendation) => void;
  isOrderingInvestigation?: boolean;
  isStartingTreatment?: boolean;
  showReference?: boolean;
}

export default function DiseasePlaybookPanel({
  disease,
  existingInvestigationNames = [],
  existingTreatmentMedicineIds = [],
  existingTreatmentNames = [],
  onOrderInvestigation,
  onStartTreatment,
  isOrderingInvestigation = false,
  isStartingTreatment = false,
  showReference = true,
}: DiseasePlaybookPanelProps) {
  const playbook = disease.clinicalPlaybook;
  const orderedSet = new Set(existingInvestigationNames.map((item) => item.toLowerCase()));
  const activeTreatmentSet = new Set(existingTreatmentMedicineIds);
  const activeTreatmentNameSet = new Set(
    existingTreatmentNames.map((item) => item.trim().toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header Info */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-premium bg-indigo-50 border-indigo-100 text-indigo-700">
                {disease.specialty}
              </span>
              <span className="badge-premium bg-slate-200 border-slate-300 text-slate-600">
                ICD-10: {disease.icdCode}
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              {disease.name}
            </h3>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-500 shadow-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            Prognosis: <span className="text-slate-900">{disease.prognosis}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          {playbook?.summary || disease.definition}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="Core Definition" body={disease.definition} icon={<BookOpen className="w-4 h-4" />} />
          <InfoCard
            title="Pathophysiology"
            body={disease.pathophysiology}
            icon={<HeartPulse className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Clinical Presentation */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TagSection title="Reported Symptoms" items={disease.symptoms} tone="indigo" />
        <TagSection title="Examination Signs" items={disease.signs} tone="slate" />
        <TagSection title="Known Risk Factors" items={playbook?.riskFactors || []} tone="slate" />
        <TagSection title="Diagnostic Criteria" items={disease.diagnosticCriteria} tone="indigo" />
      </div>

      {/* Vital Patterns */}
      {playbook?.vitalPatterns?.length ? (
        <section className="space-y-4">
          <SectionHeading icon={<Stethoscope className="w-4 h-4" />} title="Standard Vital Patterns" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {playbook.vitalPatterns.map((pattern) => (
              <div key={pattern.metric} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                  {pattern.metric}
                </p>
                <p className="font-bold text-slate-900 mt-2 text-sm">{pattern.expected}</p>
                <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{pattern.interpretation}</p>
                {(typeof pattern.highAlert === "number" || typeof pattern.lowAlert === "number") && (
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    <span>
                      {typeof pattern.highAlert === "number" ? `High >= ${pattern.highAlert}` : ""}
                      {typeof pattern.highAlert === "number" && typeof pattern.lowAlert === "number" ? " | " : ""}
                      {typeof pattern.lowAlert === "number" ? `Low <= ${pattern.lowAlert}` : ""}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Investigation Plan */}
      <section className="space-y-4">
        <SectionHeading icon={<ClipboardList className="w-4 h-4" />} title="Investigation Protocol" />
        <div className="space-y-3">
          {(playbook?.investigationPlan || []).map((recommendation) => {
            const alreadyOrdered = orderedSet.has(recommendation.name.toLowerCase());
            return (
              <div
                key={`${recommendation.name}-${recommendation.priority}`}
                className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 group hover:border-slate-300 transition-colors shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 text-sm">{recommendation.name}</p>
                    <span className="badge-premium bg-indigo-50 border-indigo-100 text-indigo-700">
                      {recommendation.type}
                    </span>
                    <span className={`badge-premium ${recommendation.priority === 'Urgent' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                      {recommendation.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{recommendation.reason}</p>
                  {recommendation.expectedFindings ? (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      Expected: {recommendation.expectedFindings}
                    </p>
                  ) : null}
                </div>
                {onOrderInvestigation ? (
                  <button
                    onClick={() => onOrderInvestigation(recommendation)}
                    disabled={alreadyOrdered || isOrderingInvestigation}
                    className={`btn-premium px-6 h-9 transition-all ${
                      alreadyOrdered
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                        : "btn-primary-gradient shadow-md"
                    }`}
                  >
                    {alreadyOrdered ? (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Ordered</span>
                      </div>
                    ) : isOrderingInvestigation ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Request Test"
                    )}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Treatment Strategy */}
      <section className="space-y-4">
        <SectionHeading icon={<Pill className="w-4 h-4" />} title="Pharmaceutical Strategy" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {(playbook?.treatmentPlan || []).map((recommendation) => {
            const hasFormularyMatch = !!recommendation.medicineId;
            const alreadyActive =
              (!!recommendation.medicineId && activeTreatmentSet.has(recommendation.medicineId)) ||
              activeTreatmentNameSet.has(recommendation.medicineName.trim().toLowerCase());

            return (
              <div key={`${recommendation.category}-${recommendation.medicineName}`} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm hover:border-slate-300 transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                      {recommendation.category}
                    </p>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{recommendation.medicineName}</h4>
                  </div>
                  <span className={`badge-premium ${
                    hasFormularyMatch ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {hasFormularyMatch ? "Formulary" : "Reference"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">{recommendation.rationale}</p>
                <div className="grid grid-cols-3 gap-2">
                  <Metric label="Dose" value={recommendation.dose} />
                  <Metric label="Freq" value={recommendation.frequency} />
                  <Metric label="Dur" value={recommendation.duration} />
                </div>
                
                <div className="space-y-3 pt-2">
                   <TagSection title="Side Effects" items={recommendation.commonSideEffects} tone="rose" compact />
                   <TagSection title="Contraindications" items={recommendation.contraindications} tone="slate" compact />
                </div>

                {onStartTreatment ? (
                  <button
                    onClick={() => onStartTreatment(recommendation)}
                    disabled={alreadyActive || isStartingTreatment}
                    className={`w-full h-10 rounded-xl text-xs font-bold transition-all border ${
                      alreadyActive
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-md"
                    }`}
                  >
                    {alreadyActive ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Active Regime</span>
                      </div>
                    ) : isStartingTreatment ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                    ) : (
                      "Prepare Protocol"
                    )}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Complications & Risks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TagSection title="Possible Complications" items={playbook?.complications || []} tone="rose" />
        <TagSection title="Clinical Red Flags" items={playbook?.redFlags || []} tone="orange" icon={<ShieldAlert className="w-4 h-4" />} />
        <TagSection title="Supportive Care" items={playbook?.supportiveCare || []} tone="indigo" icon={<Syringe className="w-4 h-4" />} />
        <TagSection title="Disposition & Follow Up" items={[...(playbook?.followUp || []), ...(playbook?.disposition || [])]} tone="slate" icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/10">
        <SectionHeading icon={<BookOpen className="w-4 h-4 text-indigo-400" />} title="Management Core" dark />
        <p className="text-sm text-slate-300 mt-4 leading-relaxed font-medium">{disease.management}</p>
      </div>

      {showReference && (
        <div className="pt-6 border-t border-slate-100">
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
             <BookOpen className="w-3 h-3" />
             Source: {disease.reference}
           </p>
        </div>
      )}
    </div>
  );
}

function SectionHeading({ icon, title, dark = false }: { icon: React.ReactNode; title: string; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-2 pb-3 border-b ${dark ? 'border-slate-800' : 'border-slate-50'}`}>
      <div className={dark ? 'text-indigo-400' : 'text-indigo-600'}>{icon}</div>
      <h4 className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
    </div>
  );
}

function InfoCard({ title, body, icon }: { title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-indigo-600 mb-3">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-widest">{title}</p>
      </div>
      <p className="text-xs text-slate-600 font-medium leading-relaxed">{body}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-2.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="font-bold text-slate-800 text-[11px]">{value}</p>
    </div>
  );
}

function TagSection({
  title,
  items,
  tone,
  compact = false,
  icon,
}: {
  title: string;
  items: string[];
  tone: "indigo" | "rose" | "slate" | "orange";
  compact?: boolean;
  icon?: React.ReactNode;
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    orange: "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <div className={`space-y-3 ${compact ? "" : "bg-white border border-slate-200 rounded-xl p-4 shadow-sm"}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon ? <div className="text-indigo-500">{icon}</div> : null}
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span
              key={`${title}-${item}`}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${tones[tone]}`}
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-slate-400 italic font-medium">No standardized data available.</span>
        )}
      </div>
    </div>
  );
}
