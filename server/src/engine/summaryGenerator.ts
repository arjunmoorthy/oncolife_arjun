import { TriageLevel } from '@oncolife/shared';
import { SessionState, SessionSummaryData, SymptomResult } from './types';
import { getSymptomModule } from './symptoms';

// ── Summary Generator ────────────────────────────────────────────

const TRIAGE_PRIORITY: Record<string, number> = {
  [TriageLevel.CALL_911]: 4,
  [TriageLevel.URGENT]: 3,
  [TriageLevel.NOTIFY_CARE_TEAM]: 2,
  [TriageLevel.NONE]: 1,
};

const TRIAGE_LABELS: Record<string, string> = {
  [TriageLevel.CALL_911]: 'Emergency — call 911',
  [TriageLevel.URGENT]: 'Urgent — contact care team',
  [TriageLevel.NOTIFY_CARE_TEAM]: 'Care team notified',
  [TriageLevel.NONE]: '',
};

/**
 * Build a concise 2-3 sentence narrative for a single symptom result.
 */
function buildSymptomNarrative(
  symptomName: string,
  result: SymptomResult,
): string {
  const parts: string[] = [];

  // First sentence: what the patient reports
  let report = `Patient reports ${symptomName.toLowerCase()}`;
  if (result.duration) report += ` for ${result.duration}`;
  if (result.severity) report += ` (${result.severity.toLowerCase()})`;
  if (result.notes) report += ` with ${result.notes}`;
  report += '.';
  parts.push(report);

  // Second sentence: medications
  if (result.medicationsTried) {
    parts.push(`Taking ${result.medicationsTried}.`);
  }

  // Third sentence: triage recommendation (inline)
  const label = TRIAGE_LABELS[result.triageLevel];
  if (label) {
    parts.push(`${label}.`);
  }

  return parts.join(' ');
}

/**
 * Generate a patient-facing summary of the symptom check-in.
 * Produces concise 2-3 sentence narratives per symptom, grouped together,
 * with an overall recommendation at the end.
 */
export function generateSummary(state: SessionState): SessionSummaryData {
  const paragraphs: string[] = [];
  const recommendations: string[] = [];
  const educationLinks: string[] = [];
  let overallTriage = TriageLevel.NONE;

  // Process selected (user-facing) symptoms
  for (const symptomId of state.selectedSymptoms) {
    const mod = getSymptomModule(symptomId);
    const result = state.symptomResults[symptomId];
    if (!mod || !result) continue;

    // Track highest triage level
    const currentPriority = TRIAGE_PRIORITY[result.triageLevel] || 0;
    const overallPriority = TRIAGE_PRIORITY[overallTriage] || 0;
    if (currentPriority > overallPriority) {
      overallTriage = result.triageLevel;
    }

    paragraphs.push(buildSymptomNarrative(mod.name, result));

    // Generate recommendations per symptom
    if (result.triageLevel === TriageLevel.CALL_911) {
      recommendations.push(`${mod.name}: Seek emergency care immediately.`);
    } else if (result.triageLevel === TriageLevel.URGENT) {
      recommendations.push(`${mod.name}: Contact your care team urgently.`);
    } else if (result.triageLevel === TriageLevel.NOTIFY_CARE_TEAM) {
      recommendations.push(`${mod.name}: Your care team will be notified.`);
    }
  }

  // Also check branch results (hidden symptoms processed via branches)
  for (const [symptomId, result] of Object.entries(state.symptomResults)) {
    if (state.selectedSymptoms.includes(symptomId)) continue;
    const mod = getSymptomModule(symptomId);
    if (!mod) continue;

    const currentPriority = TRIAGE_PRIORITY[result.triageLevel] || 0;
    const overallPriority = TRIAGE_PRIORITY[overallTriage] || 0;
    if (currentPriority > overallPriority) {
      overallTriage = result.triageLevel;
    }

    if (result.triageLevel !== TriageLevel.NONE) {
      paragraphs.push(buildSymptomNarrative(mod.name, result));
    }
  }

  // Overall recommendation
  let overall: string;
  if (overallTriage === TriageLevel.CALL_911) {
    overall = 'Please call 911 or go to the nearest emergency room immediately.';
  } else if (overallTriage === TriageLevel.URGENT) {
    overall = 'Please contact your care team as soon as possible.';
  } else if (overallTriage === TriageLevel.NOTIFY_CARE_TEAM) {
    overall = 'Your care team has been notified and will review your symptoms.';
  } else {
    overall = 'No urgent concerns identified. Your care team will review at your next visit.';
  }
  paragraphs.push(overall);

  return {
    summaryText: paragraphs.join('\n\n'),
    recommendations,
    educationLinks,
    overallTriageLevel: overallTriage,
    symptomResults: { ...state.symptomResults },
  };
}

