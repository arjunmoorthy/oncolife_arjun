// ── Symptom Categories ──────────────────────────────────────────────

export const SYMPTOM_CATEGORIES = {
  DIGESTIVE: 'Digestive',
  PAIN_NERVE: 'Pain & Nerve',
  SYSTEMIC: 'Systemic',
  SKIN_EXTERNAL: 'Skin & External',
  HIDDEN: 'Hidden',
} as const;

export type SymptomCategory = (typeof SYMPTOM_CATEGORIES)[keyof typeof SYMPTOM_CATEGORIES];

// ── Symptom IDs ─────────────────────────────────────────────────────

// Digestive
export const SYM_NAUSEA = 'NAU-203';
export const SYM_VOMITING = 'VOM-204';
export const SYM_DIARRHEA = 'DIA-205';
export const SYM_CONSTIPATION = 'CON-210';
export const SYM_APPETITE_LOSS = 'APP-209';
export const SYM_MOUTH_SORES = 'MSO-208';
export const SYM_DEHYDRATION = 'DEH-201';

// Pain & Nerve
export const SYM_PAIN = 'PAI-213';
export const SYM_NEUROPATHY = 'NEU-216';
export const SYM_HEADACHE = 'HEA-210';
export const SYM_ABDOMINAL_PAIN = 'ABD-211';
export const SYM_LEG_PAIN = 'LEG-208';
export const SYM_URINARY_URGENCY = 'URG-114';
export const SYM_JOINT_MUSCLE_PAIN = 'JMP-212';

// Systemic
export const SYM_FEVER = 'FEV-202';
export const SYM_FATIGUE = 'FAT-206';
export const SYM_COUGH = 'COU-215';
export const SYM_URINARY_ISSUES = 'URI-211';

// Skin & External
export const SYM_SKIN_CHANGES = 'SKI-212';
export const SYM_SWELLING = 'SWE-214';
export const SYM_EYE_CHANGES = 'EYE-207';

// Hidden
export const SYM_NEUROLOGICAL = 'NEU-304';

// ── All Symptom IDs ─────────────────────────────────────────────────

export const ALL_SYMPTOM_IDS = [
  SYM_NAUSEA, SYM_VOMITING, SYM_DIARRHEA, SYM_CONSTIPATION,
  SYM_APPETITE_LOSS, SYM_MOUTH_SORES, SYM_DEHYDRATION,
  SYM_PAIN, SYM_NEUROPATHY, SYM_HEADACHE, SYM_ABDOMINAL_PAIN,
  SYM_LEG_PAIN, SYM_URINARY_URGENCY, SYM_JOINT_MUSCLE_PAIN,
  SYM_FEVER, SYM_FATIGUE, SYM_COUGH, SYM_URINARY_ISSUES,
  SYM_SKIN_CHANGES, SYM_SWELLING, SYM_EYE_CHANGES,
  SYM_NEUROLOGICAL,
] as const;

// ── Emergency Symptom IDs ───────────────────────────────────────────

export const EMG_CHEST_PAIN = 'URG-101';
export const EMG_BREATHING_DIFFICULTY = 'URG-102';
export const EMG_UNCONTROLLED_BLEEDING = 'URG-103';
export const EMG_SEIZURE = 'URG-107';
export const EMG_LOSS_OF_CONSCIOUSNESS = 'URG-108';

export const EMERGENCY_SYMPTOM_IDS = [
  EMG_CHEST_PAIN,
  EMG_BREATHING_DIFFICULTY,
  EMG_UNCONTROLLED_BLEEDING,
  EMG_SEIZURE,
  EMG_LOSS_OF_CONSCIOUSNESS,
] as const;

// ── Symptom Metadata Type ───────────────────────────────────────────

export interface SymptomDefinition {
  id: string;
  name: string;
  category: SymptomCategory;
  isEmergency: boolean;
}

export const SYMPTOM_DEFINITIONS: SymptomDefinition[] = [
  { id: SYM_NAUSEA, name: 'Nausea', category: 'Digestive', isEmergency: false },
  { id: SYM_VOMITING, name: 'Vomiting', category: 'Digestive', isEmergency: false },
  { id: SYM_DIARRHEA, name: 'Diarrhea', category: 'Digestive', isEmergency: false },
  { id: SYM_CONSTIPATION, name: 'Constipation', category: 'Digestive', isEmergency: false },
  { id: SYM_APPETITE_LOSS, name: 'Appetite Loss', category: 'Digestive', isEmergency: false },
  { id: SYM_MOUTH_SORES, name: 'Mouth Sores', category: 'Digestive', isEmergency: false },
  { id: SYM_DEHYDRATION, name: 'Dehydration', category: 'Digestive', isEmergency: false },
  { id: SYM_PAIN, name: 'Pain', category: 'Pain & Nerve', isEmergency: false },
  { id: SYM_NEUROPATHY, name: 'Neuropathy', category: 'Pain & Nerve', isEmergency: false },
  { id: SYM_HEADACHE, name: 'Headache', category: 'Pain & Nerve', isEmergency: false },
  { id: SYM_ABDOMINAL_PAIN, name: 'Abdominal Pain', category: 'Pain & Nerve', isEmergency: false },
  { id: SYM_LEG_PAIN, name: 'Leg Pain', category: 'Pain & Nerve', isEmergency: false },
  { id: SYM_URINARY_URGENCY, name: 'Urinary Urgency', category: 'Pain & Nerve', isEmergency: false },
  { id: SYM_JOINT_MUSCLE_PAIN, name: 'Joint/Muscle Pain', category: 'Pain & Nerve', isEmergency: false },
  { id: SYM_FEVER, name: 'Fever', category: 'Systemic', isEmergency: false },
  { id: SYM_FATIGUE, name: 'Fatigue', category: 'Systemic', isEmergency: false },
  { id: SYM_COUGH, name: 'Cough', category: 'Systemic', isEmergency: false },
  { id: SYM_URINARY_ISSUES, name: 'Urinary Issues', category: 'Systemic', isEmergency: false },
  { id: SYM_SKIN_CHANGES, name: 'Skin Changes', category: 'Skin & External', isEmergency: false },
  { id: SYM_SWELLING, name: 'Swelling', category: 'Skin & External', isEmergency: false },
  { id: SYM_EYE_CHANGES, name: 'Eye Changes', category: 'Skin & External', isEmergency: false },
  { id: SYM_NEUROLOGICAL, name: 'Neurological', category: 'Hidden', isEmergency: false },
];

