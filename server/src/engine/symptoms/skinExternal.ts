import { TriageLevel } from '@oncolife/shared';
import { SymptomModuleDef } from '../types';
import {
  SEVERITY_OPTIONS,
  SKIN_LOCATIONS,
  SWELLING_LOCATIONS,
  SWELLING_SIDE,
  SWELLING_ONSET,
  SWELLING_TRIGGER,
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

    // Facial rash + trouble breathing → branch to URG-101 per spec
    if (locs.includes('Face') && facialBreathing) {
      return {
        action: 'branch' as const,
        triageLevel: TriageLevel.CALL_911,
        alertMessage: 'Facial Rash with Breathing Difficulty - possible allergic reaction. Seek immediate emergency care.',
        branchTo: ['URG-101'],
      };
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
    { id: 'swell_loc', text: 'Where is your swelling? (You can select more than one)', type: 'MULTISELECT', options: SWELLING_LOCATIONS },
    {
      id: 'swell_loc_other',
      text: 'Please describe the location:',
      type: 'TEXT',
      condition: (answers) => {
        const locs: string[] = getAnswer(answers, 'SWE-214', 'swell_loc') || [];
        return locs.includes('Other');
      },
    },
    { id: 'swell_side', text: 'Is the swelling on one side or both?', type: 'CHOICE', options: SWELLING_SIDE },
    { id: 'swell_onset', text: 'When did the swelling start?', type: 'CHOICE', options: SWELLING_ONSET },
    { id: 'swell_trigger', text: 'Did the swelling start after any of the following? (Select all that apply)', type: 'MULTISELECT', options: SWELLING_TRIGGER },
    { id: 'severity', text: 'Rate your swelling:', type: 'CHOICE', options: SEVERITY_OPTIONS },
    { id: 'swell_associated', text: 'Are you also noticing any of these today? (Select all that apply)', type: 'MULTISELECT', options: SWELLING_ASSOCIATED },
    { id: 'redness', text: 'Is there any redness where you have swelling?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [
    { id: 'swell_clots', text: 'Do you have a history of blood clots?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  evaluateScreening: (answers) => {
    const locs: string[] = getAnswer(answers, 'SWE-214', 'swell_loc') || [];
    const side = getAnswer(answers, 'SWE-214', 'swell_side');
    const onset = getAnswer(answers, 'SWE-214', 'swell_onset');
    const sev = parseSeverity(getAnswer(answers, 'SWE-214', 'severity'));
    const associated: string[] = getAnswer(answers, 'SWE-214', 'swell_associated') || [];
    const redness = getAnswer(answers, 'SWE-214', 'redness') === 'Yes';

    const isOneSided = side === 'One side';
    const isSudden = onset === 'Today';
    const hasCriticalLocation = locs.some(l =>
      ['Neck or chest', 'Around my port', 'Near an IV site'].includes(l),
    );
    const hasSob = associated.includes('Shortness of breath');
    const hasChest = associated.includes('Chest discomfort');
    const hasFever = associated.includes('Fever');
    const hasRedness = associated.includes('Redness') || redness;
    const isSevere = sev === 'SEVERE';

    // SOB with swelling → branch to URG-101 for breathing emergency
    if (hasSob) {
      return {
        action: 'branch' as const,
        triageLevel: TriageLevel.CALL_911,
        alertMessage: 'Swelling with shortness of breath. This may be an emergency.',
        branchTo: ['URG-101'],
      };
    }

    // Build reasons for messaging
    const reasons: string[] = [];
    if (isOneSided) reasons.push('One-sided swelling');
    if (isSudden) reasons.push('Sudden onset');
    if (hasCriticalLocation) reasons.push('Neck/chest/port/IV site involvement');
    if (hasChest) reasons.push('Chest discomfort');
    if (hasFever) reasons.push('Fever');
    if (hasRedness) reasons.push('Redness');
    if (isSevere) reasons.push('Severe swelling');

    // EMERGENT: one-sided+sudden, critical location, chest discomfort, fever, redness, severe
    const emergentCondition =
      (isOneSided && isSudden) ||
      hasCriticalLocation ||
      hasChest ||
      hasFever ||
      hasRedness ||
      isSevere;

    if (emergentCondition) {
      return {
        action: 'stop' as const,
        triageLevel: TriageLevel.CALL_911,
        alertMessage: `URGENT: Call 911 or your care team right away. ${reasons.join(', ')}.`,
        severity: sev,
      };
    }

    // One-sided OR sudden alone → NOTIFY_CARE_TEAM, continue to follow-up
    if (isOneSided || isSudden) {
      return {
        action: 'continue' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: `Swelling concern: ${reasons.join(', ')}. Contact your care team.`,
        severity: sev,
      };
    }

    // Moderate OR prolonged (2-3d, >3d) OR bilateral arm/leg → NOTIFY_CARE_TEAM
    const hasArmLeg = locs.some(l =>
      ['Arm(s) or hand(s)', 'Leg(s), ankle(s), or foot/feet'].includes(l),
    );
    const isBothSides = side === 'Both sides';
    const isModerate = sev === 'MODERATE';
    const isProlonged = onset === '2-3 days ago' || onset === 'More than 3 days ago';

    if (isModerate || isProlonged || (hasArmLeg && isBothSides)) {
      const notifyReasons: string[] = [];
      if (isModerate) notifyReasons.push('Moderate swelling');
      if (isProlonged) notifyReasons.push('Duration >2 days');
      if (hasArmLeg && isBothSides) notifyReasons.push('Both sides arm/leg involvement');
      return {
        action: 'continue' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: `Swelling: ${notifyReasons.join(', ')}.`,
        severity: sev,
      };
    }

    return continueResult();
  },
  evaluateFollowUp: (answers) => {
    if (getAnswer(answers, 'SWE-214', 'swell_clots') === 'Yes') {
      return {
        action: 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: 'Swelling with history of blood clots - increased DVT risk.',
      };
    }
    return stopResult();
  },
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