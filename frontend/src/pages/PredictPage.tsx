import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, AlertCircle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { predictYield } from '../services/api';
import { addRecord, generateId } from '../services/historyService';
import { validateForm, toInputValues } from '../utils/validation';
import type { PredictionRecord, FormErrors } from '../types';

// ── Field definitions ─────────────────────────────────────────────────────────
const FIELDS = [
  {
    key: 'Rainfall_mm',
    label: 'Rainfall (mm)',
    placeholder: '600',
    default: '600',
    hint: 'Expected range: 300–1000 mm',
    step: '0.01',
  },
  {
    key: 'Temperature_C',
    label: 'Temperature (°C)',
    placeholder: '20',
    default: '20',
    hint: 'Expected range: 10–35 °C',
    step: '0.1',
  },
  {
    key: 'Soil_pH',
    label: 'Soil pH',
    placeholder: '6.5',
    default: '6.5',
    hint: 'Expected range: 4.9–7.8',
    step: '0.01',
  },
  {
    key: 'Nitrogen_kg_ha',
    label: 'Nitrogen (kg/ha)',
    placeholder: '60',
    default: '60',
    hint: 'Typical range: 10–140 kg/ha',
    step: '0.1',
  },
  {
    key: 'Phosphorus_kg_ha',
    label: 'Phosphorus (kg/ha)',
    placeholder: '34',
    default: '34',
    hint: 'Typical range: 5–80 kg/ha',
    step: '0.1',
  },
  {
    key: 'Potassium_kg_ha',
    label: 'Potassium (kg/ha)',
    placeholder: '45',
    default: '45',
    hint: 'Typical range: 10–100 kg/ha',
    step: '0.1',
  },
  {
    key: 'Pesticide_Use_kg_ha',
    label: 'Pesticide Use (kg/ha)',
    placeholder: '10.3',
    default: '10.3',
    hint: 'Expected range: 0–25 kg/ha',
    step: '0.01',
  },
  {
    key: 'Irrigation_hours',
    label: 'Irrigation Hours',
    placeholder: '50',
    default: '50',
    hint: 'Expected range: 5–150 hours',
    step: '0.1',
  },
  {
    key: 'Soil_Organic_Matter',
    label: 'Soil Organic Matter (%)',
    placeholder: '3.45',
    default: '3.45',
    hint: 'Expected range: 0.5–7.0 %',
    step: '0.01',
  },
];

const DEFAULT_VALUES = Object.fromEntries(FIELDS.map((f) => [f.key, f.default]));

export default function PredictPage() {
  const navigate = useNavigate();
  const [values, setValues]     = useState<Record<string, string>>(DEFAULT_VALUES);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (key: string, val: string) => {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key]) setErrors((e) => { const next = { ...e }; delete next[key]; return next; });
    setApiError(null);
  };

  const handleReset = () => {
    setValues(DEFAULT_VALUES);
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setApiError(null);

    const input = toInputValues(values);
    const resp  = await predictYield(input);

    setLoading(false);
    if (resp.status === 'success' && resp.predicted_yield_kg_ha !== undefined) {
      const ts  = new Date();
      const rec: PredictionRecord = {
        id:              generateId(),
        date:            ts.toLocaleDateString(),
        time:            ts.toLocaleTimeString(),
        timestamp:       ts.toISOString(),
        predicted_yield: resp.predicted_yield_kg_ha,
        model:           resp.model_name ?? 'Gradient Boosting Regressor',
        status:          'Completed',
        inputs:          input,
      };
      addRecord(rec);
      navigate('/predict/result', {
        state: { record: rec },
      });
    } else {
      setApiError(resp.message ?? 'An unexpected error occurred during prediction.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <Leaf className="w-5 h-5 text-forest-600" />
          <h2 className="page-title mb-0">Crop Yield Prediction</h2>
        </div>
        <p className="page-subtitle">
          Enter environmental and agronomic conditions to estimate crop yield using the Gradient Boosting model.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card mb-6">
          <h3 className="section-title">Environmental &amp; Agronomic Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label
                  htmlFor={`field-${field.key}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
                <input
                  id={`field-${field.key}`}
                  type="number"
                  step={field.step}
                  placeholder={field.placeholder}
                  value={values[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={`input-field ${errors[field.key] ? 'error' : ''}`}
                />
                {errors[field.key] ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors[field.key]}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">{field.hint}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* API error */}
        {apiError && (
          <div className="flex items-start gap-3 p-4 mb-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 justify-end">
          <button
            type="button"
            id="btn-reset-form"
            onClick={handleReset}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" /> Reset Form
          </button>
          <button
            type="submit"
            id="btn-predict-yield"
            className="btn-primary flex items-center gap-2 min-w-[160px] justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Processing…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Predict Yield
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info note */}
      <div className="mt-6 card bg-forest-50 border-forest-100">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-forest-800">
            <p className="font-semibold mb-1">About the Prediction</p>
            <p className="text-forest-700 leading-relaxed">
              Predictions are generated by the Gradient Boosting Regressor trained on 800
              agricultural observations. Results are estimates and should be used as
              decision-support information only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
