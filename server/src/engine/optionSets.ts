// ── Standard Option Sets (PRD 5.4.12) ──────────────────────────────

export const SEVERITY_OPTIONS = [
  'Mild (1–3)',
  'Moderate (4–6)',
  'Severe (7–10)',
];

export const ORAL_INTAKE_OPTIONS_24H = [
  'Reduced but eating',
  'Having difficulty eating/drinking',
  'Barely eating/drinking',
  'Not able to eat/drink at all',
  'Normal',
];

export const ORAL_INTAKE_OPTIONS_12H = [
  'Reduced but eating',
  'Having difficulty eating/drinking',
  'Barely eating/drinking',
  'Not able to eat/drink at all',
  'Normal',
];

export const DEHYDRATION_SIGNS = [
  'Dark urine',
  'Less urine than usual',
  'Very thirsty',
  'Lightheaded',
  'I know my vitals',
  'None of these',
];

export const MEDS_NAUSEA = [
  'Compazine (prochlorperazine) 5mg q6h',
  'Zofran (ondansetron) 8mg q8h',
  'Olanzapine 5mg daily',
  'Other',
  'None',
];

export const MEDS_DIARRHEA = [
  'Imodium (loperamide) 4mg then 2mg after each loose stool',
  'Lomotil 1–2 tablets four times daily',
  'Other',
  'None',
];

export const MEDS_CONSTIPATION = [
  'Miralax once daily',
  'Miralax twice daily',
  'Senna',
  'Bisacodyl (Dulcolax)',
  'Docusate (Colace)',
  'Other',
  'None',
];

export const MEDS_NEUROPATHY = [
  'Gabapentin',
  'Duloxetine',
  'Pregabalin',
  'Other',
  'None',
];

export const MEDS_COUGH = [
  'Robitussin (dextromethorphan) 10–20mg every 4h',
  'Robitussin DM 30mg every 6–8h',
  'Other',
  'None',
];

export const LAST_CHEMO_OPTIONS = [
  'Today',
  'Yesterday',
  '2–3 days ago',
  '4–7 days ago',
  '1–2 weeks ago',
  'More than 2 weeks ago',
  'None',
];

export const PHYSICIAN_VISIT_OPTIONS = [
  'Today',
  'Tomorrow',
  'In 2–3 days',
  'This week',
  'Next week',
  'More than 2 weeks away',
  'Not scheduled',
];

export const YES_NO_OPTIONS = ['Yes', 'No'];

export const WORSENING_OPTIONS = ['Worsening', 'Same', 'Improving'];

export const DURATION_OPTIONS = [
  'Less than 24 hours',
  '24 hours',
  '2–3 days',
  'More than 3 days',
];

export const VOMITING_FREQUENCY_OPTIONS = [
  '1–2 times',
  '3–5 times',
  'More than 6 times',
];

export const STOOL_SYMPTOMS = [
  'Black stool',
  'Blood in stool',
  'Mucus',
  'Other',
  'None',
];

export const PAIN_LOCATIONS = [
  'Chest',
  'Port/IV Site',
  'Head',
  'Leg/Calf',
  'Abdomen',
  'Urinary/Pelvic',
  'Joints/Muscles',
  'General Aches',
  'Nerve Burning/Tingling',
  'Mouth/Throat',
  'Other',
];

export const HEADACHE_NEURO_SYMPTOMS = [
  'Blurred/double vision',
  'Trouble speaking',
  'Face droopy',
  'Arm/leg weak',
  'Trouble walking',
  'Confusion',
  'None',
];

export const SKIN_LOCATIONS = [
  'Face',
  'Chest',
  'Arms',
  'Legs',
  'Hands/Feet',
  'Infusion Site',
  'Other',
];

export const FEVER_ASSOCIATED_SYMPTOMS = [
  'Heart rate over 100',
  'Nausea',
  'Vomiting',
  'Abdominal Pain',
  'Diarrhea',
  'Port redness',
  'Cough',
  'Dizziness',
  'Confusion',
  'Burning urination',
  'Chills',
  'Other',
  'None',
];

export const JOINT_PAIN_TYPE = [
  'Joint',
  'Muscle',
  'General aches',
];

export const PAIN_DESCRIPTION = [
  'Sharp',
  'Dull',
  'Burning',
  'Throbbing',
];

export const HEADACHE_ONSET = [
  'Sudden',
  'Today',
  '1–3 days ago',
  'More than 3 days',
];

export const MUCUS_OPTIONS = [
  'No',
  'Clear',
  'Yellow-green',
  'Blood-streaked',
];

export const URINE_COLOR_OPTIONS = [
  'Clear/pale',
  'Light yellow',
  'Dark yellow',
  'Orange',
  'Brown',
];

export const SWELLING_LOCATIONS = [
  'Face',
  'Neck',
  'Arms',
  'Legs',
  'Feet/Ankles',
  'Abdomen',
  'Other',
];

export const SWELLING_ASSOCIATED = [
  'Shortness of breath',
  'Chest discomfort',
  'Fever',
  'Redness',
  'None',
];

export const EYE_SYMPTOMS = [
  'Pain',
  'Discharge',
  'Excessive tearing',
  'None',
];

export const BURNING_URINATION_OPTIONS = [
  'No',
  'Mild',
  'Moderate',
  'Severe',
];

// Emergency symptom buttons for EMERGENCY_CHECK phase
export const EMERGENCY_BUTTONS = [
  { id: 'URG-101', label: 'Trouble Breathing' },
  { id: 'URG-102', label: 'Chest Pain' },
  { id: 'URG-103', label: 'Significant Bleeding' },
  { id: 'URG-107', label: 'Fainting' },
  { id: 'URG-108', label: 'Confusion' },
];

// Symptom selection categories for SYMPTOM_SELECTION phase
export const SYMPTOM_SELECTION_CATEGORIES = [
  {
    category: 'Digestive',
    symptoms: [
      { id: 'NAU-203', label: 'Nausea' },
      { id: 'VOM-204', label: 'Vomiting' },
      { id: 'DIA-205', label: 'Diarrhea' },
      { id: 'CON-210', label: 'Constipation' },
      { id: 'APP-209', label: 'No Appetite' },
      { id: 'MSO-208', label: 'Mouth Sores' },
      { id: 'DEH-201', label: 'Dehydration' },
    ],
  },
  {
    category: 'Pain & Nerve',
    symptoms: [
      { id: 'PAI-213', label: 'Pain' },
      { id: 'NEU-216', label: 'Neuropathy' },
    ],
  },
  {
    category: 'Systemic',
    symptoms: [
      { id: 'FEV-202', label: 'Fever' },
      { id: 'FAT-206', label: 'Fatigue' },
      { id: 'COU-215', label: 'Cough' },
      { id: 'URI-211', label: 'Urinary Problems' },
    ],
  },
  {
    category: 'Skin & External',
    symptoms: [
      { id: 'SKI-212', label: 'Skin Rash/Redness' },
      { id: 'SWE-214', label: 'Swelling' },
      { id: 'EYE-207', label: 'Eye Complaints' },
    ],
  },
];

