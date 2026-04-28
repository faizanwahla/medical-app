import { useState } from 'react';
import { Heart, Wind, Coffee, Brain, Thermometer, Check, Activity } from 'lucide-react';

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onChange: (symptoms: string[]) => void;
}

const systems = [
  {
    id: 'general',
    label: 'General',
    icon: Thermometer,
    color: 'amber',
    symptoms: ['Fever', 'Weight Loss', 'Weight Gain', 'Fatigue', 'Night Sweats', 'Loss of Appetite', 'Chills', 'Malaise']
  },
  {
    id: 'cvs',
    label: 'Cardiovascular',
    icon: Heart,
    color: 'red',
    symptoms: ['Chest Pain', 'Palpitations', 'Shortness of Breath', 'Orthopnea', 'PND', 'Ankle Swelling', 'Syncope', 'Claudication']
  },
  {
    id: 'resp',
    label: 'Respiratory',
    icon: Wind,
    color: 'blue',
    symptoms: ['Cough', 'Sputum', 'Hemoptysis', 'Wheezing', 'Chest Tightness', 'Stridor', 'Dyspnea']
  },
  {
    id: 'git',
    label: 'Gastrointestinal',
    icon: Coffee,
    color: 'emerald',
    symptoms: ['Abdominal Pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Jaundice', 'Dysphagia', 'Heartburn', 'Melena', 'Hematemesis']
  },
  {
    id: 'neuro',
    label: 'Neurological',
    icon: Brain,
    color: 'purple',
    symptoms: ['Headache', 'Dizziness', 'Syncope', 'Weakness', 'Numbness', 'Seizures', 'Confusion', 'Tremor', 'Memory Loss', 'Visual Changes']
  },
  {
    id: 'msk',
    label: 'Musculoskeletal',
    icon: Activity,
    color: 'orange',
    symptoms: ['Joint Pain', 'Joint Swelling', 'Muscle Stiffness', 'Back Pain', 'Neck Pain', 'Decreased Range of Motion']
  },
  {
    id: 'gu',
    label: 'Genitourinary',
    icon: Activity,
    color: 'teal',
    symptoms: ['Dysuria', 'Frequency', 'Urgency', 'Hematuria', 'Nocturia', 'Incontinence', 'Flank Pain']
  }
];

export default function SymptomSelector({ selectedSymptoms, onChange }: SymptomSelectorProps) {
  const [activeSystem, setActiveSystem] = useState(systems[0].id);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      onChange(selectedSymptoms.filter(s => s !== symptom));
    } else {
      onChange([...selectedSymptoms, symptom]);
    }
  };

  const currentSystem = systems.find(s => s.id === activeSystem)!;

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        {systems.map((system) => {
          const Icon = system.icon;
          const isActive = activeSystem === system.id;
          return (
            <button
              type="button"
              key={system.id}
              onClick={() => setActiveSystem(system.id)}
              className={`flex-1 flex flex-col items-center py-2 transition-all border-b-2 ${
                isActive ? 'bg-white border-sky-500 text-sky-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mb-1 ${isActive ? 'text-sky-500' : ''}`} />
              <span className="text-[8px] font-black uppercase tracking-wider">{system.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {currentSystem.symptoms.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <button
                type="button"
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-[11px] font-bold ${
                  isSelected 
                    ? 'bg-sky-50 border-sky-200 text-sky-800 ring-2 ring-sky-500/5' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>{symptom}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedSymptoms.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {selectedSymptoms.map(s => (
              <span key={s} className="badge-info flex items-center gap-1.5 py-0.5">
                {s}
                <button type="button" onClick={() => toggleSymptom(s)} className="hover:text-rose-500 font-black">×</button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
