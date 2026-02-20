import {
  ConversationPhase,
  TriageLevel,
  SeverityLevel,
  MessageType,
} from '@oncolife/shared';
import { prisma } from '../lib/prisma';
import {
  SessionState,
  EngineResponse,
  PatientResponse,
  SymptomResult,
  EvalResult,
  QuestionDef,
} from './types';
import {
  YES_NO_OPTIONS,
  EMERGENCY_BUTTONS,
  SYMPTOM_SELECTION_CATEGORIES,
  LAST_CHEMO_OPTIONS,
  PHYSICIAN_VISIT_OPTIONS,
} from './optionSets';
import { getSymptomModule } from './symptoms';
import { checkHardStops } from './hardStops';
import { generateSummary } from './summaryGenerator';
import { answerKey, parseSeverity } from './symptoms/base';

// ── In-memory session store ──────────────────────────────────────
const sessions = new Map<string, SessionState>();

export function getSession(conversationId: string): SessionState | undefined {
  return sessions.get(conversationId);
}

function saveSession(state: SessionState): void {
  sessions.set(state.conversationId, state);
}

// ── Start Conversation ───────────────────────────────────────────

export async function startConversation(
  conversationId: string,
  patientId: string,
): Promise<EngineResponse> {
  const [patient, previousConvCount] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    // Current conversation is already created, so count > 1 means returning patient
    prisma.conversation.count({ where: { patientId } }),
  ]);
  const patientName = patient ? patient.user.firstName : 'there';
  const isFirstConversation = previousConvCount <= 1;

  const state: SessionState = {
    conversationId,
    patientId,
    patientName,
    phase: ConversationPhase.DISCLAIMER,
    selectedSymptoms: [],
    currentSymptomIndex: 0,
    currentQuestionIndex: 0,
    currentSection: 'screening',
    answers: {},
    symptomResults: {},
    branchStack: [],
    dehydrationQuestionsAsked: false,
    patientContext: {},
    isEmergency: false,
  };
  saveSession(state);

  const emergencyQuestion =
    'Are you currently experiencing any emergency symptoms such as chest pain, ' +
    'difficulty breathing, significant bleeding, fainting, or confusion?';

  const message = isFirstConversation
    ? `Hi ${patientName}! I'm Ruby, your virtual symptom assistant. ` +
      'I\'ll ask you some questions about how you\'re feeling today. ' +
      'Your responses will be shared with your care team.\n\n' +
      '⚠️ **Important:** This is not a substitute for emergency medical care. ' +
      'If you are experiencing a medical emergency, please call 911 immediately.\n\n' +
      emergencyQuestion
    : `Hi ${patientName}! Let's check in on how you're feeling today.\n\n` +
      emergencyQuestion;

  return {
    phase: ConversationPhase.DISCLAIMER,
    message,
    messageType: MessageType.OPTION_SELECT,
    options: YES_NO_OPTIONS,
    progress: 0,
  };
}

// ── Process Response ─────────────────────────────────────────────

export async function processResponse(
  conversationId: string,
  response: PatientResponse,
): Promise<EngineResponse> {
  const state = sessions.get(conversationId);
  if (!state) {
    throw new Error(`No active session for conversation ${conversationId}`);
  }

  const text = response.text || response.selectedOption || '';
  if (text) {
    const hardStop = checkHardStops(text);
    if (hardStop.triggered) {
      if (hardStop.endConversation) {
        state.isEmergency = true;
        state.phase = ConversationPhase.EMERGENCY;
        await persistPhase(state);
        if (hardStop.triageLevel) {
          await createAlert(state, hardStop.triageLevel, hardStop.botMessage || 'Emergency');
        }
      }
      saveSession(state);
      return {
        phase: state.phase,
        message: hardStop.botMessage || '',
        messageType: MessageType.TEXT,
        isEmergency: hardStop.endConversation,
        isComplete: hardStop.endConversation,
      };
    }
  }

  switch (state.phase) {
    case ConversationPhase.DISCLAIMER:
      return handleDisclaimer(state, response);
    case ConversationPhase.PATIENT_CONTEXT:
      return handlePatientContext(state, response);
    case ConversationPhase.EMERGENCY_CHECK:
      return handleEmergencyCheck(state, response);
    case ConversationPhase.SYMPTOM_SELECTION:
      return handleSymptomSelection(state, response);
    case ConversationPhase.SCREENING:
    case ConversationPhase.FOLLOW_UP:
    case ConversationPhase.BRANCHED:
      return handleSymptomQuestion(state, response);
    case ConversationPhase.SUMMARY:
      return handleSummary(state, response);
    case ConversationPhase.ADDING_NOTES:
      return handleAddingNotes(state, response);
    default:
      return {
        phase: state.phase,
        message: 'This conversation is already complete.',
        messageType: MessageType.TEXT,
        isComplete: true,
      };
  }
}


// ── Phase: DISCLAIMER ────────────────────────────────────────────

async function handleDisclaimer(
  state: SessionState,
  response: PatientResponse,
): Promise<EngineResponse> {
  const answer = response.selectedOption || response.text || '';
  if (answer === 'No') {
    // "No" = no emergency symptoms → continue to patient context
    state.phase = ConversationPhase.PATIENT_CONTEXT;
    await persistPhase(state);
    saveSession(state);
    return {
      phase: ConversationPhase.PATIENT_CONTEXT,
      message: 'When was your last chemotherapy treatment?',
      messageType: MessageType.OPTION_SELECT,
      options: LAST_CHEMO_OPTIONS,
      progress: 5,
    };
  }
  // "Yes" = has emergency symptoms → show specific emergency buttons
  state.phase = ConversationPhase.EMERGENCY_CHECK;
  await persistPhase(state);
  saveSession(state);
  const emergencyLabels = EMERGENCY_BUTTONS.map(b => b.label);
  return {
    phase: ConversationPhase.EMERGENCY_CHECK,
    message:
      'Please select the emergency symptom you are experiencing:',
    messageType: MessageType.OPTION_SELECT,
    options: [...emergencyLabels, 'None of these'],
    progress: 5,
  };
}

// ── Phase: PATIENT_CONTEXT ───────────────────────────────────────

async function handlePatientContext(
  state: SessionState,
  response: PatientResponse,
): Promise<EngineResponse> {
  const answer = response.selectedOption || response.text || '';
  if (!state.patientContext.lastChemo) {
    state.patientContext.lastChemo = answer;
    saveSession(state);
    return {
      phase: ConversationPhase.PATIENT_CONTEXT,
      message: 'When is your next scheduled provider visit?',
      messageType: MessageType.OPTION_SELECT,
      options: PHYSICIAN_VISIT_OPTIONS,
      progress: 8,
    };
  }
  state.patientContext.nextVisit = answer;
  // Emergency was already handled upfront — skip to symptom selection
  state.phase = ConversationPhase.SYMPTOM_SELECTION;
  await persistPhase(state);
  saveSession(state);
  const allSymptoms = SYMPTOM_SELECTION_CATEGORIES.flatMap(c => c.symptoms.map(s => s.label));
  return {
    phase: ConversationPhase.SYMPTOM_SELECTION,
    message: 'What symptoms are you experiencing? Select all that apply.',
    messageType: MessageType.MULTI_SELECT,
    options: [...allSymptoms, 'None — I feel fine'],
    progress: 15,
  };
}

// ── Phase: EMERGENCY_CHECK ───────────────────────────────────────

async function handleEmergencyCheck(
  state: SessionState,
  response: PatientResponse,
): Promise<EngineResponse> {
  const answer = response.selectedOption || response.text || '';
  if (answer !== 'None of these') {
    // Find the emergency symptom module and route through its screening questions
    const emg = EMERGENCY_BUTTONS.find(b => b.label === answer);
    const symptomId = emg?.id;
    if (symptomId) {
      const mod = getSymptomModule(symptomId);
      if (mod) {
        // Push the emergency symptom into selectedSymptoms and start screening
        state.selectedSymptoms = [symptomId];
        state.currentSymptomIndex = 0;
        state.currentQuestionIndex = 0;
        state.currentSection = 'screening';
        state.phase = ConversationPhase.SCREENING;
        await persistPhase(state);
        saveSession(state);
        return nextQuestion(state);
      }
    }
    // Fallback: if no module found, use inline emergency response
    state.isEmergency = true;
    state.phase = ConversationPhase.EMERGENCY;
    await persistPhase(state);
    await createAlert(state, TriageLevel.CALL_911, `Emergency: ${answer} (${symptomId || 'unknown'})`);
    saveSession(state);
    return {
      phase: ConversationPhase.EMERGENCY,
      message:
        '🚨 **Please call 911 immediately.**\n\n' +
        `You reported: ${answer}. This requires immediate medical attention.\n\n` +
        'Your care team has been notified.',
      messageType: MessageType.TEXT,
      isEmergency: true,
      isComplete: true,
    };
  }
  // "None of these" — user said yes to emergencies but picked none; continue safely to patient context
  state.phase = ConversationPhase.PATIENT_CONTEXT;
  await persistPhase(state);
  saveSession(state);
  return {
    phase: ConversationPhase.PATIENT_CONTEXT,
    message: 'When was your last chemotherapy treatment?',
    messageType: MessageType.OPTION_SELECT,
    options: LAST_CHEMO_OPTIONS,
    progress: 5,
  };
}

// ── Phase: SYMPTOM_SELECTION ─────────────────────────────────────

async function handleSymptomSelection(
  state: SessionState,
  response: PatientResponse,
): Promise<EngineResponse> {
  const selections = response.selectedOptions || [];
  if (selections.includes('None — I feel fine') || selections.length === 0) {
    state.phase = ConversationPhase.SUMMARY;
    await persistPhase(state);
    saveSession(state);
    return buildSummaryResponse(state);
  }

  // Map labels back to symptom IDs
  const allSymptomMap = new Map<string, string>();
  for (const cat of SYMPTOM_SELECTION_CATEGORIES) {
    for (const s of cat.symptoms) {
      allSymptomMap.set(s.label, s.id);
    }
  }

  const symptomIds: string[] = [];
  for (const label of selections) {
    const id = allSymptomMap.get(label);
    if (id) symptomIds.push(id);
  }

  state.selectedSymptoms = symptomIds;
  state.currentSymptomIndex = 0;
  state.currentQuestionIndex = 0;
  state.currentSection = 'screening';
  state.phase = ConversationPhase.SCREENING;
  await persistPhase(state);
  saveSession(state);

  return nextQuestion(state);
}

// ── Phase: SCREENING / FOLLOW_UP / BRANCHED ──────────────────────

async function handleSymptomQuestion(
  state: SessionState,
  response: PatientResponse,
): Promise<EngineResponse> {
  const symptomId = getCurrentSymptomId(state);
  if (!symptomId) {
    return buildSummaryResponse(state);
  }

  const mod = getSymptomModule(symptomId);
  if (!mod) {
    return advanceToNextSymptom(state);
  }

  const questions = state.currentSection === 'screening'
    ? mod.screeningQuestions
    : mod.followUpQuestions;
  const q = questions[state.currentQuestionIndex];
  if (!q) {
    return advanceToNextSymptom(state);
  }

  // Store the answer
  const key = answerKey(symptomId, q.id);
  const value = extractAnswer(response, q);
  state.answers[key] = value;
  state.currentQuestionIndex++;
  saveSession(state);

  // Check if there are more questions in current section
  const nextQ = findNextQuestion(state, symptomId);
  if (nextQ) {
    return questionToResponse(state, nextQ);
  }

  // Section complete — evaluate
  if (state.currentSection === 'screening') {
    const evalResult = mod.evaluateScreening(state.answers, state);
    return handleEvalResult(state, symptomId, evalResult, 'screening');
  } else {
    const evalResult = mod.evaluateFollowUp(state.answers, state);
    return handleEvalResult(state, symptomId, evalResult, 'followUp');
  }
}

// ── Eval Result Handler ─────────────────────────────────────────

async function handleEvalResult(
  state: SessionState,
  symptomId: string,
  evalResult: EvalResult,
  section: 'screening' | 'followUp',
): Promise<EngineResponse> {
  // Record symptom result
  state.symptomResults[symptomId] = {
    triageLevel: evalResult.triageLevel,
    severity: evalResult.severity,
    duration: evalResult.duration,
    medicationsTried: evalResult.medicationsTried,
  };

  // Emergency takes priority
  if (evalResult.action === 'emergency') {
    state.isEmergency = true;
    state.phase = ConversationPhase.EMERGENCY;
    await persistPhase(state);
    await createAlert(
      state,
      TriageLevel.CALL_911,
      evalResult.alertMessage || `Emergency from ${symptomId}`,
    );
    saveSession(state);
    return {
      phase: ConversationPhase.EMERGENCY,
      message:
        '🚨 **Please call 911 immediately.**\n\n' +
        (evalResult.alertMessage || 'This requires immediate medical attention.') +
        '\n\nYour care team has been notified.',
      messageType: MessageType.TEXT,
      isEmergency: true,
      isComplete: true,
    };
  }

  // Branch to sub-modules
  if (evalResult.action === 'branch' && evalResult.branchTo?.length) {
    const branches = evalResult.branchTo.filter(id => {
      if (id === 'DEH-201' && state.dehydrationQuestionsAsked) return false;
      return true;
    });
    if (branches.length > 0) {
      state.branchStack.push(...branches);
      state.phase = ConversationPhase.BRANCHED;
      await persistPhase(state);
      return advanceToNextSymptom(state);
    }
  }

  // Continue to follow-up questions
  if (evalResult.action === 'continue' && section === 'screening') {
    state.currentSection = 'followUp';
    state.currentQuestionIndex = 0;
    state.phase = ConversationPhase.FOLLOW_UP;
    await persistPhase(state);
    saveSession(state);
    return nextQuestion(state);
  }

  // Create alert for non-NONE triage
  if (evalResult.triageLevel !== TriageLevel.NONE && evalResult.alertMessage) {
    await createAlert(state, evalResult.triageLevel, evalResult.alertMessage);
  }

  // Mark dehydration as asked if this was DEH-201
  if (symptomId === 'DEH-201') {
    state.dehydrationQuestionsAsked = true;
  }

  // Stop — advance to next symptom
  saveSession(state);
  return advanceToNextSymptom(state);
}

// ── Advance to Next Symptom ─────────────────────────────────────

async function advanceToNextSymptom(
  state: SessionState,
): Promise<EngineResponse> {
  // Check branch stack first
  if (state.branchStack.length > 0) {
    const nextBranch = state.branchStack.shift()!;
    // Skip DEH-201 if already asked
    if (nextBranch === 'DEH-201' && state.dehydrationQuestionsAsked) {
      return advanceToNextSymptom(state);
    }
    state.currentQuestionIndex = 0;
    state.currentSection = 'screening';
    state.phase = ConversationPhase.BRANCHED;
    // Add branched symptom to selected so it gets processed
    if (!state.selectedSymptoms.includes(nextBranch)) {
      state.selectedSymptoms.splice(state.currentSymptomIndex + 1, 0, nextBranch);
    }
    state.currentSymptomIndex = state.selectedSymptoms.indexOf(nextBranch);
    await persistPhase(state);
    saveSession(state);
    return nextQuestion(state);
  }

  // Move to next selected symptom
  state.currentSymptomIndex++;
  if (state.currentSymptomIndex < state.selectedSymptoms.length) {
    state.currentQuestionIndex = 0;
    state.currentSection = 'screening';
    state.phase = ConversationPhase.SCREENING;
    await persistPhase(state);
    saveSession(state);
    return nextQuestion(state);
  }

  // All symptoms done — go to summary
  state.phase = ConversationPhase.SUMMARY;
  await persistPhase(state);
  saveSession(state);
  return buildSummaryResponse(state);
}

// ── Question Helpers ────────────────────────────────────────────

function getCurrentSymptomId(state: SessionState): string | undefined {
  return state.selectedSymptoms[state.currentSymptomIndex];
}

function nextQuestion(state: SessionState): EngineResponse {
  const symptomId = getCurrentSymptomId(state);
  if (!symptomId) {
    return {
      phase: state.phase,
      message: 'Processing your responses...',
      messageType: MessageType.TEXT,
    };
  }

  const mod = getSymptomModule(symptomId);
  if (!mod) {
    return {
      phase: state.phase,
      message: 'Processing your responses...',
      messageType: MessageType.TEXT,
    };
  }

  const q = findNextQuestion(state, symptomId);
  if (!q) {
    return {
      phase: state.phase,
      message: 'Processing your responses...',
      messageType: MessageType.TEXT,
    };
  }

  return questionToResponse(state, q);
}

function findNextQuestion(
  state: SessionState,
  symptomId: string,
): QuestionDef | null {
  const mod = getSymptomModule(symptomId);
  if (!mod) return null;

  const questions = state.currentSection === 'screening'
    ? mod.screeningQuestions
    : mod.followUpQuestions;

  for (let i = state.currentQuestionIndex; i < questions.length; i++) {
    const q = questions[i];
    if (q.condition && !q.condition(state.answers, state)) {
      // Skip this question — increment index
      state.currentQuestionIndex = i + 1;
      continue;
    }
    state.currentQuestionIndex = i;
    return q;
  }
  return null;
}

function questionToResponse(state: SessionState, q: QuestionDef): EngineResponse {
  let messageType: MessageType;
  switch (q.type) {
    case 'CHOICE':
    case 'YES_NO':
      messageType = MessageType.OPTION_SELECT;
      break;
    case 'MULTISELECT':
      messageType = MessageType.MULTI_SELECT;
      break;
    case 'NUMBER':
      messageType = MessageType.NUMBER_INPUT;
      break;
    case 'TEXT':
    default:
      messageType = MessageType.TEXT;
      break;
  }

  const options = q.type === 'YES_NO' ? YES_NO_OPTIONS : q.options;

  return {
    phase: state.phase,
    message: q.text,
    messageType,
    options,
    progress: calculateProgress(state),
  };
}

function extractAnswer(response: PatientResponse, q: QuestionDef): any {
  switch (q.type) {
    case 'CHOICE':
    case 'YES_NO':
      return response.selectedOption || response.text || '';
    case 'MULTISELECT':
      return response.selectedOptions || [];
    case 'NUMBER':
      return response.numberValue ?? (parseFloat(response.text || '0') || 0);
    case 'TEXT':
    default:
      return response.text || response.selectedOption || '';
  }
}

// ── Phase: SUMMARY ──────────────────────────────────────────────

async function handleSummary(
  state: SessionState,
  response: PatientResponse,
): Promise<EngineResponse> {
  // User has seen the summary. Ask if they want to add notes.
  state.phase = ConversationPhase.ADDING_NOTES;
  await persistPhase(state);
  saveSession(state);
  return {
    phase: ConversationPhase.ADDING_NOTES,
    message:
      'Would you like to add any additional notes for your care team?',
    messageType: MessageType.OPTION_SELECT,
    options: ['Yes, I want to add notes', 'No, I\'m done'],
    progress: 90,
  };
}

// ── Phase: ADDING_NOTES ─────────────────────────────────────────

async function handleAddingNotes(
  state: SessionState,
  response: PatientResponse,
): Promise<EngineResponse> {
  const answer = response.selectedOption || response.text || '';

  if (answer === 'No, I\'m done' || answer === 'No') {
    // Persist the summary and complete
    await persistSummary(state, undefined);
    state.phase = ConversationPhase.COMPLETED;
    await persistPhase(state);
    saveSession(state);
    return {
      phase: ConversationPhase.COMPLETED,
      message:
        'Thank you for completing your symptom check-in! ' +
        'Your care team will review your responses. Take care! 💙',
      messageType: MessageType.TEXT,
      isComplete: true,
      progress: 100,
    };
  }

  if (answer === 'Yes, I want to add notes') {
    saveSession(state);
    return {
      phase: ConversationPhase.ADDING_NOTES,
      message: 'Please type your additional notes below:',
      messageType: MessageType.TEXT,
      progress: 92,
    };
  }

  // Treat any other input as the actual notes
  await persistSummary(state, answer);
  state.phase = ConversationPhase.COMPLETED;
  await persistPhase(state);
  saveSession(state);
  return {
    phase: ConversationPhase.COMPLETED,
    message:
      'Thank you! Your notes have been added. ' +
      'Your care team will review your responses. Take care! 💙',
    messageType: MessageType.TEXT,
    isComplete: true,
    progress: 100,
  };
}

// ── Build Summary Response ──────────────────────────────────────

async function buildSummaryResponse(
  state: SessionState,
): Promise<EngineResponse> {
  // Persist symptom reports
  await persistSymptomReports(state);

  const summaryData = generateSummary(state);
  return {
    phase: ConversationPhase.SUMMARY,
    message: summaryData.summaryText,
    messageType: MessageType.SUMMARY,
    summary: summaryData,
    progress: 85,
  };
}

// ── Persistence ─────────────────────────────────────────────────

async function persistPhase(state: SessionState): Promise<void> {
  try {
    await prisma.conversation.update({
      where: { id: state.conversationId },
      data: {
        phase: state.phase,
        isEmergency: state.isEmergency,
        completedAt:
          state.phase === ConversationPhase.COMPLETED ||
          state.phase === ConversationPhase.EMERGENCY
            ? new Date()
            : undefined,
      },
    });
  } catch {
    // Log but don't fail the conversation
    console.error(`Failed to persist phase for ${state.conversationId}`);
  }
}

async function createAlert(
  state: SessionState,
  level: TriageLevel,
  message: string,
): Promise<void> {
  try {
    await prisma.alert.create({
      data: {
        patientId: state.patientId,
        conversationId: state.conversationId,
        triageLevel: level,
        message,
      },
    });
  } catch {
    console.error(`Failed to create alert for ${state.conversationId}`);
  }
}

async function persistSymptomReports(state: SessionState): Promise<void> {
  try {
    for (const [symptomId, result] of Object.entries(state.symptomResults)) {
      await prisma.symptomReport.create({
        data: {
          conversationId: state.conversationId,
          symptomId,
          severity: result.severity || SeverityLevel.MILD,
          duration: result.duration,
          triageLevel: result.triageLevel,
          notes: result.notes,
          medicationsTried: result.medicationsTried,
          branchedFrom: state.selectedSymptoms.includes(symptomId)
            ? undefined
            : state.selectedSymptoms[0],
        },
      });
    }
  } catch {
    console.error(`Failed to persist symptom reports for ${state.conversationId}`);
  }
}

async function persistSummary(
  state: SessionState,
  patientNotes: string | undefined,
): Promise<void> {
  try {
    const summaryData = generateSummary(state);

    // Update conversation triage level
    await prisma.conversation.update({
      where: { id: state.conversationId },
      data: { triageLevel: summaryData.overallTriageLevel },
    });

    await prisma.sessionSummary.create({
      data: {
        conversationId: state.conversationId,
        patientId: state.patientId,
        summaryText: summaryData.summaryText,
        patientAddedNotes: patientNotes,
        recommendations: summaryData.recommendations,
        educationLinks: summaryData.educationLinks,
      },
    });
  } catch {
    console.error(`Failed to persist summary for ${state.conversationId}`);
  }
}

// ── Progress Calculator ─────────────────────────────────────────

function calculateProgress(state: SessionState): number {
  // Phases: DISCLAIMER=0, PATIENT_CONTEXT=5-10, EMERGENCY_CHECK=10,
  // SYMPTOM_SELECTION=15, SCREENING/FOLLOW_UP/BRANCHED=20-80, SUMMARY=85,
  // ADDING_NOTES=90, COMPLETED=100
  const totalSymptoms = state.selectedSymptoms.length || 1;
  const completedSymptoms = state.currentSymptomIndex;
  const symptomProgress = (completedSymptoms / totalSymptoms) * 65; // 20-85 range = 65 points
  return Math.min(Math.round(20 + symptomProgress), 85);
}