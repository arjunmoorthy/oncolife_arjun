import { TriageLevel } from '@oncolife/shared';
import { SymptomModuleDef } from '../types';
import { YES_NO_OPTIONS } from '../optionSets';
import {
  defineSymptom,
  getAnswer,
  stopResult,
  emergencyResult,
} from './base';

// ── URG-101 — Trouble Breathing ─────────────────────────────────

export const URG_101: SymptomModuleDef = defineSymptom({
  symptomId: 'URG-101',
  name: 'Trouble Breathing',
  isHidden: false,
  screeningQuestions: [
    {
      id: 'q1',
      text: 'Are you having Trouble Breathing or Shortness of Breath right now?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
    },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    if (getAnswer(answers, 'URG-101', 'q1') === 'Yes') {
      return emergencyResult('Patient reports Trouble Breathing or Shortness of Breath.');
    }
    return stopResult(TriageLevel.NONE);
  },
  evaluateFollowUp: () => stopResult(),
});

// ── URG-102 — Chest Pain (hidden, triggered from PAI-213) ──────

export const URG_102: SymptomModuleDef = defineSymptom({
  symptomId: 'URG-102',
  name: 'Chest Pain',
  isHidden: true,
  screeningQuestions: [
    {
      id: 'q1',
      text: 'Are you having Chest pain?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
    },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    if (getAnswer(answers, 'URG-102', 'q1') === 'Yes') {
      return emergencyResult('Patient reports Chest Pain.');
    }
    return stopResult(TriageLevel.NONE);
  },
  evaluateFollowUp: () => stopResult(),
});

// ── URG-103 — Bleeding / Bruising ──────────────────────────────

export const URG_103: SymptomModuleDef = defineSymptom({
  symptomId: 'URG-103',
  name: 'Bleeding / Bruising',
  isHidden: false,
  screeningQuestions: [
    {
      id: 'pressure',
      text: "Are you bleeding and the bleeding won't stop with pressure?",
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
    },
    {
      id: 'stool_urine',
      text: 'Do you have any blood in your stool or urine?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
    },
    {
      id: 'injury',
      text: 'Did you injure yourself?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
    },
    {
      id: 'thinners',
      text: 'Are you on blood thinners?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
    },
    {
      id: 'location',
      text: 'Is the bruising in one area or all over your body?',
      type: 'CHOICE',
      options: ['One area', 'All over'],
    },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    // CRITICAL: Non-stop bleeding with pressure → CALL 911
    if (getAnswer(answers, 'URG-103', 'pressure') === 'Yes') {
      return emergencyResult(
        'Call 911 right now. Bleeding that will not stop with pressure requires immediate emergency care.',
      );
    }
    // Blood in stool or urine → Notify care team (NOT 911)
    if (getAnswer(answers, 'URG-103', 'stool_urine') === 'Yes') {
      return {
        action: 'stop',
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage:
          'Contact your care team or go to the emergency department. Blood in stool or urine requires prompt medical evaluation.',
      };
    }
    // Just bruising — no bleeding concerns
    return stopResult(TriageLevel.NONE);
  },
  evaluateFollowUp: () => stopResult(),
});

// ── URG-107 — Fainting / Syncope ───────────────────────────────

export const URG_107: SymptomModuleDef = defineSymptom({
  symptomId: 'URG-107',
  name: 'Fainting / Syncope',
  isHidden: false,
  screeningQuestions: [
    {
      id: 'faint',
      text: 'Have you fainted or felt like you were going to faint?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
    },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    if (getAnswer(answers, 'URG-107', 'faint') === 'Yes') {
      return emergencyResult('Patient reports fainting or near-fainting episode.');
    }
    return stopResult(TriageLevel.NONE);
  },
  evaluateFollowUp: () => stopResult(),
});

// ── URG-108 — Altered Mental Status ────────────────────────────

export const URG_108: SymptomModuleDef = defineSymptom({
  symptomId: 'URG-108',
  name: 'Altered Mental Status',
  isHidden: false,
  screeningQuestions: [
    {
      id: 'confused',
      text: 'Are you feeling confused, disoriented, or having trouble speaking?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
    },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    if (getAnswer(answers, 'URG-108', 'confused') === 'Yes') {
      return emergencyResult('Patient reports confusion, disorientation, or sudden change.');
    }
    return stopResult(TriageLevel.NONE);
  },
  evaluateFollowUp: () => stopResult(),
});

export const EMERGENCY_MODULES: SymptomModuleDef[] = [
  URG_101, URG_102, URG_103, URG_107, URG_108,
];

