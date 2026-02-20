import { SymptomModuleDef } from '../types';
import { DIGESTIVE_MODULES, NAU_203, VOM_204, DIA_205, CON_210, APP_209, MSO_208, DEH_201 } from './digestive';
import { PAIN_NERVE_MODULES, PAI_213, NEU_216, HEA_210, ABD_211, LEG_208, URG_114, JMP_212 } from './painNerve';
import { SYSTEMIC_MODULES, FEV_202, FAT_206, COU_215, URI_211 } from './systemic';
import { SKIN_EXTERNAL_MODULES, SKI_212, SWE_214, EYE_207 } from './skinExternal';
import { HIDDEN_MODULES, NEU_304 } from './hidden';

// ── Symptom Registry ─────────────────────────────────────────────

const ALL_MODULES: SymptomModuleDef[] = [
  ...DIGESTIVE_MODULES,
  ...PAIN_NERVE_MODULES,
  ...SYSTEMIC_MODULES,
  ...SKIN_EXTERNAL_MODULES,
  ...HIDDEN_MODULES,
];

const SYMPTOM_REGISTRY = new Map<string, SymptomModuleDef>();
for (const mod of ALL_MODULES) {
  SYMPTOM_REGISTRY.set(mod.symptomId, mod);
}

export function getSymptomModule(symptomId: string): SymptomModuleDef | undefined {
  return SYMPTOM_REGISTRY.get(symptomId);
}

export function getAllSymptomModules(): SymptomModuleDef[] {
  return ALL_MODULES;
}

/**
 * Returns only the user-selectable (non-hidden) symptom modules.
 */
export function getSelectableSymptomModules(): SymptomModuleDef[] {
  return ALL_MODULES.filter(m => !m.isHidden);
}

// Re-export everything
export {
  DIGESTIVE_MODULES,
  PAIN_NERVE_MODULES,
  SYSTEMIC_MODULES,
  SKIN_EXTERNAL_MODULES,
  HIDDEN_MODULES,
  // Individual modules
  NAU_203, VOM_204, DIA_205, CON_210, APP_209, MSO_208, DEH_201,
  PAI_213, NEU_216, HEA_210, ABD_211, LEG_208, URG_114, JMP_212,
  FEV_202, FAT_206, COU_215, URI_211,
  SKI_212, SWE_214, EYE_207,
  NEU_304,
};

