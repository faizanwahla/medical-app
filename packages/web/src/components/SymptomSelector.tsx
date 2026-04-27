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
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="flex border-b border-gray-50 bg-gray-50/30">
        {systems.map((system) => {
          const Icon = system.icon;
          const isActive = activeSystem === system.id;
          return (
            <button
              key={system.id}
              onClick={() => setActiveSystem(system.id)}
              className={`flex-1 flex flex-col items-center py-4 transition-all ${
                isActive ? 'bg-white border-b-2 border-medical-600 text-medical-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-medical-600' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-wider">{system.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {currentSystem.symptoms.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                  isSelected 
                    ? 'bg-medical-50 border-medical-200 text-medical-800 ring-2 ring-medical-500/10' 
                    : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{symptom}</span>
                {isSelected && <Check className="w-4 h-4 text-medical-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedSymptoms.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map(s => (
              <span key={s} className="px-3 py-1 bg-medical-600 text-white text-[10px] font-bold rounded-full uppercase flex items-center">
                {s}
                <button onClick={() => toggleSymptom(s)} className="ml-2 hover:text-red-200">×</button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
