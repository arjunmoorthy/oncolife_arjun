import { TriageLevel } from '@oncolife/shared';
import { SymptomModuleDef } from '../types';
import {
  SEVERITY_OPTIONS,
  PAIN_LOCATIONS,
  HEADACHE_NEURO_SYMPTOMS,
  HEADACHE_ONSET,
  MEDS_NEUROPATHY,
  DEHYDRATION_SIGNS,
  YES_NO_OPTIONS,
  PAIN_DESCRIPTION,
  JOINT_PAIN_TYPE,
} from '../optionSets';
import {
  defineSymptom,
  getAnswer,
  parseSeverity,
  parseDays,
  hasDehydrationSigns,
  continueResult,
  stopResult,
  branchResult,
  emergencyResult,
  medsTaken,
} from './base';

// ── PAI-213 — Pain (ROUTER) ───────────────────────────────────────

export const PAI_213: SymptomModuleDef = defineSymptom({
  symptomId: 'PAI-213',
  name: 'Pain',
  isHidden: false,
  screeningQuestions: [
    { id: 'location', text: 'Where does it hurt?', type: 'MULTISELECT', options: PAIN_LOCATIONS },
    {
      id: 'location_other',
      text: 'Please describe where else it hurts:',
      type: 'TEXT',
      condition: (answers) => {
        const loc = getAnswer(answers, 'PAI-213', 'location');
        return Array.isArray(loc) && loc.includes('Other');
      },
    },
    { id: 'severity', text: 'Rate your pain:', type: 'CHOICE', options: SEVERITY_OPTIONS },
    { id: 'daily_activities', text: 'Does pain interfere with your daily activities?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'temperature', text: 'What is your temperature?', type: 'NUMBER' },
    { id: 'controlled', text: 'Is your pain controlled with your usual medications?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    const locations: string[] = getAnswer(answers, 'PAI-213', 'location') || [];
    if (locations.includes('Chest')) {
      return branchResult(['URG-102'], TriageLevel.CALL_911);
    }
    const branches: string[] = [];
    const locationMap: Record<string, string> = {
      'Port/IV Site': 'URG-114',
      'Head': 'HEA-210',
      'Leg/Calf': 'LEG-208',
      'Abdomen': 'ABD-211',
      'Urinary/Pelvic': 'URI-211',
      'Joints/Muscles': 'JMP-212',
      'General Aches': 'JMP-212',
      'Nerve Burning/Tingling': 'NEU-216',
      'Mouth/Throat': 'MSO-208',
    };
    for (const loc of locations) {
      const target = locationMap[loc];
      if (target && !branches.includes(target)) {
        branches.push(target);
      }
    }
    if (branches.length > 0) {
      return branchResult(branches, TriageLevel.NONE);
    }
    return stopResult();
  },
  evaluateFollowUp: () => stopResult(),
});

// ── NEU-216 — Neuropathy ──────────────────────────────────────────

export const NEU_216: SymptomModuleDef = defineSymptom({
  symptomId: 'NEU-216',
  name: 'Neuropathy',
  isHidden: false,
  screeningQuestions: [
    { id: 'onset', text: 'When did the neuropathy symptoms start?', type: 'TEXT' },
    { id: 'location', text: 'Where are you experiencing neuropathy?', type: 'TEXT' },
    { id: 'affects_function', text: 'Does the neuropathy affect your ability to function or perform daily tasks?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'severity', text: 'Rate your neuropathy severity:', type: 'CHOICE', options: SEVERITY_OPTIONS },
    { id: 'daily_activities', text: 'Does the neuropathy interfere with your daily activities?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [
    { id: 'fine_motor', text: 'Do you have trouble with fine motor tasks?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'getting_worse', text: 'Is the neuropathy getting worse?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'balance', text: 'Do you have trouble with balance or walking?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'meds', text: 'What medications are you taking for neuropathy?', type: 'CHOICE', options: MEDS_NEUROPATHY },
    {
      id: 'meds_other',
      text: 'What other medication?',
      type: 'TEXT',
      condition: (answers) => getAnswer(answers, 'NEU-216', 'meds') === 'Other',
    },
    {
      id: 'meds_helping',
      text: 'Are the medications helping?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
      condition: (answers) => medsTaken(getAnswer(answers, 'NEU-216', 'meds')),
    },
  ],
  evaluateScreening: (answers) => {
    const sev = parseSeverity(getAnswer(answers, 'NEU-216', 'severity'));
    const affectsFunction = getAnswer(answers, 'NEU-216', 'affects_function') === 'Yes';
    const adl = getAnswer(answers, 'NEU-216', 'daily_activities') === 'Yes';
    const alerts: string[] = [];
    if (sev === 'SEVERE') alerts.push('Severe neuropathy');
    if (affectsFunction || adl) alerts.push('Affects function/ADLs');
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



// ── HEA-210 — Headache (HIDDEN) ───────────────────────────────────

export const HEA_210: SymptomModuleDef = defineSymptom({
  symptomId: 'HEA-210',
  name: 'Headache',
  isHidden: true,
  screeningQuestions: [
    { id: 'worst_ever', text: 'Is this the worst headache you\'ve ever had, or did it start suddenly and very strongly?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'neuro_symptoms', text: 'Do you have any of these symptoms?', type: 'MULTISELECT', options: HEADACHE_NEURO_SYMPTOMS },
    { id: 'severity', text: 'Rate your headache:', type: 'CHOICE', options: SEVERITY_OPTIONS },
    { id: 'daily_activities', text: 'Does the headache interfere with daily activities?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [
    { id: 'onset', text: 'When did this headache start?', type: 'CHOICE', options: HEADACHE_ONSET },
    { id: 'duration', text: 'How long has the headache lasted?', type: 'TEXT' },
    { id: 'meds_taken', text: 'Have you taken any medications for the headache?', type: 'YES_NO', options: YES_NO_OPTIONS },
    {
      id: 'meds_helped',
      text: 'Did the medications help?',
      type: 'YES_NO',
      options: YES_NO_OPTIONS,
      condition: (answers) => getAnswer(answers, 'HEA-210', 'meds_taken') === 'Yes',
    },
    { id: 'fever', text: 'Do you have a fever?', type: 'YES_NO', options: YES_NO_OPTIONS },
    {
      id: 'temperature',
      text: 'What is your temperature?',
      type: 'NUMBER',
      condition: (answers) => getAnswer(answers, 'HEA-210', 'fever') === 'Yes',
    },
  ],
  evaluateScreening: (answers) => {
    const worstEver = getAnswer(answers, 'HEA-210', 'worst_ever') === 'Yes';
    const neuroSyms: string[] = getAnswer(answers, 'HEA-210', 'neuro_symptoms') || [];
    const hasNeuro = neuroSyms.length > 0 && !neuroSyms.includes('None');
    if (worstEver || hasNeuro) {
      return emergencyResult('Worst headache ever or neurological symptoms — call 911.');
    }
    return continueResult();
  },
  evaluateFollowUp: (answers) => {
    const onset = getAnswer(answers, 'HEA-210', 'onset');
    const fever = getAnswer(answers, 'HEA-210', 'fever') === 'Yes';
    const sev = parseSeverity(getAnswer(answers, 'HEA-210', 'severity'));
    if (onset === 'Sudden') {
      return emergencyResult('Sudden onset headache — call 911.');
    }
    const branches: string[] = [];
    if (fever) branches.push('FEV-202');
    if (sev === 'SEVERE' || sev === 'MODERATE') {
      return {
        action: branches.length > 0 ? 'branch' as const : 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: 'Severe or moderate headache',
        branchTo: branches.length > 0 ? branches : undefined,
        severity: sev,
      };
    }
    return branches.length > 0 ? branchResult(branches) : stopResult();
  },
});

// ── ABD-211 — Abdominal Pain (HIDDEN) ─────────────────────────────

export const ABD_211: SymptomModuleDef = defineSymptom({
  symptomId: 'ABD-211',
  name: 'Abdominal Pain',
  isHidden: true,
  screeningQuestions: [
    { id: 'severity', text: 'Rate your abdominal pain:', type: 'CHOICE', options: SEVERITY_OPTIONS },
    { id: 'daily_activities', text: 'Does the pain interfere with your daily activities?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'temperature', text: 'What is your temperature?', type: 'NUMBER' },
    { id: 'days_no_bm', text: 'How many days since your last bowel movement?', type: 'NUMBER' },
    { id: 'passing_gas', text: 'Are you able to pass gas?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'blood_stool', text: 'Is there blood in your stool?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [
    { id: 'vomiting', text: 'Are you vomiting?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'blood_stool_fu', text: 'Is there blood in your stool?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'dehydration', text: 'Any signs of dehydration?', type: 'MULTISELECT', options: DEHYDRATION_SIGNS },
    { id: 'last_bm', text: 'When was your last bowel movement?', type: 'CHOICE', options: ['Today', 'Yesterday', '2+ days ago'] },
  ],
  evaluateScreening: (answers) => {
    const sev = parseSeverity(getAnswer(answers, 'ABD-211', 'severity'));
    const temp = parseDays(getAnswer(answers, 'ABD-211', 'temperature'));
    const daysNoBm = parseDays(getAnswer(answers, 'ABD-211', 'days_no_bm'));
    const passingGas = getAnswer(answers, 'ABD-211', 'passing_gas');
    const bloodStool = getAnswer(answers, 'ABD-211', 'blood_stool') === 'Yes';
    const alerts: string[] = [];
    if (sev === 'MODERATE' || sev === 'SEVERE') alerts.push('Moderate/severe abdominal pain');
    if (daysNoBm >= 3 && passingGas === 'No') alerts.push('No BM ≥3 days, not passing gas');
    if (temp >= 100.3) alerts.push('Fever >100.3°F');
    if (bloodStool) alerts.push('Blood in stool');
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
    const vomiting = getAnswer(answers, 'ABD-211', 'vomiting') === 'Yes';
    const dehydration = getAnswer(answers, 'ABD-211', 'dehydration');
    const lastBm = getAnswer(answers, 'ABD-211', 'last_bm');
    const branches: string[] = [];
    if (vomiting) branches.push('VOM-204');
    if (hasDehydrationSigns(dehydration)) branches.push('DEH-201');
    if (lastBm === '2+ days ago') branches.push('CON-210');
    return branches.length > 0 ? branchResult(branches) : stopResult();
  },
});

// ── LEG-208 — Leg/Calf Pain (HIDDEN) ──────────────────────────────

export const LEG_208: SymptomModuleDef = defineSymptom({
  symptomId: 'LEG-208',
  name: 'Leg/Calf Pain',
  isHidden: true,
  screeningQuestions: [
    { id: 'asymmetric', text: 'Is one leg more swollen, red, or warm than the other?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'worse_walking', text: 'Is the pain worse with walking or pressing on the calf?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'severity', text: 'Rate your pain:', type: 'CHOICE', options: SEVERITY_OPTIONS },
    { id: 'walking_difficulty', text: 'Does the pain interfere with walking?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  followUpQuestions: [
    { id: 'immobility', text: 'Have you had recent immobility (long travel, bed rest)?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'clot_history', text: 'Do you have a history of blood clots?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'sob', text: 'Are you experiencing shortness of breath?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  evaluateScreening: (answers) => {
    const asymmetric = getAnswer(answers, 'LEG-208', 'asymmetric') === 'Yes';
    const worseWalking = getAnswer(answers, 'LEG-208', 'worse_walking') === 'Yes';
    if (asymmetric || worseWalking) {
      return emergencyResult('Asymmetric leg swelling/redness or pain with walking — DVT concern. Call 911.');
    }
    return continueResult();
  },
  evaluateFollowUp: (answers) => {
    const sob = getAnswer(answers, 'LEG-208', 'sob') === 'Yes';
    if (sob) {
      return emergencyResult('Shortness of breath with leg pain — PE concern. Call 911.');
    }
    const immobility = getAnswer(answers, 'LEG-208', 'immobility') === 'Yes';
    const clotHistory = getAnswer(answers, 'LEG-208', 'clot_history') === 'Yes';
    if (immobility || clotHistory) {
      return {
        action: 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: immobility ? 'Recent immobility with leg pain' : 'History of blood clots with leg pain',
      };
    }
    return stopResult();
  },
});

// ── URG-114 — Port/IV Site Pain (HIDDEN) ──────────────────────────

export const URG_114: SymptomModuleDef = defineSymptom({
  symptomId: 'URG-114',
  name: 'Port/IV Site Pain',
  isHidden: true,
  screeningQuestions: [
    { id: 'redness', text: 'Is there new redness around the port/IV site?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'drainage', text: 'Is there any drainage from the site?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'chills', text: 'Are you having chills?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'temperature', text: 'What is your temperature?', type: 'NUMBER' },
  ],
  followUpQuestions: [],
  evaluateScreening: (answers) => {
    const redness = getAnswer(answers, 'URG-114', 'redness') === 'Yes';
    const drainage = getAnswer(answers, 'URG-114', 'drainage') === 'Yes';
    const chills = getAnswer(answers, 'URG-114', 'chills') === 'Yes';
    const temp = parseDays(getAnswer(answers, 'URG-114', 'temperature'));
    const hasFever = temp >= 100.3;
    const hasSign = redness || drainage || chills;
    if (hasSign && hasFever) {
      return emergencyResult('Port/IV site infection signs WITH fever ≥100.3°F — call 911.');
    }
    if (hasSign) {
      return {
        action: 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: 'Port/IV site concern: ' + [redness && 'redness', drainage && 'drainage', chills && 'chills'].filter(Boolean).join(', '),
      };
    }
    return stopResult();
  },
  evaluateFollowUp: () => stopResult(),
});

// ── JMP-212 — Joint/Muscle/General Pain (HIDDEN) ──────────────────

export const JMP_212: SymptomModuleDef = defineSymptom({
  symptomId: 'JMP-212',
  name: 'Joint/Muscle/General Pain',
  isHidden: true,
  screeningQuestions: [
    { id: 'pain_type', text: 'What type of pain are you experiencing?', type: 'CHOICE', options: JOINT_PAIN_TYPE },
    { id: 'hard_to_move', text: 'Is it hard to move or sleep because of the pain?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'severity', text: 'Rate your pain:', type: 'CHOICE', options: SEVERITY_OPTIONS },
    { id: 'daily_activities', text: 'Does the pain interfere with your daily activities?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'better_rest', text: 'Does the pain get better with rest or over-the-counter medications?', type: 'YES_NO', options: YES_NO_OPTIONS },
    { id: 'temperature', text: 'What is your temperature?', type: 'NUMBER' },
  ],
  followUpQuestions: [
    { id: 'description', text: 'How would you describe the pain?', type: 'CHOICE', options: PAIN_DESCRIPTION },
    { id: 'duration', text: 'How long have you had this pain?', type: 'TEXT' },
    { id: 'controlled', text: 'Is the pain controlled with your usual medications?', type: 'YES_NO', options: YES_NO_OPTIONS },
  ],
  evaluateScreening: (answers) => {
    const sev = parseSeverity(getAnswer(answers, 'JMP-212', 'severity'));
    const hardToMove = getAnswer(answers, 'JMP-212', 'hard_to_move') === 'Yes';
    const adl = getAnswer(answers, 'JMP-212', 'daily_activities') === 'Yes';
    const betterRest = getAnswer(answers, 'JMP-212', 'better_rest');
    const temp = parseDays(getAnswer(answers, 'JMP-212', 'temperature'));
    const alerts: string[] = [];
    if (sev === 'SEVERE') alerts.push('Severe pain');
    if (hardToMove) alerts.push('Hard to move/sleep');
    if (adl) alerts.push('ADL interference');
    if (betterRest === 'No') alerts.push('Not better with rest/OTC');
    if (temp >= 100.4) alerts.push('Fever ≥100.4°F');
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
    const controlled = getAnswer(answers, 'JMP-212', 'controlled');
    if (controlled === 'No') {
      return {
        action: 'stop' as const,
        triageLevel: TriageLevel.NOTIFY_CARE_TEAM,
        alertMessage: 'Pain not controlled with usual medications',
      };
    }
    return stopResult();
  },
});

export const PAIN_NERVE_MODULES: SymptomModuleDef[] = [
  PAI_213, NEU_216, HEA_210, ABD_211, LEG_208, URG_114, JMP_212,
];