import { TriageLevel, SeverityLevel, UserRole } from '@oncolife/shared';

// ── Types for mock data ─────────────────────────────────────────────

export interface MockPatient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  mrn: string;
  dateOfBirth: string;
  cancerType: string;
  planName: string;
  chemoStartDate: string;
  chemoEndDate: string;
  phone: string;
  email: string;
  lastChatbot: string;
  lastChemo: string;
  severity: TriageLevel;
  providerId: string;
  navigatorId?: string;
}

export interface MockClinician {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  clinic: string;
  address: string;
  faxNumber: string;
  status: 'active' | 'inactive';
  assignedProviderIds: string[];
}

export interface MockAlert {
  id: string;
  patientId: string;
  patientName: string;
  triageLevel: TriageLevel;
  symptom: string;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  createdAt: string;
}

export interface MockConversation {
  id: string;
  patientId: string;
  date: string;
  symptoms: string[];
  severity: SeverityLevel;
  triageLevel: TriageLevel;
  status: 'complete' | 'in_progress';
  messages: { role: 'bot' | 'patient'; content: string; timestamp: string }[];
}

export interface MockCheckIn {
  id: string;
  patientId: string;
  date: string;
  severity: SeverityLevel;
  summaryText: string;
  symptoms: string[];
  patientQuote?: string;
}

export interface MockTimelinePoint {
  date: string;
  cough?: number;
  pain?: number;
  vomiting?: number;
  constipation?: number;
  temperature?: number;
}

// ── Clinicians ──────────────────────────────────────────────────────

export const MOCK_CLINICIANS: MockClinician[] = [
  {
    id: 'c001', userId: 'u-c001', firstName: 'Sarah', lastName: 'Chen',
    email: 'sarah.chen@oncology.com', phone: '(555) 123-4567',
    role: UserRole.PROVIDER, clinic: 'Metro Oncology Center',
    address: '123 Medical Blvd, Suite 400, Chicago, IL 60601',
    faxNumber: '(555) 123-4568', status: 'active', assignedProviderIds: [],
  },
  {
    id: 'c002', userId: 'u-c002', firstName: 'Patricia', lastName: 'Williams',
    email: 'patricia.williams@oncology.com', phone: '(555) 234-5678',
    role: UserRole.NAVIGATOR, clinic: 'Metro Oncology Center',
    address: '123 Medical Blvd, Suite 400, Chicago, IL 60601',
    faxNumber: '(555) 234-5679', status: 'active', assignedProviderIds: ['c001'],
  },
  {
    id: 'c003', userId: 'u-c003', firstName: 'Admin', lastName: 'User',
    email: 'admin@oncology.com', phone: '(555) 345-6789',
    role: UserRole.ADMIN, clinic: 'Metro Oncology Center',
    address: '123 Medical Blvd, Suite 400, Chicago, IL 60601',
    faxNumber: '(555) 345-6790', status: 'active', assignedProviderIds: [],
  },
];

// ── Patients ────────────────────────────────────────────────────────

export const MOCK_PATIENTS: MockPatient[] = [
  {
    id: 'P001', userId: 'u-p001', firstName: 'Bobby', lastName: 'Johnson',
    mrn: 'MRN-10001', dateOfBirth: '1965-03-15', cancerType: 'Non-Small Cell Lung Cancer (NSCLC)',
    planName: 'Carboplatin/Paclitaxel', chemoStartDate: '2026-01-10', chemoEndDate: '2026-06-10',
    phone: '(555) 111-2222', email: 'bobby.j@email.com',
    lastChatbot: '2026-02-19', lastChemo: '2026-02-14',
    severity: TriageLevel.CALL_911, providerId: 'c001', navigatorId: 'c002',
  },
  {
    id: 'P002', userId: 'u-p002', firstName: 'Sarah', lastName: 'Johnson',
    mrn: 'MRN-10002', dateOfBirth: '1978-07-22', cancerType: 'Breast Cancer',
    planName: 'AC-T Protocol', chemoStartDate: '2026-01-15', chemoEndDate: '2026-07-15',
    phone: '(555) 222-3333', email: 'sarah.j@email.com',
    lastChatbot: '2026-02-20', lastChemo: '2026-02-10',
    severity: TriageLevel.URGENT, providerId: 'c001', navigatorId: 'c002',
  },
  {
    id: 'P003', userId: 'u-p003', firstName: 'Michael', lastName: 'Chen',
    mrn: 'MRN-10003', dateOfBirth: '1952-11-08', cancerType: 'Colorectal Cancer',
    planName: 'FOLFOX', chemoStartDate: '2026-02-01', chemoEndDate: '2026-08-01',
    phone: '(555) 333-4444', email: 'michael.c@email.com',
    lastChatbot: '2026-02-18', lastChemo: '2026-02-15',
    severity: TriageLevel.URGENT, providerId: 'c001',
  },
  {
    id: 'P004', userId: 'u-p004', firstName: 'Elena', lastName: 'Rodriguez',
    mrn: 'MRN-10004', dateOfBirth: '1970-05-30', cancerType: 'Ovarian Cancer',
    planName: 'Carboplatin/Taxol', chemoStartDate: '2025-12-01', chemoEndDate: '2026-05-01',
    phone: '(555) 444-5555', email: 'elena.r@email.com',
    lastChatbot: '2026-02-20', lastChemo: '2026-02-12',
    severity: TriageLevel.NONE, providerId: 'c001', navigatorId: 'c002',
  },
  {
    id: 'P005', userId: 'u-p005', firstName: 'James', lastName: 'Wilson',
    mrn: 'MRN-10005', dateOfBirth: '1960-09-12', cancerType: 'Prostate Cancer',
    planName: 'Docetaxel', chemoStartDate: '2026-01-20', chemoEndDate: '2026-07-20',
    phone: '(555) 555-6666', email: 'james.w@email.com',
    lastChatbot: '2026-02-17', lastChemo: '2026-02-13',
    severity: TriageLevel.NOTIFY_CARE_TEAM, providerId: 'c001',
  },
];

// ── Conversations ───────────────────────────────────────────────────

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: 'conv-001', patientId: 'P001', date: '2026-02-19',
    symptoms: ['Fever', 'Cough'], severity: SeverityLevel.SEVERE,
    triageLevel: TriageLevel.CALL_911, status: 'complete',
    messages: [
      { role: 'bot', content: 'Hello Bobby, how are you feeling today?', timestamp: '2026-02-19T14:00:00Z' },
      { role: 'patient', content: 'Not good. I have a high fever and can\'t stop coughing.', timestamp: '2026-02-19T14:01:00Z' },
      { role: 'bot', content: 'I\'m sorry to hear that. What is your current temperature?', timestamp: '2026-02-19T14:01:30Z' },
      { role: 'patient', content: '103.2 degrees', timestamp: '2026-02-19T14:02:00Z' },
      { role: 'bot', content: 'That is a high fever. Given your chemotherapy treatment, this requires immediate medical attention. Please call 911 or go to the nearest emergency room.', timestamp: '2026-02-19T14:02:30Z' },
    ],
  },
  {
    id: 'conv-002', patientId: 'P001', date: '2026-02-17',
    symptoms: ['Pain', 'Fatigue'], severity: SeverityLevel.MODERATE,
    triageLevel: TriageLevel.NOTIFY_CARE_TEAM, status: 'complete',
    messages: [
      { role: 'bot', content: 'Hello Bobby, let\'s check in on your symptoms today.', timestamp: '2026-02-17T10:00:00Z' },
      { role: 'patient', content: 'I have some body aches and I\'m really tired.', timestamp: '2026-02-17T10:01:00Z' },
      { role: 'bot', content: 'How would you rate your pain on a scale of 1-10?', timestamp: '2026-02-17T10:01:30Z' },
      { role: 'patient', content: 'About a 5. It\'s manageable with Tylenol.', timestamp: '2026-02-17T10:02:00Z' },
    ],
  },
  {
    id: 'conv-003', patientId: 'P002', date: '2026-02-20',
    symptoms: ['Vomiting', 'Nausea'], severity: SeverityLevel.SEVERE,
    triageLevel: TriageLevel.URGENT, status: 'complete',
    messages: [
      { role: 'bot', content: 'Hi Sarah, how are you feeling today?', timestamp: '2026-02-20T08:00:00Z' },
      { role: 'patient', content: 'Terrible. I\'ve been vomiting all morning. Can\'t keep anything down.', timestamp: '2026-02-20T08:01:00Z' },
      { role: 'bot', content: 'How many times have you vomited today?', timestamp: '2026-02-20T08:01:30Z' },
      { role: 'patient', content: 'At least 8 times since last night.', timestamp: '2026-02-20T08:02:00Z' },
    ],
  },
  {
    id: 'conv-004', patientId: 'P004', date: '2026-02-20',
    symptoms: ['Nausea'], severity: SeverityLevel.MILD,
    triageLevel: TriageLevel.NONE, status: 'complete',
    messages: [
      { role: 'bot', content: 'Hello Elena, how are you doing today?', timestamp: '2026-02-20T11:00:00Z' },
      { role: 'patient', content: 'A little queasy but overall okay. The medication helps.', timestamp: '2026-02-20T11:01:00Z' },
    ],
  },
  {
    id: 'conv-005', patientId: 'P003', date: '2026-02-18',
    symptoms: ['Pain', 'Constipation'], severity: SeverityLevel.SEVERE,
    triageLevel: TriageLevel.URGENT, status: 'complete',
    messages: [
      { role: 'bot', content: 'Hi Michael, let\'s check on your symptoms.', timestamp: '2026-02-18T09:00:00Z' },
      { role: 'patient', content: 'My stomach pain is really bad today. I also haven\'t been able to go to the bathroom in 4 days.', timestamp: '2026-02-18T09:01:00Z' },
    ],
  },
];

// ── Check-ins ───────────────────────────────────────────────────────

export const MOCK_CHECKINS: MockCheckIn[] = [
  {
    id: 'ci-001', patientId: 'P001', date: '2026-02-19',
    severity: SeverityLevel.SEVERE,
    summaryText: 'Patient reports high fever (103.2°F) and persistent cough. Emergency triage triggered.',
    symptoms: ['Fever', 'Cough'],
    patientQuote: 'I feel really hot and the cough won\'t stop.',
  },
  {
    id: 'ci-002', patientId: 'P001', date: '2026-02-17',
    severity: SeverityLevel.MODERATE,
    summaryText: 'Moderate body pain and fatigue. Managing with Tylenol.',
    symptoms: ['Pain', 'Fatigue'],
    patientQuote: 'The body aches are tough but I can handle it.',
  },
  {
    id: 'ci-003', patientId: 'P001', date: '2026-02-15',
    severity: SeverityLevel.MILD,
    summaryText: 'Mild fatigue post-chemo. No other significant symptoms.',
    symptoms: ['Fatigue'],
  },
  {
    id: 'ci-004', patientId: 'P002', date: '2026-02-20',
    severity: SeverityLevel.SEVERE,
    summaryText: 'Persistent vomiting (8+ episodes). Unable to keep food/fluids down.',
    symptoms: ['Vomiting', 'Nausea'],
    patientQuote: 'I can\'t stop throwing up. Nothing stays down.',
  },
  {
    id: 'ci-005', patientId: 'P003', date: '2026-02-18',
    severity: SeverityLevel.SEVERE,
    summaryText: 'Severe abdominal pain (9/10) and 4-day constipation.',
    symptoms: ['Pain', 'Constipation'],
  },
  {
    id: 'ci-006', patientId: 'P004', date: '2026-02-20',
    severity: SeverityLevel.MILD,
    summaryText: 'Mild nausea well-controlled with medication. Good overall status.',
    symptoms: ['Nausea'],
    patientQuote: 'Feeling okay today, just a little queasy.',
  },
  {
    id: 'ci-007', patientId: 'P005', date: '2026-02-17',
    severity: SeverityLevel.MODERATE,
    summaryText: 'Increasing fatigue affecting daily activities. Mild neuropathy in fingers.',
    symptoms: ['Fatigue', 'Neuropathy'],
  },
];

// ── Alerts ─────────────────────────────────────────────────────────

export const MOCK_ALERTS: MockAlert[] = [
  {
    id: 'alert-001', patientId: 'P001', patientName: 'Bobby Johnson',
    triageLevel: TriageLevel.CALL_911, symptom: 'Fever',
    message: 'Temperature 103.2°F — patient reports severe chills and confusion.',
    acknowledged: false, createdAt: '2026-02-19T14:30:00Z',
  },
  {
    id: 'alert-002', patientId: 'P001', patientName: 'Bobby Johnson',
    triageLevel: TriageLevel.URGENT, symptom: 'Cough',
    message: 'Very severe cough with blood-tinged sputum reported.',
    acknowledged: false, createdAt: '2026-02-19T10:15:00Z',
  },
  {
    id: 'alert-003', patientId: 'P002', patientName: 'Sarah Johnson',
    triageLevel: TriageLevel.NOTIFY_CARE_TEAM, symptom: 'Nausea',
    message: 'Persistent nausea for 3 days, unable to keep medications down.',
    acknowledged: false, createdAt: '2026-02-18T16:00:00Z',
  },
  {
    id: 'alert-004', patientId: 'P003', patientName: 'Michael Chen',
    triageLevel: TriageLevel.URGENT, symptom: 'Pain',
    message: 'Severe abdominal pain rated 9/10, not relieved by current medications.',
    acknowledged: true, acknowledgedBy: 'c001', createdAt: '2026-02-18T09:00:00Z',
  },
  {
    id: 'alert-005', patientId: 'P004', patientName: 'Elena Rodriguez',
    triageLevel: TriageLevel.NOTIFY_CARE_TEAM, symptom: 'Fatigue',
    message: 'Extreme fatigue making daily activities impossible, worsening trend.',
    acknowledged: false, createdAt: '2026-02-17T11:30:00Z',
  },
];

// ── 7-day symptom timeline for P001 ─────────────────────────────────

export const MOCK_TIMELINE_P001: MockTimelinePoint[] = [
  { date: '02/14', cough: 1, pain: 2, vomiting: 0, constipation: 0, temperature: 98.6 },
  { date: '02/15', cough: 1, pain: 1, vomiting: 0, constipation: 1, temperature: 98.8 },
  { date: '02/16', cough: 2, pain: 2, vomiting: 0, constipation: 1, temperature: 99.1 },
  { date: '02/17', cough: 2, pain: 3, vomiting: 0, constipation: 0, temperature: 99.5 },
  { date: '02/18', cough: 3, pain: 2, vomiting: 1, constipation: 0, temperature: 100.2 },
  { date: '02/19', cough: 4, pain: 3, vomiting: 1, constipation: 0, temperature: 103.2 },
  { date: '02/20', cough: 3, pain: 2, vomiting: 0, constipation: 0, temperature: 101.0 },
];

// Severity scale: 0=none, 1=mild, 2=moderate, 3=severe, 4=very severe

export function getTimelineForPatient(patientId: string): MockTimelinePoint[] {
  if (patientId === 'P001') return MOCK_TIMELINE_P001;
  // Generate generic 7-day data for other patients
  const base = new Date('2026-02-14');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    return {
      date: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
      cough: Math.floor(Math.random() * 3),
      pain: Math.floor(Math.random() * 4),
      vomiting: Math.floor(Math.random() * 2),
      constipation: Math.floor(Math.random() * 2),
      temperature: 97.5 + Math.random() * 3,
    };
  });
}

export function getConversationsForPatient(patientId: string): MockConversation[] {
  return MOCK_CONVERSATIONS.filter((c) => c.patientId === patientId);
}

export function getCheckInsForPatient(patientId: string): MockCheckIn[] {
  return MOCK_CHECKINS.filter((c) => c.patientId === patientId);
}

export function getAlertsForPatient(patientId: string): MockAlert[] {
  return MOCK_ALERTS.filter((a) => a.patientId === patientId);
}

