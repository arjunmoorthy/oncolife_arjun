import { TriageLevel, SeverityLevel } from '@oncolife/shared';
import {
  QuestionDef,
  EvalResult,
  SymptomModuleDef,
  SessionState,
} from '../types';

/**
 * Helper to parse severity from standard severity option strings.
 */
export function parseSeverity(answer: string | undefined): SeverityLevel | undefined {
  if (!answer) return undefined;
  const lower = answer.toLowerCase();
  if (lower.includes('mild')) return SeverityLevel.MILD;
  if (lower.includes('moderate')) return SeverityLevel.MODERATE;
  if (lower.includes('severe')) return SeverityLevel.SEVERE;
  return undefined;
}

/**
 * Helper to check if oral intake is critically low.
 */
export function isCriticalIntake(answer: string | undefined): boolean {
  if (!answer) return false;
  const lower = answer.toLowerCase();
  return lower.includes('barely') || lower.includes('not able');
}

/**
 * Helper to check if dehydration signs are present.
 */
export function hasDehydrationSigns(selected: string[] | string | undefined): boolean {
  if (!selected) return false;
  if (typeof selected === 'string') {
    return selected !== 'None of these';
  }
  return selected.length > 0 && !selected.includes('None of these');
}

/**
 * Helper to check if meds were taken (not "None").
 */
export function medsTaken(answer: string | undefined): boolean {
  if (!answer) return false;
  return answer !== 'None';
}

/**
 * Helper to parse number of days from various answer formats.
 */
export function parseDays(answer: string | number | undefined): number {
  if (answer === undefined || answer === null) return 0;
  if (typeof answer === 'number') return answer;
  const num = parseInt(answer, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Helper to create a default "stop" eval result.
 */
export function stopResult(triageLevel: TriageLevel = TriageLevel.NONE): EvalResult {
  return { action: 'stop', triageLevel };
}

/**
 * Helper to create a "continue" eval result (proceed to follow-up).
 */
export function continueResult(triageLevel: TriageLevel = TriageLevel.NONE): EvalResult {
  return { action: 'continue', triageLevel };
}

/**
 * Helper to create a "branch" eval result.
 */
export function branchResult(
  branchTo: string[],
  triageLevel: TriageLevel = TriageLevel.NONE,
): EvalResult {
  return { action: 'branch', triageLevel, branchTo };
}

/**
 * Helper to create an "emergency" eval result.
 */
export function emergencyResult(alertMessage?: string): EvalResult {
  return {
    action: 'emergency',
    triageLevel: TriageLevel.CALL_911,
    alertMessage: alertMessage || 'Emergency detected — call 911 immediately.',
  };
}

/**
 * Helper to build an answer key for a symptom question.
 */
export function answerKey(symptomId: string, questionId: string): string {
  return `${symptomId}:${questionId}`;
}

/**
 * Helper to get an answer from the answers map.
 */
export function getAnswer(
  answers: Record<string, any>,
  symptomId: string,
  questionId: string,
): any {
  return answers[answerKey(symptomId, questionId)];
}

/**
 * Creates a SymptomModuleDef with sensible defaults.
 */
export function defineSymptom(def: SymptomModuleDef): SymptomModuleDef {
  return def;
}

