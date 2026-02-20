import { TriageLevel } from '@oncolife/shared';
import { SymptomModuleDef } from '../types';
import {
  SEVERITY_OPTIONS,
  SKIN_LOCATIONS,
  SWELLING_LOCATIONS,
  SWELLING_ASSOCIATED,
  EYE_SYMPTOMS,
  YES_NO_OPTIONS,
  WORSENING_OPTIONS,
} from '../optionSets';
import {
  defineSymptom,
  getAnswer,
  parseSeverity,
  parseDays,
  continueResult,
  stopResult,
  branchResult,
  emergencyResult,
} from './base';

// ── SKI-212 — Skin Rash/Redness ──────────────────────────────────

export const SKI_212: SymptomModuleDef = defineSymptom({
  symptomId: 'SKI-212',
  name: 'Skin Rash/Redness',
  isHidden: false,
  screeningQuestions: [
    { id: 'locations', text: 'Where is the rash or redness?', type: 'MULTISELECT', options: SKIN_LOCATIONS },
    {
      id: 'facial_breathing',
      text: 'Are you having trouble breathing?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
      condition: (answers) => {
        const locs: string[] = getAnswer(answers, 'SKI-212', 'locations') || [];
        return locs.includes('Face');
      },
    },
    {
      id: 'infusion_symptoms',
      text: 'Is the infusion site swollen, warm, or draining?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
      condition: (answers) => {
        const locs: string[] = getAnswer(answers, 'SKI-212', 'locations') || [];
        return locs.includes('Infusion Site');
      },
    },
    { id: 'coverage', text: 'Does the rash cover more than 30% of your body?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'temperature', text: 'What is your temperature?', type: 'NUMBER' },
    { id: 'severity', text: 'Rate the skin problem severity:', type: 'CHOICE', options: SEVERITY_OPTIONS },
  ],
  followUpQuestions: [
    { id: 'days', text: 'How many days have you had this rash?', type: 'NUMBER' },
    { id: 'worsening', text: 'Is the rash getting worse, staying the same, or improving?', type: 'CHOICE', options: WORSENING_OPTIONS },
    { id: 'blistering', text: 'Is the skin blistering or peeling?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'itching', text: 'Is the rash itching?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'feeling_unwell', text: 'Are you feeling generally unwell?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  evaluateScreening: (answers) => {
    const locs: string[] = getAnswer(answers, 'SKI-212', 'locations') || [];
    const facialBreathing = getAnswer(answers, 'SKI-212', 'facial_breathing') === 'Yes';
    const coverage = getAnswer(answers, 'SKI-212', 'coverage') === 'Yes';
    const sev = parseSeverity(getAnswer(answers, 'SKI-212', 'severity'));
    let temp = parseDays(getAnswer(answers, 'SKI-212', 'temperature'));
    if (temp > 0 && temp < 45) temp = temp * 9 / 5 + 32;

    // Emergency: facial rash + trouble breathing
    if (locs.includes('Face') && facialBreathing) {
      return emergencyResult('Facial rash with breathing difficulty — possible allergic reaction. Call 911.');
    }

    const alerts: string[] = [];
    if (coverage) alerts.push('Rash covers >30% body');
    if (sev === 'SEVERE') alerts.push('Severe skin problem');
    if (temp >= 100.3) alerts.push('Fever ≥100.3°F');
    const infusionSymptoms = getAnswer(answers, 'SKI-212', 'infusion_symptoms') === 'Yes';
    if (infusionSymptoms) alerts.push('Infusion site swollen/warm/draining');

    if (alerts.length > 0) {
      return {
        action: 'continue' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: alerts.join('; '),
        severity: sev,
      };
    }
    return continueResult();
  },
  evaluateFollowUp: (answers) => {
    const days = parseDays(getAnswer(answers, 'SKI-212', 'days'));
    const worsening = getAnswer(answers, 'SKI-212', 'worsening');
    const blistering = getAnswer(answers, 'SKI-212', 'blistering') === 'Yes';
    const feelingUnwell = getAnswer(answers, 'SKI-212', 'feeling_unwell') === 'Yes';

    const branches: string[] = [];
    if (feelingUnwell) branches.push('FEV-202');

    if (blistering || (worsening === 'Worsening' && days >= 2)) {
      return {
        action: branches.length > 0 ? 'branch' as const : 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: blistering ? 'Skin blistering/peeling' : 'Worsening rash ≥2 days',
        branchTo: branches.length > 0 ? branches : undefined,
      };
    }
    return branches.length > 0 ? branchResult(branches) : stopResult();
  },
});



// ── SWE-214 — Swelling ───────────────────────────────────────────

export const SWE_214: SymptomModuleDef = defineSymptom({
  symptomId: 'SWE-214',
  name: 'Swelling',
  isHidden: false,
  screeningQuestions: [
    { id: 'locations', text: 'Where is the swelling?', type: 'MULTISELECT', options: SWELLING_LOCATIONS },
    { id: 'one_both', text: 'Is the swelling in one side or both sides?', type: 'CHOICE', options: ['One side', 'Both sides'] },
    { id: 'onset', text: 'When did the swelling start?', type: 'TEXT' },
    { id: 'cause', text: 'Do you know what caused the swelling?', type: 'TEXT' },
    { id: 'severity', text: 'Rate the swelling severity:', type: 'CHOICE', options: SEVERITY_OPTIONS },
    { id: 'associated', text: 'Are you experiencing any of these?', type: 'MULTISELECT', options: SWELLING_ASSOCIATED },
    { id: 'redness_over', text: 'Is there redness or warmth over the swelling?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'clot_history', text: 'Do you have a history of blood clots?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    const locs: string[] = getAnswer(answers, 'SWE-214', 'locations') || [];
    const oneBoth = getAnswer(answers, 'SWE-214', 'one_both');
    const associated: string[] = getAnswer(answers, 'SWE-214', 'associated') || [];
    const redness = getAnswer(answers, 'SWE-214', 'redness_over') === 'Yes';
    const clotHistory = getAnswer(answers, 'SWE-214', 'clot_history') === 'Yes';
    const sev = parseSeverity(getAnswer(answers, 'SWE-214', 'severity'));

    const hasFaceNeckChest = locs.some(l => ['Face', 'Neck'].includes(l));
    const hasSob = associated.includes('Shortness of breath');
    const hasChestDiscomfort = associated.includes('Chest discomfort');
    const hasFever = associated.includes('Fever');
    const unilateralLeg = locs.includes('Legs') && oneBoth === 'One side';

    // Emergency: SOB or chest discomfort → DVT/PE concern
    if (hasSob || hasChestDiscomfort) {
      return emergencyResult('Swelling with SOB or chest discomfort — possible DVT/PE. Call 911.');
    }

    const alerts: string[] = [];
    if (hasFaceNeckChest) alerts.push('Face/neck swelling');
    if (hasFever) alerts.push('Fever with swelling');
    if (unilateralLeg) alerts.push('Unilateral leg swelling — DVT concern');
    if (redness) alerts.push('Redness/warmth over swelling');
    if (clotHistory) alerts.push('History of blood clots');
    if (sev === 'SEVERE') alerts.push('Severe swelling');

    if (alerts.length > 0) {
      return {
        action: 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: alerts.join('; '),
        severity: sev,
      };
    }
    return stopResult();
  },
  evaluateFollowUp: () => stopResult(),
});

// ── EYE-207 — Eye Complaints ─────────────────────────────────────

export const EYE_207: SymptomModuleDef = defineSymptom({
  symptomId: 'EYE-207',
  name: 'Eye Complaints',
  isHidden: false,
  screeningQuestions: [
    { id: 'new_concern', text: 'Is this a new eye concern?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'symptoms', text: 'Which eye symptoms are you experiencing?', type: 'MULTISELECT', options: EYE_SYMPTOMS },
    { id: 'vision_problems', text: 'Are you having any vision problems (blurry vision, double vision, vision loss)?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'interferes_tasks', text: 'Does this interfere with your daily tasks?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'severity', text: 'Rate the severity of your eye problem:', type: 'CHOICE', options: SEVERITY_OPTIONS },
  ],
  followUpQuestions: [
    { id: 'seen_doctor', text: 'Have you seen an eye doctor about this?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  evaluateScreening: (answers) => {
    const visionProblems = getAnswer(answers, 'EYE-207', 'vision_problems') === 'Yes';
    const interferes = getAnswer(answers, 'EYE-207', 'interferes_tasks') === 'Yes';
    const sev = parseSeverity(getAnswer(answers, 'EYE-207', 'severity'));

    const alerts: string[] = [];
    if (visionProblems) alerts.push('Vision problems');
    if (interferes) alerts.push('Interferes with daily tasks');
    if (sev === 'SEVERE') alerts.push('Severe eye problem');

    if (alerts.length > 0) {
      return {
        action: 'continue' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: alerts.join('; '),
        severity: sev,
      };
    }
    return continueResult();
  },
  evaluateFollowUp: () => stopResult(),
});

export const SKIN_EXTERNAL_MODULES: SymptomModuleDef[] = [
  SKI_212, SWE_214, EYE_207,
];