import { TriageLevel } from '@oncolife/shared';
import { SymptomModuleDef } from '../types';
import {
  SEVERITY_OPTIONS,
  ORAL_INTAKE_OPTIONS_24H,
  ORAL_INTAKE_OPTIONS_12H,
  MEDS_NAUSEA,
  MEDS_DIARRHEA,
  MEDS_CONSTIPATION,
  DEHYDRATION_SIGNS,
  DURATION_OPTIONS,
  WORSENING_OPTIONS,
  VOMITING_FREQUENCY_OPTIONS,
  STOOL_SYMPTOMS,
  YES_NO_OPTIONS,
} from '../optionSets';
import {
  defineSymptom,
  getAnswer,
  parseSeverity,
  isCriticalIntake,
  hasDehydrationSigns,
  medsTaken,
  parseDays,
  continueResult,
  stopResult,
  branchResult,
} from './base';

// ── NAU-203 — Nausea ───────────────────────────────────────────────

export const NAU_203: SymptomModuleDef = defineSymptom({
  symptomId: 'NAU-203',
  name: 'Nausea',
  isHidden: false,
  screeningQuestions: [
    {
      id: 'duration',
      text: "I'm sorry to hear you're feeling nauseous. How long has this been going on?",
      type: 'CHOICE',
      options: DURATION_OPTIONS,
    },
    {
      id: 'worsening',
      text: 'Is the nausea worsening or the same?',
      type: 'CHOICE',
      options: WORSENING_OPTIONS,
      condition: (answers) => getAnswer(answers, 'NAU-203', 'duration') === 'More than 3 days',
    },
    {
      id: 'oral_intake',
      text: 'How is your oral intake?',
      type: 'CHOICE',
      options: ORAL_INTAKE_OPTIONS_24H,
    },
    {
      id: 'meds',
      text: 'What anti-nausea medications are you taking?',
      type: 'CHOICE',
      options: MEDS_NAUSEA,
    },
    {
      id: 'med_frequency',
      text: 'How often are you taking these medications?',
      type: 'TEXT',
      condition: (answers) => getAnswer(answers, 'NAU-203', 'meds') === 'Other',
    },
    {
      id: 'severity_with_meds',
      text: 'Rate your nausea after taking medication:',
      type: 'CHOICE',
      options: SEVERITY_OPTIONS,
      condition: (answers) => medsTaken(getAnswer(answers, 'NAU-203', 'meds')),
    },
    {
      id: 'severity_no_meds',
      text: 'Rate your nausea:',
      type: 'CHOICE',
      options: SEVERITY_OPTIONS,
      condition: (answers) => !medsTaken(getAnswer(answers, 'NAU-203', 'meds')),
    },
  ],
  followUpQuestions: [
    { id: 'vomiting', text: 'Have you been vomiting?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'abd_pain', text: 'Are you having abdominal pain?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'dehydration', text: 'Any signs of dehydration?', type: 'MULTISELECT', options: DEHYDRATION_SIGNS },
    {
      id: 'vitals',
      text: 'Please enter your vitals (HR and BP):',
      type: 'TEXT',
      condition: (answers) => {
        const sel = getAnswer(answers, 'NAU-203', 'dehydration');
        return Array.isArray(sel) && sel.includes('I know my vitals');
      },
    },
    { id: 'fluids_down', text: 'Have you been able to keep fluids down?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'self_care', text: 'Are you able to perform daily self-care (bathing, dressing)?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  evaluateScreening: (answers) => {
    const intake = getAnswer(answers, 'NAU-203', 'oral_intake');
    const sevWithMeds = parseSeverity(getAnswer(answers, 'NAU-203', 'severity_with_meds'));
    const sevNoMeds = parseSeverity(getAnswer(answers, 'NAU-203', 'severity_no_meds'));
    const severity = sevWithMeds || sevNoMeds;
    const meds = getAnswer(answers, 'NAU-203', 'meds');
    const duration = getAnswer(answers, 'NAU-203', 'duration');
    const worsening = getAnswer(answers, 'NAU-203', 'worsening');

    // Moderate nausea for >3 days and worsening/same (not improving)
    const moderateChronicWorsening =
      severity === 'MODERATE' &&
      duration === 'More than 3 days' &&
      (worsening === 'Worsening' || worsening === 'Same');

    if (isCriticalIntake(intake) || (severity === 'SEVERE' && medsTaken(meds)) || moderateChronicWorsening) {
      let alertMessage = '';
      if (isCriticalIntake(intake)) {
        alertMessage = 'Patient reports barely eating/drinking or unable to eat/drink.';
      } else if (severity === 'SEVERE' && medsTaken(meds)) {
        alertMessage = 'Severe nausea despite medication.';
      } else {
        alertMessage = 'Moderate nausea for >3 days and worsening/same.';
      }
      return {
        action: 'continue',
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage,
        severity,
        duration,
        medicationsTried: meds,
      };
    }
    return continueResult(TriageLevel.NONE);
  },
  evaluateFollowUp: (answers) => {
    const dehydration = getAnswer(answers, 'NAU-203', 'dehydration');
    const branches: string[] = [];
    if (hasDehydrationSigns(dehydration)) {
      branches.push('DEH-201');
    }
    if (branches.length > 0) {
      return branchResult(branches, TriageLevel.NONE);
    }
    return stopResult(TriageLevel.NONE);
  },
});

// ── VOM-204 — Vomiting ─────────────────────────────────────────────

export const VOM_204: SymptomModuleDef = defineSymptom({
  symptomId: 'VOM-204',
  name: 'Vomiting',
  isHidden: false,
  screeningQuestions: [
    { id: 'days', text: 'How many days have you been vomiting?', type: 'NUMBER' },
    {
      id: 'worsening',
      text: 'Is the vomiting worsening or the same?',
      type: 'CHOICE',
      options: WORSENING_OPTIONS,
      condition: (answers) => parseDays(getAnswer(answers, 'VOM-204', 'days')) >= 3,
    },
    {
      id: 'frequency',
      text: 'How many times have you vomited in the last 24 hours?',
      type: 'CHOICE',
      options: VOMITING_FREQUENCY_OPTIONS,
    },
    {
      id: 'oral_intake',
      text: 'How is your oral intake over the last 12 hours?',
      type: 'CHOICE',
      options: ORAL_INTAKE_OPTIONS_12H,
    },
    { id: 'meds', text: 'What medications for vomiting are you taking?', type: 'CHOICE', options: MEDS_NAUSEA },
    {
      id: 'severity_with_meds',
      text: 'Rate your severity after medication:',
      type: 'CHOICE',
      options: SEVERITY_OPTIONS,
      condition: (answers) => medsTaken(getAnswer(answers, 'VOM-204', 'meds')),
    },
  ],
  followUpQuestions: [
    { id: 'abd_pain', text: 'Are you having abdominal pain?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'dehydration', text: 'Any signs of dehydration?', type: 'MULTISELECT', options: DEHYDRATION_SIGNS },
    { id: 'self_care', text: 'Are you able to perform daily self-care?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  evaluateScreening: (answers) => {
    const freq = getAnswer(answers, 'VOM-204', 'frequency');
    const intake = getAnswer(answers, 'VOM-204', 'oral_intake');
    const sev = parseSeverity(getAnswer(answers, 'VOM-204', 'severity_with_meds'));
    const days = parseDays(getAnswer(answers, 'VOM-204', 'days'));
    const meds = getAnswer(answers, 'VOM-204', 'meds');

    const alerts: string[] = [];
    if (freq === 'More than 6 times') alerts.push('>6 vomiting episodes in 24h');
    if (intake?.toLowerCase().includes('not able')) alerts.push('No oral intake in last 12h');
    if (sev === 'SEVERE' && medsTaken(meds)) alerts.push('Severe vomiting despite meds');
    if (sev === 'MODERATE' && days >= 3) alerts.push('Moderate vomiting for ≥3 continuous days');

    if (alerts.length > 0) {
      return {
        action: 'continue',
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: alerts.join('; '),
        severity: sev,
        duration: `${days} days`,
        medicationsTried: meds,
      };
    }
    return continueResult(TriageLevel.NONE);
  },
  evaluateFollowUp: (answers) => {
    const dehydration = getAnswer(answers, 'VOM-204', 'dehydration');
    const branches: string[] = [];
    if (hasDehydrationSigns(dehydration)) branches.push('DEH-201');
    return branches.length > 0 ? branchResult(branches) : stopResult();
  },
});

// ── DIA-205 — Diarrhea ─────────────────────────────────────────────

export const DIA_205: SymptomModuleDef = defineSymptom({
  symptomId: 'DIA-205',
  name: 'Diarrhea',
  isHidden: false,
  screeningQuestions: [
    { id: 'days', text: 'How many days have you had diarrhea?', type: 'NUMBER' },
    {
      id: 'worsening',
      text: 'Is it worsening or the same?',
      type: 'CHOICE',
      options: WORSENING_OPTIONS,
      condition: (answers) => parseDays(getAnswer(answers, 'DIA-205', 'days')) >= 3,
    },
    { id: 'loose_stools', text: 'How many loose stools in the last 24 hours?', type: 'NUMBER' },
    {
      id: 'stool_symptoms',
      text: 'Are you experiencing any of these with your stool?',
      type: 'MULTISELECT',
      options: STOOL_SYMPTOMS,
    },
    { id: 'abd_pain', text: 'Are you having abdominal pain?', type: 'YES_NO', options: YES_NO_OPTIONS },
    {
      id: 'abd_pain_severity',
      text: 'Rate your abdominal pain:',
      type: 'CHOICE',
      options: SEVERITY_OPTIONS,
      condition: (answers) => getAnswer(answers, 'DIA-205', 'abd_pain') === 'Yes',
    },
    { id: 'meds', text: 'What anti-diarrhea medications are you taking?', type: 'CHOICE', options: MEDS_DIARRHEA },
    {
      id: 'severity_with_meds',
      text: 'Rate severity after medication:',
      type: 'CHOICE',
      options: SEVERITY_OPTIONS,
      condition: (answers) => medsTaken(getAnswer(answers, 'DIA-205', 'meds')),
    },
    {
      id: 'severity_no_meds',
      text: 'Rate your diarrhea severity:',
      type: 'CHOICE',
      options: SEVERITY_OPTIONS,
      condition: (answers) => !medsTaken(getAnswer(answers, 'DIA-205', 'meds')),
    },
    { id: 'dehydration', text: 'Any signs of dehydration?', type: 'MULTISELECT', options: DEHYDRATION_SIGNS },
    {
      id: 'vitals',
      text: 'Please enter your vitals:',
      type: 'TEXT',
      condition: (answers) => {
        const sel = getAnswer(answers, 'DIA-205', 'dehydration');
        return Array.isArray(sel) && sel.includes('I know my vitals');
      },
    },
    { id: 'oral_intake', text: 'How is your oral intake?', type: 'CHOICE', options: ORAL_INTAKE_OPTIONS_24H },
    { id: 'self_care', text: 'Are you able to perform daily self-care?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    const stools = parseDays(getAnswer(answers, 'DIA-205', 'loose_stools'));
    const abdSev = parseSeverity(getAnswer(answers, 'DIA-205', 'abd_pain_severity'));
    const stoolSyms: string[] = getAnswer(answers, 'DIA-205', 'stool_symptoms') || [];
    const dehydration = getAnswer(answers, 'DIA-205', 'dehydration');
    const intake = getAnswer(answers, 'DIA-205', 'oral_intake');
    const sevMeds = parseSeverity(getAnswer(answers, 'DIA-205', 'severity_with_meds'));
    const sevNo = parseSeverity(getAnswer(answers, 'DIA-205', 'severity_no_meds'));
    const sev = sevMeds || sevNo;
    const days = parseDays(getAnswer(answers, 'DIA-205', 'days'));
    const meds = getAnswer(answers, 'DIA-205', 'meds');

    const alerts: string[] = [];
    if (stools > 5) alerts.push('>5 loose stools/day');
    if (abdSev === 'MODERATE' || abdSev === 'SEVERE') alerts.push('Moderate/severe abdominal pain');
    if (stoolSyms.some((s: string) => ['Black stool', 'Blood in stool', 'Mucus'].includes(s))) {
      alerts.push('Abnormal stool (black/blood/mucus)');
    }
    if (hasDehydrationSigns(dehydration)) alerts.push('Dehydration signs present');
    if (isCriticalIntake(intake)) alerts.push('Intake barely/none');
    if (sev === 'SEVERE' && medsTaken(meds)) alerts.push('Severe despite meds');
    if (sev === 'MODERATE' && days >= 3) alerts.push('Moderate ≥3 days');

    const branches: string[] = [];
    if (hasDehydrationSigns(dehydration)) branches.push('DEH-201');

    if (alerts.length > 0) {
      return {
        action: branches.length > 0 ? 'branch' as const : 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: alerts.join('; '),
        branchTo: branches.length > 0 ? branches : undefined,
        severity: sev,
        duration: `${days} days`,
        medicationsTried: meds,
      };
    }
    return branches.length > 0 ? branchResult(branches) : stopResult();
  },
  evaluateFollowUp: () => stopResult(),
});

// ── CON-210 — Constipation ─────────────────────────────────────────

export const CON_210: SymptomModuleDef = defineSymptom({
  symptomId: 'CON-210',
  name: 'Constipation',
  isHidden: false,
  screeningQuestions: [
    { id: 'days_no_bm', text: 'How many days since your last bowel movement?', type: 'NUMBER' },
    { id: 'passing_gas', text: 'Are you able to pass gas?', type: 'YES_NO', options: YES_NO_OPTIONS },
    {
      id: 'days_no_gas',
      text: 'How many days since you last passed gas?',
      type: 'NUMBER',
      condition: (answers) => getAnswer(answers, 'CON-210', 'passing_gas') === 'No',
    },
    { id: 'abd_discomfort', text: 'Are you experiencing abdominal discomfort?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'abd_pain', text: 'Are you having abdominal pain?', type: 'YES_NO', options: YES_NO_OPTIONS },
    {
      id: 'abd_pain_severity',
      text: 'Rate your abdominal pain:',
      type: 'CHOICE',
      options: SEVERITY_OPTIONS,
      condition: (answers) => getAnswer(answers, 'CON-210', 'abd_pain') === 'Yes',
    },
    { id: 'dehydration', text: 'Any signs of dehydration?', type: 'MULTISELECT', options: DEHYDRATION_SIGNS },
    { id: 'meds', text: 'What constipation medications are you taking?', type: 'CHOICE', options: MEDS_CONSTIPATION },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    const daysNoBm = parseDays(getAnswer(answers, 'CON-210', 'days_no_bm'));
    const passingGas = getAnswer(answers, 'CON-210', 'passing_gas');
    const abdSev = parseSeverity(getAnswer(answers, 'CON-210', 'abd_pain_severity'));
    const dehydration = getAnswer(answers, 'CON-210', 'dehydration');
    const meds = getAnswer(answers, 'CON-210', 'meds');

    const alerts: string[] = [];
    if (daysNoBm >= 2) alerts.push('No BM for ≥2 days');
    if (abdSev === 'MODERATE' || abdSev === 'SEVERE') alerts.push('Moderate/severe abdominal pain');
    if (hasDehydrationSigns(dehydration)) alerts.push('Dehydration signs present');

    const branches: string[] = [];
    if (hasDehydrationSigns(dehydration)) branches.push('DEH-201');

    if (alerts.length > 0) {
      return {
        action: branches.length > 0 ? 'branch' as const : 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: alerts.join('; '),
        branchTo: branches.length > 0 ? branches : undefined,
        duration: `${daysNoBm} days since last BM`,
        medicationsTried: meds,
      };
    }
    return branches.length > 0 ? branchResult(branches) : stopResult();
  },
  evaluateFollowUp: () => stopResult(),
});



// ── APP-209 — No Appetite ──────────────────────────────────────────

export const APP_209: SymptomModuleDef = defineSymptom({
  symptomId: 'APP-209',
  name: 'No Appetite',
  isHidden: false,
  screeningQuestions: [
    { id: 'oral_intake', text: 'How is your oral intake (eating and drinking)?', type: 'CHOICE', options: ORAL_INTAKE_OPTIONS_24H },
    { id: 'weight_loss', text: 'Have you lost more than 3 pounds in the last week?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'eating_less', text: 'Are you eating less than half of your usual meals for 2 days or more?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'severity', text: 'Rate your discomfort:', type: 'CHOICE', options: SEVERITY_OPTIONS },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    const intake = getAnswer(answers, 'APP-209', 'oral_intake');
    const weightLoss = getAnswer(answers, 'APP-209', 'weight_loss');
    const eatingLess = getAnswer(answers, 'APP-209', 'eating_less');
    const sev = parseSeverity(getAnswer(answers, 'APP-209', 'severity'));

    const alerts: string[] = [];
    if (intake?.toLowerCase().includes('not able')) alerts.push('Intake = none');
    if (weightLoss === 'Yes') alerts.push('Weight loss >3 lbs');
    if (eatingLess === 'Yes') alerts.push('Eating less than half ≥2 days');
    if (sev === 'SEVERE') alerts.push('Severe discomfort');

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

// ── MSO-208 — Mouth Sores ─────────────────────────────────────────

export const MSO_208: SymptomModuleDef = defineSymptom({
  symptomId: 'MSO-208',
  name: 'Mouth Sores',
  isHidden: false,
  screeningQuestions: [
    { id: 'oral_intake', text: 'How is your oral intake?', type: 'CHOICE', options: ORAL_INTAKE_OPTIONS_24H },
    { id: 'weight_loss', text: 'Have you lost more than 3 pounds in the last week?', type: 'YES_NO', options: YES_NO_OPTIONS },
    {
      id: 'remedy',
      text: 'What remedies have you tried?',
      type: 'CHOICE',
      options: ['Magic Mouthwash Rinse 5–10 mL for 30–60 sec every 4–6h', 'Other', 'None'],
    },
    {
      id: 'remedy_other',
      text: 'What remedy have you tried?',
      type: 'TEXT',
      condition: (answers) => getAnswer(answers, 'MSO-208', 'remedy') === 'Other',
    },
    {
      id: 'remedy_days',
      text: 'How many days have you been using this remedy?',
      type: 'NUMBER',
      condition: (answers) => getAnswer(answers, 'MSO-208', 'remedy') !== 'None',
    },
    {
      id: 'remedy_helped',
      text: 'Has the remedy helped?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
      condition: (answers) => getAnswer(answers, 'MSO-208', 'remedy') !== 'None',
    },
    { id: 'temperature', text: 'What is your temperature?', type: 'NUMBER' },
    { id: 'severity', text: 'Rate your discomfort:', type: 'CHOICE', options: SEVERITY_OPTIONS },
  ],
  followUpQuestions: [
    { id: 'swallow_pain', text: 'Are you having any pain when you swallow?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'dark_urine', text: 'Is your urine dark?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'less_urine', text: 'Is the amount of urine a lot less over the last 12 hours?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'thirsty', text: 'Are you very thirsty?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'lightheaded', text: 'Are you lightheaded?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'vitals', text: 'Do you know your heart rate and blood pressure?', type: 'TEXT' },
  ],
  evaluateScreening: (answers) => {
    const intake = getAnswer(answers, 'MSO-208', 'oral_intake');
    const weightLoss = getAnswer(answers, 'MSO-208', 'weight_loss');
    const sev = parseSeverity(getAnswer(answers, 'MSO-208', 'severity'));
    const temp = parseDays(getAnswer(answers, 'MSO-208', 'temperature'));

    const alerts: string[] = [];
    if (isCriticalIntake(intake)) alerts.push('Intake = barely/none');
    if (weightLoss === 'Yes') alerts.push('Weight loss >3 lbs');
    if (sev === 'SEVERE') alerts.push('Severe discomfort');
    if (temp >= 100.3) alerts.push('Fever ≥100.3°F');

    if (alerts.length > 0) {
      return {
        action: 'continue' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: alerts.join('; '),
        severity: sev,
        medicationsTried: getAnswer(answers, 'MSO-208', 'remedy'),
      };
    }
    return continueResult();
  },
  evaluateFollowUp: (answers) => {
    const darkUrine = getAnswer(answers, 'MSO-208', 'dark_urine') === 'Yes';
    const lessUrine = getAnswer(answers, 'MSO-208', 'less_urine') === 'Yes';
    const thirsty = getAnswer(answers, 'MSO-208', 'thirsty') === 'Yes';
    const lightheaded = getAnswer(answers, 'MSO-208', 'lightheaded') === 'Yes';

    if (darkUrine || lessUrine || thirsty || lightheaded) {
      return branchResult(['DEH-201']);
    }
    return stopResult();
  },
});

// ── DEH-201 — Dehydration ─────────────────────────────────────────

export const DEH_201: SymptomModuleDef = defineSymptom({
  symptomId: 'DEH-201',
  name: 'Dehydration',
  isHidden: true,
  screeningQuestions: [
    {
      id: 'urine_color',
      text: 'What color is your urine?',
      type: 'CHOICE',
      options: ['Clear/pale', 'Light yellow', 'Dark yellow', 'Orange', 'Brown'],
    },
    { id: 'less_urine', text: 'Is the amount of urine a lot less over the last 12 hours?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'thirsty', text: 'Are you very thirsty?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'lightheaded', text: 'Are you lightheaded?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'vitals', text: 'Do you know your heart rate and blood pressure?', type: 'TEXT' },
    { id: 'vomiting', text: 'Have you been vomiting?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'diarrhea', text: 'Have you had diarrhea?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'oral_intake', text: 'How is your oral intake?', type: 'CHOICE', options: ORAL_INTAKE_OPTIONS_24H },
    { id: 'fever', text: 'Do you have a fever?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    const urineColor = getAnswer(answers, 'DEH-201', 'urine_color');
    const lessUrine = getAnswer(answers, 'DEH-201', 'less_urine') === 'Yes';
    const thirsty = getAnswer(answers, 'DEH-201', 'thirsty') === 'Yes';
    const lightheaded = getAnswer(answers, 'DEH-201', 'lightheaded') === 'Yes';
    const intake = getAnswer(answers, 'DEH-201', 'oral_intake');

    const darkUrine = ['Dark yellow', 'Orange', 'Brown'].includes(urineColor);
    const signCount = [darkUrine, lessUrine, thirsty, lightheaded].filter(Boolean).length;

    const alerts: string[] = [];
    if (signCount >= 2) alerts.push('Multiple dehydration signs');
    if (isCriticalIntake(intake)) alerts.push('Intake barely/none');

    if (alerts.length > 0 || signCount >= 2) {
      return {
        action: 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: alerts.join('; ') || 'Dehydration signs present',
      };
    }
    return stopResult();
  },
  evaluateFollowUp: () => stopResult(),
});

export const DIGESTIVE_MODULES: SymptomModuleDef[] = [
  NAU_203, VOM_204, DIA_205, CON_210, APP_209, MSO_208, DEH_201,
];