import { TriageLevel } from '@oncolife/shared';
import { SessionState, SessionSummaryData, SymptomResult } from './types';
import { getSymptomModule } from './symptoms';

// ── Summary Generator ────────────────────────────────────────────

/**
 * Generate a patient-facing summary of the symptom check-in.
 * Format: "Hi [Name], you have been [symptom] for [X] days, rated as [severity],
 * and have [tried / not tried] medications."
 */
export function generateSummary(state: SessionState): SessionSummaryData {
  const lines: string[] = [];
  const recommendations: string[] = [];
  const educationLinks: string[] = [];
  let overallTriage = TriageLevel.NONE;

  lines.push(`Hi ${state.patientName},`);
  lines.push('');
  lines.push('Here is a summary of today\'s symptom check-in:');
  lines.push('');

  const triagePriority: Record<string, number> = {
    [TriageLevel.CALL_911]: 4,
    [TriageLevel.URGENT]: 3,
    [TriageLevel.NOTIFY_CARE_TEAM]: 2,
    [TriageLevel.NONE]: 1,
  };

  for (const symptomId of state.selectedSymptoms) {
    const mod = getSymptomModule(symptomId);
    const result = state.symptomResults[symptomId];
    if (!mod || !result) continue;

    // Track highest triage level
    const currentPriority = triagePriority[result.triageLevel] || 0;
    const overallPriority = triagePriority[overallTriage] || 0;
    if (currentPriority > overallPriority) {
      overallTriage = result.triageLevel;
    }

    let line = `• **${mod.name}**`;
    if (result.duration) line += ` for ${result.duration}`;
    if (result.severity) line += `, rated as ${result.severity.toLowerCase()}`;
    if (result.medicationsTried) {
      line += `, and have tried ${result.medicationsTried}`;
    } else {
      line += `, and have not tried medications`;
    }
    line += '.';
    lines.push(line);

    // Generate recommendations per symptom
    if (result.triageLevel === TriageLevel.CALL_911) {
      recommendations.push(`⚠️ ${mod.name}: Seek emergency care immediately.`);
    } else if (result.triageLevel === TriageLevel.URGENT) {
      recommendations.push(`🔴 ${mod.name}: Contact your care team urgently.`);
    } else if (result.triageLevel === TriageLevel.NOTIFY_CARE_TEAM) {
      recommendations.push(`🟡 ${mod.name}: Your care team will be notified.`);
    }
  }

  // Also check branch results (hidden symptoms processed via branches)
  for (const [symptomId, result] of Object.entries(state.symptomResults)) {
    if (state.selectedSymptoms.includes(symptomId)) continue;
    const mod = getSymptomModule(symptomId);
    if (!mod) continue;

    const currentPriority = triagePriority[result.triageLevel] || 0;
    const overallPriority = triagePriority[overallTriage] || 0;
    if (currentPriority > overallPriority) {
      overallTriage = result.triageLevel;
    }

    if (result.triageLevel !== TriageLevel.NONE) {
      lines.push(`• **${mod.name}** (follow-up): ${result.notes || 'Flagged for care team review'}`);
    }
  }

  lines.push('');

  if (overallTriage === TriageLevel.CALL_911) {
    lines.push('🚨 **Please call 911 or go to the nearest emergency room immediately.**');
  } else if (overallTriage === TriageLevel.URGENT) {
    lines.push('🔴 **Please contact your care team as soon as possible.**');
  } else if (overallTriage === TriageLevel.NOTIFY_CARE_TEAM) {
    lines.push('🟡 **Your care team has been notified and will review your symptoms.**');
  } else {
    lines.push('✅ **No urgent concerns identified. Your care team will review at your next visit.**');
  }

  return {
    summaryText: lines.join('\n'),
    recommendations,
    educationLinks,
    overallTriageLevel: overallTriage,
    symptomResults: { ...state.symptomResults },
  };
}

