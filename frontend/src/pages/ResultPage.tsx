import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, RefreshCw, BarChart2, Leaf,
  Calendar, Clock, Cpu, Droplets, Thermometer, FlaskConical,
} from 'lucide-react';
import type { PredictionRecord } from '../types';

const FIELD_LABELS: Record<string, string> = {
  Rainfall_mm:          'Rainfall (mm)',
  Temperature_C:        'Temperature (°C)',
  Soil_pH:              'Soil pH',
  Nitrogen_kg_ha:       'Nitrogen (kg/ha)',
  Phosphorus_kg_ha:     'Phosphorus (kg/ha)',
  Potassium_kg_ha:      'Potassium (kg/ha)',
  Pesticide_Use_kg_ha:  'Pesticide Use (kg/ha)',
  Irrigation_hours:     'Irrigation Hours',
  Soil_Organic_Matter:  'Soil Organic Matter (%)',
};

const ICONS: Record<string, React.ElementType> = {
  Rainfall_mm:          Droplets,
  Temperature_C:        Thermometer,
  Soil_pH:              FlaskConical,
  Nitrogen_kg_ha:       Leaf,
  Phosphorus_kg_ha:     Leaf,
  Potassium_kg_ha:      Leaf,
  Pesticide_Use_kg_ha:  FlaskConical,
  Irrigation_hours:     Droplets,
  Soil_Organic_Matter:  Leaf,
};

export default function ResultPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const record    = location.state?.record as PredictionRecord | undefined;

  if (!record) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">No prediction result found.</p>
        <button onClick={() => navigate('/predict')} className="btn-primary">
          Make a Prediction
        </button>
      </div>
    );
  }

  const ts = new Date(record.timestamp);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* ── Success header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 bg-forest-50 border border-forest-200 rounded-2xl">
        <CheckCircle2 className="w-6 h-6 text-forest-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-forest-800">Prediction Completed Successfully</p>
          <p className="text-sm text-forest-600">Gradient Boosting Regressor · {ts.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Main result ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero text-white p-10 text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <p className="text-green-200 text-sm font-medium uppercase tracking-wider mb-2">
            Estimated Crop Yield
          </p>
          <div className="text-6xl md:text-7xl font-extrabold mb-1">
            {record.predicted_yield.toFixed(2)}
          </div>
          <div className="text-green-300 text-xl font-light">kg / ha</div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <Cpu className="w-4 h-4" />
              <span>{record.model}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>{record.status}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>{record.date}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              <span>{record.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environmental input summary */}
        <div className="card">
          <h3 className="section-title">Environmental Input Summary</h3>
          <div className="space-y-2">
            {Object.entries(record.inputs).map(([key, val]) => {
              const Icon = ICONS[key] ?? Leaf;
              return (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-forest-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-forest-600" />
                    </div>
                    <span className="text-sm text-gray-600">{FIELD_LABELS[key]}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prediction information */}
        <div className="card">
          <h3 className="section-title">Prediction Information</h3>
          <div className="space-y-3">
            {[
              { label: 'Model',           value: record.model               },
              { label: 'Predicted Yield', value: `${record.predicted_yield.toFixed(2)} kg/ha` },
              { label: 'Date',            value: record.date                },
              { label: 'Time',            value: record.time                },
              { label: 'Status',          value: record.status              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-700 leading-relaxed">
              This is an estimated yield based on the trained model. Results should be
              used as decision-support information and do not constitute a guaranteed
              agricultural outcome.
            </p>
          </div>
        </div>
      </div>

      {/* ── Action buttons ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          id="btn-new-prediction"
          onClick={() => navigate('/predict')}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> New Prediction
        </button>
        <button
          id="btn-view-analysis"
          onClick={() => navigate('/analysis')}
          className="btn-primary flex items-center gap-2"
        >
          <BarChart2 className="w-4 h-4" /> View Analysis
        </button>
      </div>
    </div>
  );
}
