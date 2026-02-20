import { AlertTriangle } from 'lucide-react';
import {
  EMERGENCY_SYMPTOM_IDS,
  SYMPTOM_DEFINITIONS,
  type SymptomDefinition,
} from '@oncolife/shared';

interface EmergencyCheckProps {
  onSelect: (symptomId: string) => void;
  onNone: () => void;
}

const emergencySymptoms: SymptomDefinition[] = EMERGENCY_SYMPTOM_IDS.map((id) => {
  // Emergency symptoms aren't in SYMPTOM_DEFINITIONS, define labels here
  const labels: Record<string, string> = {
    'URG-101': 'Chest Pain',
    'URG-102': 'Difficulty Breathing',
    'URG-103': 'Uncontrolled Bleeding',
    'URG-107': 'Seizure',
    'URG-108': 'Loss of Consciousness',
  };
  return {
    id,
    name: labels[id] || id,
    category: 'Hidden' as any,
    isEmergency: true,
  };
});

export function EmergencyCheck({ onSelect, onNone }: EmergencyCheckProps) {
  return (
    <div className="animate-fadeIn space-y-4">
      <div className="flex items-center gap-2 text-[#0F172A]">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <p className="text-sm font-medium">
          Are you experiencing any of these symptoms right now?
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {emergencySymptoms.map((sym) => (
          <button
            key={sym.id}
            onClick={() => onSelect(sym.id)}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-all duration-200 hover:bg-red-100 hover:border-red-300"
          >
            {sym.name}
          </button>
        ))}
      </div>

      <button
        onClick={onNone}
        className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#64748B] transition-all duration-200 hover:bg-[#F1F5F9]"
      >
        None of these
      </button>
    </div>
  );
}

