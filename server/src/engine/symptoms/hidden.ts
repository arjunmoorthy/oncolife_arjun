import { TriageLevel } from '@oncolife/shared';
import { SymptomModuleDef } from '../types';
import { YES_NO_OPTIONS } from '../optionSets';
import {
  defineSymptom,
  getAnswer,
  continueResult,
  stopResult,
  emergencyResult,
} from './base';

// ── NEU-304 — Falls & Balance ────────────────────────────────────

export const NEU_304: SymptomModuleDef = defineSymptom({
  symptomId: 'NEU-304',
  name: 'Falls & Balance',
  isHidden: true,
  screeningQuestions: [
    { id: 'falls', text: 'Have you had any falls since your last visit?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'new_neuro', text: 'Do you have new dizziness, confusion, or balance problems?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [
    {
      id: 'head_injury',
      text: 'Did you hit your head during the fall?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
      condition: (answers) => getAnswer(answers, 'NEU-304', 'falls') === 'Yes',
    },
    {
      id: 'blood_thinners',
      text: 'Are you taking blood thinners?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
      condition: (answers) => getAnswer(answers, 'NEU-304', 'falls') === 'Yes',
    },
  ],
  evaluateScreening: (answers) => {
    const falls = getAnswer(answers, 'NEU-304', 'falls') === 'Yes';
    const newNeuro = getAnswer(answers, 'NEU-304', 'new_neuro') === 'Yes';

    if (falls || newNeuro) {
      return {
        action: 'continue' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: [falls && 'Falls reported', newNeuro && 'New neuro symptoms'].filter(Boolean).join('; '),
      };
    }
    return stopResult();
  },
  evaluateFollowUp: (answers) => {
    const headInjury = getAnswer(answers, 'NEU-304', 'head_injury') === 'Yes';
    const bloodThinners = getAnswer(answers, 'NEU-304', 'blood_thinners') === 'Yes';

    // Emergency: head injury + blood thinners
    if (headInjury && bloodThinners) {
      return emergencyResult('Head injury while on blood thinners — call 911.');
    }
    if (headInjury) {
      return {
        action: 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: 'Head injury from fall',
      };
    }
    return stopResult();
  },
});

export const HIDDEN_MODULES: SymptomModuleDef[] = [
  NEU_304,
];

