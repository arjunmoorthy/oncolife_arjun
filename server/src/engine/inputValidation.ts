// ── Input Validation & Hints ──────────────────────────────────────
// Validates numeric inputs based on question ID patterns and provides
// placeholder hints for NUMBER-type questions.

export interface ValidationResult {
  valid: boolean;
  converted?: number;
  error?: string;
}

// ── Constants ─────────────────────────────────────────────────────

const TEMP_MIN_F = 90.0;
const TEMP_MAX_F = 110.0;
const TEMP_MIN_C = 32.0;
const TEMP_MAX_C = 43.0;

const SBP_MIN = 70;
const SBP_MAX = 250;
const DBP_MIN = 40;
const DBP_MAX = 150;

const HR_MIN = 40;
const HR_MAX = 200;

const O2_MIN = 70;
const O2_MAX = 100;

const BLOOD_SUGAR_MIN = 20;
const BLOOD_SUGAR_MAX = 600;

const WEIGHT_MIN_LBS = 50;
const WEIGHT_MAX_LBS = 500;

const DAYS_MAX = 365;
const TIMES_MAX = 50;

// ── Input Hints ───────────────────────────────────────────────────

const INPUT_HINTS: Record<string, string> = {
  temperature: 'e.g., 101.5 or 38.6°C',
  blood_pressure: 'e.g., 120/80',
  heart_rate: 'e.g., 88',
  oxygen: 'e.g., 98',
  blood_sugar: 'e.g., 110',
  weight: 'e.g., 165',
  days: 'e.g., 3',
  times: 'e.g., 3',
};

export function getInputHint(questionId: string): string | undefined {
  const qId = questionId.toLowerCase();
  if (qId.includes('temp')) return INPUT_HINTS.temperature;
  if (qId.includes('bp') || qId.includes('blood_pressure') || qId.includes('pressure')) return INPUT_HINTS.blood_pressure;
  if (qId.includes('hr') || qId.includes('heart_rate') || qId.includes('pulse')) return INPUT_HINTS.heart_rate;
  if (qId.includes('o2') || qId.includes('oxygen') || qId.includes('spo2') || qId.includes('sat')) return INPUT_HINTS.oxygen;
  if (qId.includes('sugar') || qId.includes('glucose')) return INPUT_HINTS.blood_sugar;
  if (qId.includes('weight') || qId.includes('lbs')) return INPUT_HINTS.weight;
  if (qId.includes('days') || qId.includes('day') || qId.includes('duration')) return INPUT_HINTS.days;
  if (qId.includes('times') || qId.includes('episodes') || qId.includes('frequency') || qId.includes('loose_stools')) return INPUT_HINTS.times;
  return undefined;
}

// ── Validators ────────────────────────────────────────────────────

function validateTemperature(value: string): ValidationResult {
  const num = parseFloat(value);
  if (isNaN(num)) return { valid: false, error: 'Please enter a valid number (e.g., 101.5 or 38.6°C).' };
  // Detect Celsius and auto-convert
  if (num >= TEMP_MIN_C && num <= TEMP_MAX_C) {
    const converted = num * 9 / 5 + 32;
    return { valid: true, converted: parseFloat(converted.toFixed(1)) };
  }
  if (num < TEMP_MIN_F) return { valid: false, error: `Temperature ${num}°F seems too low. Please verify and re-enter.` };
  if (num > TEMP_MAX_F) return { valid: false, error: `Temperature ${num}°F seems too high. Please verify and re-enter.` };
  return { valid: true, converted: num };
}

function validateBloodPressure(value: string): ValidationResult {
  const match = value.trim().match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
  if (!match) return { valid: false, error: 'Please enter blood pressure as systolic/diastolic (e.g., 120/80).' };
  const systolic = parseInt(match[1], 10);
  const diastolic = parseInt(match[2], 10);
  const errors: string[] = [];
  if (systolic < SBP_MIN || systolic > SBP_MAX) errors.push(`Systolic (${systolic}) should be between ${SBP_MIN}-${SBP_MAX}`);
  if (diastolic < DBP_MIN || diastolic > DBP_MAX) errors.push(`Diastolic (${diastolic}) should be between ${DBP_MIN}-${DBP_MAX}`);
  if (systolic <= diastolic) errors.push('Systolic should be higher than diastolic');
  if (errors.length > 0) return { valid: false, error: `Please verify: ${errors.join('; ')}` };
  // Store as the string "systolic/diastolic" for downstream use
  return { valid: true, converted: systolic };
}

function validateRange(value: string, min: number, max: number, label: string, unit: string): ValidationResult {
  const num = parseFloat(value);
  if (isNaN(num)) return { valid: false, error: `Please enter a valid number for ${label}.` };
  const intVal = Math.round(num);
  if (intVal < min) return { valid: false, error: `${label} ${intVal}${unit} seems too low. Expected range: ${min}-${max}${unit}.` };
  if (intVal > max) return { valid: false, error: `${label} ${intVal}${unit} seems too high. Expected range: ${min}-${max}${unit}.` };
  return { valid: true, converted: num };
}

export function validateNumericInput(questionId: string, value: string): ValidationResult {
  const qId = questionId.toLowerCase();
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Please enter a value.' };

  if (qId.includes('temp')) return validateTemperature(trimmed);
  if (qId.includes('bp') || qId.includes('blood_pressure') || qId.includes('pressure')) return validateBloodPressure(trimmed);
  if (qId.includes('hr') || qId.includes('heart_rate') || qId.includes('pulse')) return validateRange(trimmed, HR_MIN, HR_MAX, 'Heart rate', ' BPM');
  if (qId.includes('o2') || qId.includes('oxygen') || qId.includes('spo2') || qId.includes('sat')) return validateRange(trimmed.replace('%', ''), O2_MIN, O2_MAX, 'SpO2', '%');
  if (qId.includes('sugar') || qId.includes('glucose')) return validateRange(trimmed, BLOOD_SUGAR_MIN, BLOOD_SUGAR_MAX, 'Blood sugar', ' mg/dL');
  if (qId.includes('weight') || qId.includes('lbs')) return validateRange(trimmed, WEIGHT_MIN_LBS, WEIGHT_MAX_LBS, 'Weight', ' lbs');
  if (qId.includes('days') || qId.includes('day') || qId.includes('duration')) return validateRange(trimmed, 0, DAYS_MAX, 'Days', '');
  if (qId.includes('times') || qId.includes('episodes') || qId.includes('frequency') || qId.includes('loose_stools')) return validateRange(trimmed, 0, TIMES_MAX, 'Value', '');

  // Generic number fallback
  const num = parseFloat(trimmed);
  if (isNaN(num)) return { valid: false, error: 'Please enter a valid number.' };
  return { valid: true, converted: num };
}

