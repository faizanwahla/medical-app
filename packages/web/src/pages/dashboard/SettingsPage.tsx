import { Bell, BookOpen, LogOut, RotateCcw, Shield, SlidersHorizontal } from "lucide-react";
import { SPECIALTIES } from "@medical-app/shared";
import { useAppSettingsStore, useAuthStore } from "../../lib/store";
import apiClient from "../../lib/api";

const specialtyOptions = ["All Specialties", ...SPECIALTIES, "Respiratory Medicine", "Critical Care", "Urology"];

export default function SettingsPage() {
  const { logout } = useAuthStore();
  const {
    defaultLibrarySpecialty,
    showReferenceDetails,
    confirmBeforeCarePlanOrders,
    feverThreshold,
    tachycardiaThreshold,
    hypoxiaThreshold,
    systolicHypertensionThreshold,
    updateSettings,
    resetSettings,
  } = useAppSettingsStore();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="heading-2">System Configuration</h2>
        <p className="text-gray-500 font-medium mt-2">
          Persisted workflow preferences for clinical alerts, library behavior, and care-plan safety checks.
        </p>
      </div>

      <section className="card space-y-6">
        <SectionHeading icon={<Bell className="w-5 h-5" />} title="Clinical Alert Thresholds" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <NumberSetting
            label="Fever threshold"
            hint="Vitals above this temperature show as clinically significant."
            value={feverThreshold}
            step={0.1}
            onChange={(value) => updateSettings({ feverThreshold: value })}
          />
          <NumberSetting
            label="Tachycardia threshold"
            hint="Used in patient cards and quick clinical review."
            value={tachycardiaThreshold}
            onChange={(value) => updateSettings({ tachycardiaThreshold: value })}
          />
          <NumberSetting
            label="Hypoxia threshold"
            hint="SpO2 at or below this value is flagged as critical."
            value={hypoxiaThreshold}
            onChange={(value) => updateSettings({ hypoxiaThreshold: value })}
          />
          <NumberSetting
            label="Systolic hypertension threshold"
            hint="Used for blood pressure warning status."
            value={systolicHypertensionThreshold}
            onChange={(value) => updateSettings({ systolicHypertensionThreshold: value })}
          />
        </div>
      </section>

      <section className="card space-y-6">
        <SectionHeading icon={<BookOpen className="w-5 h-5" />} title="Library Preferences" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-600">
              Default specialty filter
            </label>
            <select
              className="input-field w-full"
              value={defaultLibrarySpecialty}
              onChange={(e) =>
                updateSettings({ defaultLibrarySpecialty: e.target.value })
              }
            >
              {specialtyOptions.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500">
              The disease library opens already filtered to this specialty.
            </p>
          </div>

          <ToggleSetting
            label="Show references in library"
            hint="Display textbook or guideline references in the disease playbook."
            checked={showReferenceDetails}
            onChange={(checked) => updateSettings({ showReferenceDetails: checked })}
          />
        </div>
      </section>

      <section className="card space-y-6">
        <SectionHeading icon={<Shield className="w-5 h-5" />} title="Care Plan Safety" />
        <ToggleSetting
          label="Confirm before applying care-plan orders"
          hint="Prompt before one-click ordering of recommended investigations or treatments from a disease playbook."
          checked={confirmBeforeCarePlanOrders}
          onChange={(checked) =>
            updateSettings({ confirmBeforeCarePlanOrders: checked })
          }
        />
      </section>

      <section className="card space-y-4">
        <SectionHeading icon={<SlidersHorizontal className="w-5 h-5" />} title="Actions" />
        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={resetSettings}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => {
              logout();
              void apiClient.logout();
            }}
            className="btn-danger flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Current Session</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-2xl bg-medical-50 text-medical-700">{icon}</div>
      <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">{title}</h3>
    </div>
  );
}

function NumberSetting({
  label,
  hint,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-gray-600">
        {label}
      </label>
      <input
        type="number"
        step={step}
        className="input-field w-full"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <p className="text-sm text-gray-500">{hint}</p>
    </div>
  );
}

function ToggleSetting({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 p-4 bg-gray-50">
      <div>
        <p className="font-bold text-gray-900">{label}</p>
        <p className="text-sm text-gray-500 mt-1">{hint}</p>
      </div>
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 accent-medical-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
