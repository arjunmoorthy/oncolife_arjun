import {
  UserRole,
  ConversationPhase,
  TriageLevel,
  SeverityLevel,
  MessageType,
  MessageRole,
} from './enums';

// ── User & Auth ─────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  token: string;
  user: User;
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

// ── Patient ─────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  userId: string;
  dateOfBirth?: string;
  mrn: string;
  cancerType?: string;
  planName?: string;
  chemoStartDate?: string;
  chemoEndDate?: string;
  bmi?: number;
  pmh?: string;
  psh?: string;
  currentMedications?: string;
  disclaimerAccepted: boolean;
  privacyAccepted: boolean;
  createdAt: string;
}

// ── Clinician ───────────────────────────────────────────────────────

export interface Clinician {
  id: string;
  userId: string;
  clinic?: string;
  address?: string;
  faxNumber?: string;
  assignedProviderIds: string[];
}

// ── Conversation ────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  patientId: string;
  phase: ConversationPhase;
  startedAt: string;
  completedAt?: string;
  triageLevel?: TriageLevel;
  isEmergency: boolean;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  messageType: MessageType;
  options?: unknown;
  selectedOption?: string;
  timestamp: string;
}

// ── Symptom Report ──────────────────────────────────────────────────

export interface SymptomReport {
  id: string;
  conversationId: string;
  symptomId: string;
  severity: SeverityLevel;
  duration?: string;
  triageLevel: TriageLevel;
  notes?: string;
  medicationsTried?: string;
  branchedFrom?: string;
}

// ── Session Summary ─────────────────────────────────────────────────

export interface SessionSummary {
  id: string;
  conversationId: string;
  patientId: string;
  summaryText: string;
  patientAddedNotes?: string;
  recommendations: unknown[];
  educationLinks: unknown[];
  createdAt: string;
}

// ── Daily Check-In ──────────────────────────────────────────────────

export interface DailyCheckIn {
  id: string;
  patientId: string;
  date: string;
  severity: SeverityLevel;
  summaryText?: string;
  symptoms: unknown[];
  patientQuote?: string;
  medicationsTried?: string;
  createdAt: string;
}

// ── Diary Entry ─────────────────────────────────────────────────────

export interface DiaryEntry {
  id: string;
  patientId: string;
  content: string;
  forDoctor: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Education Resource ──────────────────────────────────────────────

export interface EducationResource {
  id: string;
  title: string;
  description?: string;
  content: string;
  category: string;
  readTimeMinutes?: number;
  priority?: number;
  symptoms: unknown[];
  createdAt: string;
}

// ── Alert ───────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  patientId: string;
  conversationId?: string;
  triageLevel: TriageLevel;
  symptomId?: string;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  createdAt: string;
}

