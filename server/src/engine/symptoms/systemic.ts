import { TriageLevel } from '@oncolife/shared';
import { SymptomModuleDef } from '../types';
import {
  SEVERITY_OPTIONS,
  ORAL_INTAKE_OPTIONS_24H,
  FEVER_ASSOCIATED_SYMPTOMS,
  FEVER_MEDS_OPTIONS,
  FEVER_DURATION_OPTIONS,
  MEDS_COUGH,
  MUCUS_OPTIONS,
  DEHYDRATION_SIGNS,
  WORSENING_OPTIONS,
  YES_NO_OPTIONS,
  BURNING_URINATION_OPTIONS,
} from '../optionSets';
import {
  defineSymptom,
  getAnswer,
  parseSeverity,
  parseDays,
  isCriticalIntake,
  hasDehydrationSigns,
  medsTaken,
  continueResult,
  stopResult,
  branchResult,
  emergencyResult,
} from './base';

// ── FEV-202 — Fever ───────────────────────────────────────────────

/** Parse temperature from answer, auto-converting °C → °F when < 45. */
function parseTemp(answer: string | number | undefined): number {
  if (answer === undefined || answer === null) return 0;
  const t = typeof answer === 'number' ? answer : parseFloat(String(answer));
  if (isNaN(t)) return 0;
  // Auto-convert °C to °F if value looks like Celsius
  return t > 0 && t < 45 ? t * 9 / 5 + 32 : t;
}

/** Helper: get parsed temperature from FEV-202 answers. */
function getFevTemp(answers: Record<string, any>): number {
  return parseTemp(getAnswer(answers, 'FEV-202', 'temp'));
}

export const FEV_202: SymptomModuleDef = defineSymptom({
  symptomId: 'FEV-202',
  name: 'Fever',
  isHidden: false,
  screeningQuestions: [
    {
      id: 'temp',
      text: 'Fever can be worrying. What is your temperature? (Enter number, e.g., 101.5)',
      type: 'NUMBER',
    },
    {
      id: 'fever_meds',
      text: 'What medications have you taken to lower your temperature?',
      type: 'CHOICE',
      options: FEVER_MEDS_OPTIONS,
    },
    {
      id: 'fever_meds_detail',
      text: 'What did you take and how often?',
      type: 'TEXT',
      condition: (answers) => {
        const m = getAnswer(answers, 'FEV-202', 'fever_meds');
        return !!m && m !== 'None';
      },
    },
    {
      id: 'fever_duration',
      text: 'How long have you had this fever?',
      type: 'CHOICE',
      options: FEVER_DURATION_OPTIONS,
      condition: (answers) => getFevTemp(answers) > 100.3,
    },
    {
      id: 'high_temp_symptoms',
      text: 'Are you experiencing any of these additional symptoms?',
      type: 'MULTISELECT',
      options: FEVER_ASSOCIATED_SYMPTOMS,
      condition: (answers) => getFevTemp(answers) > 100.3,
    },
    {
      id: 'high_temp_symptoms_other',
      text: 'Please describe the other symptom:',
      type: 'TEXT',
      condition: (answers) => {
        if (getFevTemp(answers) <= 100.3) return false;
        const syms: string[] = getAnswer(answers, 'FEV-202', 'high_temp_symptoms') || [];
        return syms.includes('Other');
      },
    },
    {
      id: 'fever_intake',
      text: 'Have you been able to eat/drink normally?',
      type: 'CHOICE',
      options: ORAL_INTAKE_OPTIONS_24H,
      condition: (answers) => getFevTemp(answers) > 100.3,
    },
    {
      id: 'fever_adl',
      text: 'Are you able to perform daily self care like bathing, using the toilet, eating independently?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
      condition: (answers) => getFevTemp(answers) > 100.3,
    },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    const temp = getFevTemp(answers);
    const meds = getAnswer(answers, 'FEV-202', 'fever_meds') as string | undefined;
    const medsDetail = getAnswer(answers, 'FEV-202', 'fever_meds_detail') as string | undefined;

    // Low-grade: ≤ 100.3 → stop with NONE
    if (temp <= 100.3) {
      let message = `Temperature ${temp.toFixed(1)}°F is below fever threshold (100.3°F). `;
      if (meds && meds !== 'None') {
        message += `Patient taking ${meds}${medsDetail ? ': ' + medsDetail : ''}.`;
      } else {
        message += 'No fever medications taken.';
      }
      message += ' Continue to monitor temperature.';
      return {
        action: 'stop' as const,
        triageLevel: TriageLevel.NONE,
        alertMessage: message,
      };
    }

    // High-grade: > 100.3 → stop with NOTIFY_CARE_TEAM
    const duration = getAnswer(answers, 'FEV-202', 'fever_duration') as string | undefined;
    const symptoms: string[] = getAnswer(answers, 'FEV-202', 'high_temp_symptoms') || [];

    let message = `Fever ${temp.toFixed(1)}°F (Duration: ${duration || 'unknown'}). `;
    if (meds && meds !== 'None') {
      message += `Taking ${meds}${medsDetail ? ': ' + medsDetail : ''}. `;
    } else {
      message += 'No fever medications taken. ';
    }

    const filtered = symptoms.filter((s) => s !== 'None');
    if (filtered.length > 0) {
      message += `Associated symptoms: ${filtered.join(', ')}.`;
    } else {
      message += 'No additional symptoms reported.';
    }

    return {
      action: 'stop' as const,
      triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
      alertMessage: message,
    };
  },
  evaluateFollowUp: () => stopResult(),
});

// ── FAT-206 — Fatigue ─────────────────────────────────────────────

export const FAT_206: SymptomModuleDef = defineSymptom({
  symptomId: 'FAT-206',
  name: 'Fatigue',
  isHidden: false,
  screeningQuestions: [
    { id: 'daily_activities', text: 'Does the fatigue interfere with your daily activities?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'severity', text: 'Rate your fatigue severity:', type: 'CHOICE', options: SEVERITY_OPTIONS },
    { id: 'days', text: 'How many continuous days have you felt this fatigue?', type: 'NUMBER' },
    {
      id: 'worsening',
      text: 'Is the fatigue worsening, the same, or improving?',
      type: 'CHOICE',
      options: WORSENING_OPTIONS,
      condition: (answers) => parseDays(getAnswer(answers, 'FAT-206', 'days')) >= 3,
    },
    { id: 'hours_bed', text: 'How many hours are you sleeping or spending in bed?', type: 'NUMBER' },
    { id: 'worse_yesterday', text: 'Was the fatigue worse yesterday than the day before?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'self_care', text: 'Does the fatigue affect your ability to perform self-care?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    const adl = getAnswer(answers, 'FAT-206', 'daily_activities') === 'Yes';
    const sev = parseSeverity(getAnswer(answers, 'FAT-206', 'severity'));
    const days = parseDays(getAnswer(answers, 'FAT-206', 'days'));
    const worsening = getAnswer(answers, 'FAT-206', 'worsening');
    const selfCare = getAnswer(answers, 'FAT-206', 'self_care') === 'Yes';

    const alerts: string[] = [];
    if (adl) alerts.push('Significantly interferes with daily activities');
    if (sev === 'SEVERE') alerts.push('Severe fatigue');
    if (sev === 'MODERATE' && days >= 3) alerts.push('Moderate fatigue ≥3 days');
    if (worsening === 'Worsening') alerts.push('Worsening fatigue');
    if (selfCare) alerts.push('Cannot perform self-care');

    if (alerts.length > 0) {
      return {
        action: 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: alerts.join('; '),
        severity: sev,
        duration: `${days} days`,
      };
    }
    return stopResult();
  },
  evaluateFollowUp: () => stopResult(),
});



// ── COU-215 — Cough ───────────────────────────────────────────────

export const COU_215: SymptomModuleDef = defineSymptom({
  symptomId: 'COU-215',
  name: 'Cough',
  isHidden: false,
  screeningQuestions: [
    { id: 'days', text: 'How many days have you had a cough?', type: 'NUMBER' },
    { id: 'temperature', text: 'What is your temperature?', type: 'NUMBER' },
    { id: 'mucus', text: 'Are you coughing up mucus?', type: 'CHOICE', options: MUCUS_OPTIONS },
    { id: 'meds', text: 'What cough medications are you taking?', type: 'CHOICE', options: MEDS_COUGH },
    {
      id: 'meds_helping',
      text: 'Are the medications helping?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
      condition: (answers) => medsTaken(getAnswer(answers, 'COU-215', 'meds')),
    },
    { id: 'daily_activities', text: 'Does the cough prevent you from performing daily activities?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'chest_pain_sob', text: 'Are you having chest pain or shortness of breath?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'has_oximeter', text: 'Do you have access to a pulse oximeter?', type: 'YES_NO', options: YES_NO_OPTIONS },
    {
      id: 'o2_sat',
      text: 'What is your oxygen saturation (O2 sat)?',
      type: 'NUMBER',
      condition: (answers) => getAnswer(answers, 'COU-215', 'has_oximeter') === 'Yes',
    },
    { id: 'severity', text: 'Rate your cough severity:', type: 'CHOICE', options: SEVERITY_OPTIONS },
    { id: 'around_sick', text: 'Have you been around anyone who is sick?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    const mucus = getAnswer(answers, 'COU-215', 'mucus');
    const chestPainSob = getAnswer(answers, 'COU-215', 'chest_pain_sob') === 'Yes';
    const o2 = parseDays(getAnswer(answers, 'COU-215', 'o2_sat'));
    const sev = parseSeverity(getAnswer(answers, 'COU-215', 'severity'));
    let temp = parseDays(getAnswer(answers, 'COU-215', 'temperature'));
    if (temp > 0 && temp < 45) temp = temp * 9 / 5 + 32;

    // Emergency: chest pain/SOB or critically low O2
    if (chestPainSob) {
      return emergencyResult('Chest pain/shortness of breath with cough — possible emergency.');
    }
    if (o2 > 0 && o2 < 90) {
      return emergencyResult('Critically low O2 saturation — call 911.');
    }

    const alerts: string[] = [];
    if (mucus === 'Blood-streaked') alerts.push('Blood-streaked mucus');
    if (o2 > 0 && o2 < 94) alerts.push(`O2 sat ${o2}% (<94%)`);
    if (sev === 'SEVERE') alerts.push('Severe cough');
    if (temp >= 100.3) alerts.push('Fever ≥100.3°F');

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

// ── URI-211 — Urinary Problems ────────────────────────────────────

export const URI_211: SymptomModuleDef = defineSymptom({
  symptomId: 'URI-211',
  name: 'Urinary Problems',
  isHidden: false,
  screeningQuestions: [
    { id: 'amount_changed', text: 'Has the amount of urine you produce changed?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'burning', text: 'Are you experiencing burning with urination?', type: 'CHOICE', options: BURNING_URINATION_OPTIONS },
    { id: 'pelvic_pain', text: 'Are you having pelvic pain?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'blood_urine', text: 'Is there blood in your urine?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [
    { id: 'unusual_smell', text: 'Does your urine have an unusual smell?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'drinking_normal', text: 'Are you drinking normal amounts of fluids?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'diabetic', text: 'Are you diabetic?', type: 'YES_NO', options: YES_NO_OPTIONS },
    {
      id: 'blood_sugar',
      text: 'What is your blood sugar?',
      type: 'NUMBER',
      condition: (answers) => getAnswer(answers, 'URI-211', 'diabetic') === 'Yes',
    },
  ],
  evaluateScreening: (answers) => {
    const amountChanged = getAnswer(answers, 'URI-211', 'amount_changed') === 'Yes';
    const burning = getAnswer(answers, 'URI-211', 'burning');
    const pelvicPain = getAnswer(answers, 'URI-211', 'pelvic_pain') === 'Yes';
    const bloodUrine = getAnswer(answers, 'URI-211', 'blood_urine') === 'Yes';

    const alerts: string[] = [];
    if (amountChanged) alerts.push('Drastic urine amount change');
    if (pelvicPain) alerts.push('Pelvic pain');
    if (bloodUrine) alerts.push('Blood in urine');
    if (burning === 'Moderate' || burning === 'Severe') alerts.push(`${burning} burning with urination`);

    if (alerts.length > 0) {
      return {
        action: 'continue' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: alerts.join('; '),
      };
    }
    return continueResult();
  },
  evaluateFollowUp: (answers) => {
    const drinkingNormal = getAnswer(answers, 'URI-211', 'drinking_normal');
    const bloodSugar = parseDays(getAnswer(answers, 'URI-211', 'blood_sugar'));

    const branches: string[] = [];
    if (drinkingNormal === 'No') branches.push('DEH-201');

    if (bloodSugar > 250 || (bloodSugar > 0 && bloodSugar < 60)) {
      return {
        action: branches.length > 0 ? 'branch' as const : 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: `Blood sugar ${bloodSugar} — ${bloodSugar > 250 ? 'high' : 'low'}`,
        branchTo: branches.length > 0 ? branches : undefined,
      };
    }
    return branches.length > 0 ? branchResult(branches) : stopResult();
  },
});

export const SYSTEMIC_MODULES: SymptomModuleDef[] = [
  FEV_202, FAT_206, COU_215, URI_211,
];