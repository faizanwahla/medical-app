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
} from "lucide-react";

interface DiseasePlaybookPanelProps {
  disease: Disease;
  existingInvestigationNames?: string[];
  existingTreatmentMedicineIds?: string[];
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
  onOrderInvestigation,
  onStartTreatment,
  isOrderingInvestigation = false,
  isStartingTreatment = false,
  showReference = true,
}: DiseasePlaybookPanelProps) {
  const playbook = disease.clinicalPlaybook;
  const orderedSet = new Set(existingInvestigationNames.map((item) => item.toLowerCase()));
  const activeTreatmentSet = new Set(existingTreatmentMedicineIds);

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-medical-600">
              {disease.specialty} • ICD-10 {disease.icdCode}
            </p>
            <h3 className="text-2xl font-black tracking-tight text-gray-900 mt-1">
              {disease.name}
            </h3>
          </div>
          <div className="px-3 py-2 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-gray-500">
            Prognosis: {disease.prognosis}
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          {playbook?.summary || disease.definition}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="Definition" body={disease.definition} icon={<BookOpen className="w-4 h-4" />} />
          <InfoCard
            title="Pathophysiology"
            body={disease.pathophysiology}
            icon={<HeartPulse className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TagSection title="Symptoms" items={disease.symptoms} tone="amber" />
        <TagSection title="Signs" items={disease.signs} tone="blue" />
        <TagSection title="Risk Factors" items={playbook?.riskFactors || []} tone="slate" />
        <TagSection title="Diagnostic Criteria" items={disease.diagnosticCriteria} tone="green" />
      </div>

      {playbook?.vitalPatterns?.length ? (
        <section className="space-y-4">
          <SectionHeading icon={<Stethoscope className="w-4 h-4" />} title="Vital Impact" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {playbook.vitalPatterns.map((pattern) => (
              <div key={pattern.metric} className="card border border-gray-100 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-medical-600">
                  {pattern.metric}
                </p>
                <p className="font-bold text-gray-900 mt-2">{pattern.expected}</p>
                <p className="text-sm text-gray-600 mt-2">{pattern.interpretation}</p>
                <p className="text-xs text-gray-400 mt-3">
                  {typeof pattern.highAlert === "number" ? `High alert >= ${pattern.highAlert}` : ""}
                  {typeof pattern.highAlert === "number" && typeof pattern.lowAlert === "number" ? " • " : ""}
                  {typeof pattern.lowAlert === "number" ? `Low alert <= ${pattern.lowAlert}` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionHeading icon={<ClipboardList className="w-4 h-4" />} title="Recommended Investigations" />
        <div className="space-y-3">
          {(playbook?.investigationPlan || []).map((recommendation) => {
            const alreadyOrdered = orderedSet.has(recommendation.name.toLowerCase());
            return (
              <div
                key={`${recommendation.name}-${recommendation.priority}`}
                className="card border border-gray-100 p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{recommendation.name}</p>
                    <span className="px-2 py-1 rounded-full bg-medical-50 text-medical-700 text-[10px] font-black uppercase tracking-widest">
                      {recommendation.type}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      {recommendation.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{recommendation.reason}</p>
                  {recommendation.expectedFindings ? (
                    <p className="text-xs text-gray-400">
                      Expected: {recommendation.expectedFindings}
                    </p>
                  ) : null}
                </div>
                {onOrderInvestigation ? (
                  <button
                    onClick={() => onOrderInvestigation(recommendation)}
                    disabled={alreadyOrdered || isOrderingInvestigation}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                      alreadyOrdered
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-medical-600 text-white hover:bg-medical-700"
                    }`}
                  >
                    {alreadyOrdered ? "Already ordered" : isOrderingInvestigation ? "Ordering..." : "Order"}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading icon={<Pill className="w-4 h-4" />} title="Treatment Strategy" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {(playbook?.treatmentPlan || []).map((recommendation) => {
            const hasFormularyMatch = !!recommendation.medicineId;
            const alreadyActive =
              !!recommendation.medicineId && activeTreatmentSet.has(recommendation.medicineId);

            return (
              <div key={`${recommendation.category}-${recommendation.medicineName}`} className="card border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-medical-600">
                      {recommendation.category}
                    </p>
                    <h4 className="font-bold text-gray-900">{recommendation.medicineName}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    hasFormularyMatch ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {hasFormularyMatch ? "Formulary linked" : "Reference only"}
                  </span>
                </div>

                <p className="text-sm text-gray-600">{recommendation.rationale}</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Metric label="Dose" value={recommendation.dose} />
                  <Metric label="Frequency" value={recommendation.frequency} />
                  <Metric label="Duration" value={recommendation.duration} />
                </div>
                {recommendation.instructions ? (
                  <p className="text-xs text-gray-500">
                    Instructions: {recommendation.instructions}
                  </p>
                ) : null}
                <TagSection title="Side Effects" items={recommendation.commonSideEffects} tone="rose" compact />
                <TagSection title="Contraindications" items={recommendation.contraindications} tone="slate" compact />

                {onStartTreatment ? (
                  <button
                    onClick={() => onStartTreatment(recommendation)}
                    disabled={!hasFormularyMatch || alreadyActive || isStartingTreatment}
                    className={`w-full px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                      !hasFormularyMatch || alreadyActive
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {alreadyActive
                      ? "Already active"
                      : !hasFormularyMatch
                        ? "Not in formulary"
                        : isStartingTreatment
                          ? "Starting..."
                          : "Start treatment"}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TagSection title="Complications" items={playbook?.complications || []} tone="rose" />
        <TagSection title="Red Flags" items={playbook?.redFlags || []} tone="orange" icon={<ShieldAlert className="w-4 h-4" />} />
        <TagSection title="Supportive Care" items={playbook?.supportiveCare || []} tone="green" icon={<Syringe className="w-4 h-4" />} />
        <TagSection title="Follow Up & Disposition" items={[...(playbook?.followUp || []), ...(playbook?.disposition || [])]} tone="slate" icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
        <SectionHeading icon={<BookOpen className="w-4 h-4" />} title="Management Core" />
        <p className="text-sm text-emerald-900 mt-4 leading-relaxed">{disease.management}</p>
      </div>

      {showReference ? (
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Reference: {disease.reference}
        </p>
      ) : null}
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
      <div className="text-medical-600">{icon}</div>
      <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">{title}</h4>
    </div>
  );
}

function InfoCard({ title, body, icon }: { title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 text-medical-600">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest">{title}</p>
      </div>
      <p className="text-sm text-gray-600 mt-3 leading-relaxed">{body}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="font-bold text-gray-900 mt-1">{value}</p>
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
  tone: "amber" | "blue" | "green" | "rose" | "slate" | "orange";
  compact?: boolean;
  icon?: React.ReactNode;
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    slate: "bg-gray-50 text-gray-700 border-gray-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };

  return (
    <div className={`space-y-3 ${compact ? "" : "card border border-gray-100 p-5"}`}>
      <div className="flex items-center gap-2">
        {icon ? <div className="text-medical-600">{icon}</div> : null}
        <p className="text-xs font-black uppercase tracking-widest text-gray-700">{title}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span
              key={`${title}-${item}`}
              className={`px-3 py-1 rounded-full text-xs font-bold border ${tones[tone]}`}
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-400 italic">No structured data yet.</span>
        )}
      </div>
    </div>
  );
}
