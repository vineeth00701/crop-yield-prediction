import type { FormErrors, PredictionInput } from '../types';

// Reasonable agronomic bounds for user-facing validation
const FIELD_BOUNDS: Record<keyof PredictionInput, [number, number]> = {
  Rainfall_mm:          [0, 3000],
  Temperature_C:        [-10, 60],
  Soil_pH:              [0, 14],
  Nitrogen_kg_ha:       [0, 500],
  Phosphorus_kg_ha:     [0, 500],
  Potassium_kg_ha:      [0, 500],
  Pesticide_Use_kg_ha:  [0, 200],
  Irrigation_hours:     [0, 1000],
  Soil_Organic_Matter:  [0, 100],
};

const FIELD_LABELS: Record<keyof PredictionInput, string> = {
  Rainfall_mm:          'Rainfall',
  Temperature_C:        'Temperature',
  Soil_pH:              'Soil pH',
  Nitrogen_kg_ha:       'Nitrogen',
  Phosphorus_kg_ha:     'Phosphorus',
  Potassium_kg_ha:      'Potassium',
  Pesticide_Use_kg_ha:  'Pesticide Use',
  Irrigation_hours:     'Irrigation Hours',
  Soil_Organic_Matter:  'Soil Organic Matter',
};

export function validateForm(values: Record<string, string>): FormErrors {
  const errors: FormErrors = {};

  for (const key of Object.keys(FIELD_BOUNDS) as (keyof PredictionInput)[]) {
    const raw = values[key];
    if (raw === undefined || raw.trim() === '') {
      errors[key] = `Please enter a valid ${FIELD_LABELS[key]} value.`;
      continue;
    }
    const num = parseFloat(raw);
    if (isNaN(num)) {
      errors[key] = `${FIELD_LABELS[key]} must be a numeric value.`;
      continue;
    }
    const [lo, hi] = FIELD_BOUNDS[key];
    if (num < lo || num > hi) {
      errors[key] = `${FIELD_LABELS[key]} must be between ${lo} and ${hi}.`;
    }
  }

  return errors;
}

export function toInputValues(raw: Record<string, string>): PredictionInput {
  return {
    Rainfall_mm:          parseFloat(raw.Rainfall_mm),
    Temperature_C:        parseFloat(raw.Temperature_C),
    Soil_pH:              parseFloat(raw.Soil_pH),
    Nitrogen_kg_ha:       parseFloat(raw.Nitrogen_kg_ha),
    Phosphorus_kg_ha:     parseFloat(raw.Phosphorus_kg_ha),
    Potassium_kg_ha:      parseFloat(raw.Potassium_kg_ha),
    Pesticide_Use_kg_ha:  parseFloat(raw.Pesticide_Use_kg_ha),
    Irrigation_hours:     parseFloat(raw.Irrigation_hours),
    Soil_Organic_Matter:  parseFloat(raw.Soil_Organic_Matter),
  };
}
