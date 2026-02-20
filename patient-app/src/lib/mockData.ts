import {
  ConversationPhase,
  TriageLevel,
  SeverityLevel,
  MessageType,
  MessageRole,
} from '@oncolife/shared';
import type {
  User,
  Conversation,
  ConversationMessage,
  SessionSummary,
  DailyCheckIn,
} from '@oncolife/shared';

// ── Mock User ──────────────────────────────────────────────────────

export const mockUser: User = {
  id: 'usr-001',
  email: 'sarah.johnson@email.com',
  role: 'PATIENT' as any,
  firstName: 'Sarah',
  lastName: 'Johnson',
  phone: '(555) 123-4567',
  createdAt: '2025-09-15T10:00:00Z',
  updatedAt: '2026-02-20T08:00:00Z',
};

export const mockPatientProfile = {
  dateOfBirth: '1978-03-15',
  location: 'Portland, OR',
  cancerType: 'Breast Cancer - Stage II',
  planName: 'AC-T Chemotherapy',
  chemoDay: 'Tuesday',
  nextChemoDate: '2026-02-25',
  chemoStartDate: '2025-11-01',
};

// ── Mock Conversations ─────────────────────────────────────────────

export const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    patientId: 'usr-001',
    phase: ConversationPhase.COMPLETED,
    startedAt: '2026-02-20T09:00:00Z',
    completedAt: '2026-02-20T09:25:00Z',
    triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
    isEmergency: false,
  },
  {
    id: 'conv-002',
    patientId: 'usr-001',
    phase: ConversationPhase.COMPLETED,
    startedAt: '2026-02-19T10:00:00Z',
    completedAt: '2026-02-19T10:20:00Z',
    triageLevel: TriageLevel.NONE,
    isEmergency: false,
  },
];

// ── Mock Messages ──────────────────────────────────────────────────

export const mockMessages: ConversationMessage[] = [
  {
    id: 'msg-001',
    conversationId: 'conv-001',
    role: MessageRole.BOT,
    content: "Hi Sarah! 👋 I'm Ruby, your symptom management assistant. How are you feeling today?",
    messageType: MessageType.TEXT,
    timestamp: '2026-02-20T09:00:00Z',
  },
  {
    id: 'msg-002',
    conversationId: 'conv-001',
    role: MessageRole.PATIENT,
    content: 'Nausea, Fatigue',
    messageType: MessageType.TEXT,
    selectedOption: 'NAU-203,FAT-206',
    timestamp: '2026-02-20T09:01:00Z',
  },
  {
    id: 'msg-003',
    conversationId: 'conv-001',
    role: MessageRole.BOT,
    content: "Let's start with your nausea. How would you rate the severity?",
    messageType: MessageType.OPTION_SELECT,
    options: [
      { label: 'Mild', value: 'mild' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'Severe', value: 'severe' },
    ],
    timestamp: '2026-02-20T09:01:30Z',
  },
  {
    id: 'msg-004',
    conversationId: 'conv-001',
    role: MessageRole.PATIENT,
    content: 'Moderate',
    messageType: MessageType.TEXT,
    selectedOption: 'moderate',
    timestamp: '2026-02-20T09:02:00Z',
  },
  {
    id: 'msg-005',
    conversationId: 'conv-001',
    role: MessageRole.BOT,
    content: 'How many days have you been experiencing nausea?',
    messageType: MessageType.NUMBER_INPUT,
    timestamp: '2026-02-20T09:02:30Z',
  },
];

// ── Mock Summaries ─────────────────────────────────────────────────

export const mockSummaries: (SessionSummary & { severity?: SeverityLevel; symptoms?: string[] })[] = [
  {
    id: 'sum-001',
    conversationId: 'conv-001',
    patientId: 'usr-001',
    summaryText: 'Patient reported moderate nausea for 3 days and mild fatigue. Anti-nausea medication partially effective. Oral intake maintained but reduced. Recommend monitoring and possible medication adjustment.',
    patientAddedNotes: 'The nausea is worst in the mornings.',
    recommendations: ['Continue anti-nausea medication', 'Try ginger tea', 'Small frequent meals'],
    educationLinks: [],
    createdAt: '2026-02-20T09:25:00Z',
    severity: SeverityLevel.MODERATE,
    symptoms: ['Nausea', 'Fatigue'],
  },
  {
    id: 'sum-002',
    conversationId: 'conv-002',
    patientId: 'usr-001',
    summaryText: 'Patient reported mild constipation for 2 days. Adequate fluid intake. No abdominal pain. Recommend increasing fiber and hydration.',
    recommendations: ['Increase fiber intake', 'Drink 8 glasses of water daily'],
    educationLinks: [],
    createdAt: '2026-02-19T10:20:00Z',
    severity: SeverityLevel.MILD,
    symptoms: ['Constipation'],
  },
];

// ── Mock Diary Entries ─────────────────────────────────────────────

export interface DiaryEntry {
  id: string;
  patientId: string;
  date: string;
  content: string;
  forDoctor: boolean;
  createdAt: string;
}

export const mockDiaryEntries: DiaryEntry[] = [
  {
    id: 'diary-001',
    patientId: 'usr-001',
    date: '2026-02-20',
    content: 'Feeling a bit better today. The nausea was manageable after taking the medication early. Managed to eat a full breakfast for the first time this week.',
    forDoctor: false,
    createdAt: '2026-02-20T18:00:00Z',
  },
  {
    id: 'diary-002',
    patientId: 'usr-001',
    date: '2026-02-19',
    content: 'Rough day. Nausea was bad in the morning. Had to rest most of the afternoon. Want to ask Dr. Chen about adjusting my anti-nausea meds.',
    forDoctor: true,
    createdAt: '2026-02-19T20:00:00Z',
  },
  {
    id: 'diary-003',
    patientId: 'usr-001',
    date: '2026-02-17',
    content: 'Good energy today! Went for a short walk around the block. Feeling hopeful about the next cycle.',
    forDoctor: false,
    createdAt: '2026-02-17T15:00:00Z',
  },
];

// ── Mock Education Resources ───────────────────────────────────────

export interface EducationResource {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  isNew: boolean;
  priority: 'high' | 'medium' | 'low';
  url: string;
  relatedSymptoms: string[];
}

export const mockEducationResources: EducationResource[] = [
  {
    id: 'edu-001',
    title: 'Managing Chemotherapy-Induced Nausea',
    description: 'Learn effective strategies to manage nausea during chemotherapy, including dietary tips, medication timing, and lifestyle adjustments.',
    category: 'Symptom Management',
    readTime: '5 min',
    isNew: true,
    priority: 'high',
    url: '#',
    relatedSymptoms: ['Nausea', 'Vomiting'],
  },
  {
    id: 'edu-002',
    title: 'Nutrition During Cancer Treatment',
    description: 'A comprehensive guide to maintaining proper nutrition while undergoing chemotherapy. Includes meal planning tips and recipes.',
    category: 'Nutrition',
    readTime: '8 min',
    isNew: false,
    priority: 'medium',
    url: '#',
    relatedSymptoms: ['Appetite Loss', 'Nausea'],
  },
  {
    id: 'edu-003',
    title: 'Understanding Fatigue in Cancer Patients',
    description: 'Why cancer-related fatigue is different from normal tiredness and what you can do to manage your energy levels.',
    category: 'Symptom Management',
    readTime: '6 min',
    isNew: true,
    priority: 'high',
    url: '#',
    relatedSymptoms: ['Fatigue'],
  },
  {
    id: 'edu-004',
    title: 'Exercise and Movement During Treatment',
    description: 'Safe exercises and movement practices that can help improve energy, mood, and overall well-being during chemotherapy.',
    category: 'Wellness',
    readTime: '4 min',
    isNew: false,
    priority: 'low',
    url: '#',
    relatedSymptoms: ['Fatigue', 'Joint/Muscle Pain'],
  },
  {
    id: 'edu-005',
    title: 'When to Call Your Care Team',
    description: 'Know the warning signs that require immediate medical attention and when to contact your oncology team.',
    category: 'Safety',
    readTime: '3 min',
    isNew: false,
    priority: 'high',
    url: '#',
    relatedSymptoms: [],
  },
];

