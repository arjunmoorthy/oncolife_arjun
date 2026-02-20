import { TriageLevel } from '@oncolife/shared';

// ── Hard Stop Detection ──────────────────────────────────────────

export interface HardStopResult {
  triggered: boolean;
  type?: 'suicidal_ideation' | 'medical_advice' | 'medication_change' | 'inappropriate';
  botMessage?: string;
  triageLevel?: TriageLevel;
  endConversation?: boolean;
}

const SI_KEYWORDS = [
  'kill myself',
  'want to die',
  'end my life',
  'suicide',
  'suicidal',
  'self-harm',
  'self harm',
  'hurt myself',
  'don\'t want to live',
  'no reason to live',
  'better off dead',
  'wish i was dead',
  'wish i were dead',
];

const MEDICAL_ADVICE_PATTERNS = [
  /should i (take|stop|change|start|increase|decrease)/i,
  /what (medication|medicine|drug|treatment) should/i,
  /can you (prescribe|recommend|suggest)/i,
  /is it (safe|ok|okay) to (take|stop|combine)/i,
  /what (dose|dosage) should/i,
];

const MEDICATION_CHANGE_PATTERNS = [
  /change my (medication|medicine|dose|dosage)/i,
  /stop (taking|my) (medication|medicine)/i,
  /switch (to|from) (a|another|different)/i,
  /increase my (dose|dosage)/i,
  /decrease my (dose|dosage)/i,
];

const INAPPROPRIATE_PATTERNS = [
  /\b(fuck|shit|damn|ass|bitch|bastard)\b/i,
];

/**
 * Check patient text for hard-stop conditions.
 * Returns immediately if SI is detected (highest priority).
 */
export function checkHardStops(text: string): HardStopResult {
  const lower = text.toLowerCase().trim();

  // 1. Suicidal ideation — HIGHEST PRIORITY
  for (const keyword of SI_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        triggered: true,
        type: 'suicidal_ideation',
        triageLevel: TriageLevel.CALL_911,
        endConversation: true,
        botMessage:
          'I\'m very concerned about what you just shared. Your safety is the most important thing right now.\n\n' +
          '🚨 **Please call 911 immediately** if you are in danger.\n\n' +
          '📞 **National Suicide Prevention Lifeline: 988** (call or text, 24/7)\n\n' +
          'Your care team has been notified and will reach out to you. You are not alone.',
      };
    }
  }

  // 2. Medical advice request
  for (const pattern of MEDICAL_ADVICE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        triggered: true,
        type: 'medical_advice',
        botMessage:
          'I\'m not able to provide medical advice or treatment recommendations. ' +
          'Please contact your care team directly for questions about your treatment plan. ' +
          'Let\'s continue with your symptom check-in.',
      };
    }
  }

  // 3. Medication change request
  for (const pattern of MEDICATION_CHANGE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        triggered: true,
        type: 'medication_change',
        botMessage:
          'I\'m not able to make changes to your medications. ' +
          'Please discuss medication changes with your oncologist or care team. ' +
          'Let\'s continue with your symptom check-in.',
      };
    }
  }

  // 4. Inappropriate messages — deflect without engaging
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        triggered: true,
        type: 'inappropriate',
        botMessage:
          'I\'m here to help you track your symptoms and connect you with your care team. ' +
          'Let\'s continue with your check-in.',
      };
    }
  }

  return { triggered: false };
}

