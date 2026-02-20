import { z } from 'zod';

// ── Auth ───────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'PROVIDER', 'NAVIGATOR', 'PATIENT']),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// ── Patient ────────────────────────────────────────────────────────

export const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  dateOfBirth: z.string().optional(),
  mrn: z.string().min(1),
  cancerType: z.string().optional(),
  planName: z.string().optional(),
  chemoStartDate: z.string().optional(),
  chemoEndDate: z.string().optional(),
  providerId: z.string().optional(),
  navigatorId: z.string().optional(),
});

export const updatePatientSchema = z.object({
  cancerType: z.string().optional(),
  planName: z.string().optional(),
  chemoStartDate: z.string().optional(),
  chemoEndDate: z.string().optional(),
  bmi: z.number().optional(),
  pmh: z.string().optional(),
  psh: z.string().optional(),
  currentMedications: z.string().optional(),
  disclaimerAccepted: z.boolean().optional(),
  privacyAccepted: z.boolean().optional(),
});

// ── Diary ──────────────────────────────────────────────────────────

export const createDiaryEntrySchema = z.object({
  content: z.string().min(1),
  forDoctor: z.boolean().optional().default(false),
});

export const updateDiaryEntrySchema = z.object({
  content: z.string().min(1).optional(),
  forDoctor: z.boolean().optional(),
});

// ── Daily Check-In ─────────────────────────────────────────────────

export const createCheckInSchema = z.object({
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
  summaryText: z.string().optional(),
  symptoms: z.array(z.string()),
  patientQuote: z.string().optional(),
  medicationsTried: z.string().optional(),
});

// ── Conversation ───────────────────────────────────────────────────

export const createConversationSchema = z.object({
  patientId: z.string().min(1),
});

export const respondConversationSchema = z.object({
  content: z.string().min(1),
  selectedOption: z.string().optional(),
});

// ── Summary ────────────────────────────────────────────────────────

export const createSummarySchema = z.object({
  summaryText: z.string().min(1),
  patientAddedNotes: z.string().optional(),
  recommendations: z.array(z.any()).optional().default([]),
  educationLinks: z.array(z.any()).optional().default([]),
});

// ── Staff ──────────────────────────────────────────────────────────

export const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'PROVIDER', 'NAVIGATOR']),
  phone: z.string().optional(),
  clinic: z.string().optional(),
  address: z.string().optional(),
  faxNumber: z.string().optional(),
});

export const updateStaffSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  clinic: z.string().optional(),
  address: z.string().optional(),
  faxNumber: z.string().optional(),
});

export const assignStaffSchema = z.object({
  providerIds: z.array(z.string().min(1)),
});

// ── Alert ──────────────────────────────────────────────────────────

export const acknowledgeAlertSchema = z.object({
  acknowledgedBy: z.string().optional(),
});

