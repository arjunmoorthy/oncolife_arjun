import {
  ConversationPhase,
  TriageLevel,
  SeverityLevel,
  MessageType,
} from '@oncolife/shared';

// ── Session State ──────────────────────────────────────────────────

export interface SessionState {
  conversationId: string;
  patientId: string;
  patientName: string;
  phase: ConversationPhase;
  selectedSymptoms: string[];
  currentSymptomIndex: number;
  currentQuestionIndex: number;
  currentSection: 'screening' | 'followUp';
  answers: Record<string, any>;
  symptomResults: Record<string, SymptomResult>;
  branchStack: string[];
  dehydrationQuestionsAsked: boolean;
  patientContext: {
    lastChemo?: string;
    nextVisit?: string;
  };
  isEmergency: boolean;
}

export interface SymptomResult {
  triageLevel: TriageLevel;
  severity?: SeverityLevel;
  duration?: string;
  notes?: string;
  medicationsTried?: string;
}

// ── Engine Response ────────────────────────────────────────────────

export interface EngineResponse {
  phase: ConversationPhase;
  message: string;
  messageType: MessageType;
  options?: string[];
  progress?: number;
  isComplete?: boolean;
  isEmergency?: boolean;
  summary?: SessionSummaryData;
  educationLinks?: string[];
}

export interface SessionSummaryData {
  summaryText: string;
  recommendations: string[];
  educationLinks: string[];
  overallTriageLevel: TriageLevel;
  symptomResults: Record<string, SymptomResult>;
}

// ── Patient Response ───────────────────────────────────────────────

export interface PatientResponse {
  text?: string;
  selectedOption?: string;
  selectedOptions?: string[];
  numberValue?: number;
}

// ── Question Definition ────────────────────────────────────────────

export type QuestionType = 'CHOICE' | 'YES_NO' | 'NUMBER' | 'TEXT' | 'MULTISELECT';

export interface QuestionDef {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  condition?: (answers: Record<string, any>, state: SessionState) => boolean;
}

// ── Symptom Evaluation ─────────────────────────────────────────────

export type EvalAction = 'continue' | 'stop' | 'branch' | 'emergency';

export interface EvalResult {
  action: EvalAction;
  triageLevel: TriageLevel;
  branchTo?: string[];
  alertMessage?: string;
  severity?: SeverityLevel;
  duration?: string;
  medicationsTried?: string;
}

// ── Symptom Module Definition ──────────────────────────────────────

export interface SymptomModuleDef {
  symptomId: string;
  name: string;
  isHidden: boolean;
  screeningQuestions: QuestionDef[];
  followUpQuestions: QuestionDef[];
  evaluateScreening: (answers: Record<string, any>, state: SessionState) => EvalResult;
  evaluateFollowUp: (answers: Record<string, any>, state: SessionState) => EvalResult;
}

