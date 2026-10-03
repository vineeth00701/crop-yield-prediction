import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, Layers, Cpu, TrendingUp, Activity,
  BarChart2, ChevronRight, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { fetchMetrics } from '../services/api';
import { getHistory } from '../services/historyService';
import type { MetricsResponse } from '../types';

// Reported feature importances from project specification
const FEATURE_IMPORTANCES = [
  { name: 'Pesticide Use',       key: 'Pesticide_Use_kg_ha', value: 31.1 },
  { name: 'Soil Organic Matter', key: 'Soil_Organic_Matter',  value: 14.6 },
  { name: 'Temperature',         key: 'Temperature_C',        value: 13.2 },
  { name: 'Nitrogen',            key: 'Nitrogen_kg_ha',       value: 10.9 },
  { name: 'Rainfall',            key: 'Rainfall_mm',          value: 8.3  },
  { name: 'Phosphorus',          key: 'Phosphorus_kg_ha',     value: 5.7  },
  { name: 'Soil pH',             key: 'Soil_pH',              value: 4.9  },
  { name: 'Irrigation',          key: 'Irrigation_hours',     value: 4.7  },
];

const COLORS = [
  '#166534','#16a34a','#22c55e','#4ade80','#86efac',
  '#bbf7d0','#dcfce7','#d4a017',
];

function MetricCard({
  icon: Icon, label, value, sub, color = 'forest',
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  const bg = color === 'amber' ? 'bg-amber-50' : 'bg-forest-50';
  const ic = color === 'amber' ? 'text-amber-600' : 'text-forest-700';
  const val = color === 'amber' ? 'text-amber-700' : 'text-forest-700';
  return (
    <div className="metric-card">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${ic}`} />
      </div>
      <div className={`text-2xl font-extrabold ${val}`}>{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const history = getHistory();

  useEffect(() => {
    fetchMetrics().then((m) => {
      setMetrics(m);
      setLoading(false);
    });
  }, []);

  const gbMetrics = metrics?.data?.gradient_boosting;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="page-header">
        <h2 className="page-title">Crop Intelligence Dashboard</h2>
        <p className="page-subtitle">
          Analyze environmental conditions and estimate agricultural productivity.
        </p>
      </div>

      {/* ── Metric cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Database}  label="Dataset Observations"  value="800"              sub="800 agricultural records" />
        <MetricCard icon={Layers}    label="Environmental Features" value="9"               sub="Input variables"          />
        <MetricCard icon={Cpu}       label="Prediction Model"      value="Grad. Boosting"   sub="Primary estimator"       />
        <MetricCard
          icon={Activity}
          label="Reported R²"
          value={loading ? '…' : (gbMetrics ? gbMetrics.r2.toFixed(4) : '0.5161')}
          sub="Reported Evaluation Result"
          color="amber"
        />
      </div>

      {/* ── Alert if backend down ─────────────────────────────────────── */}
      {!loading && !metrics && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Backend connection unavailable. Displaying reported project results.
            Start the Flask server with <code className="bg-amber-100 px-1 rounded">python backend/app.py</code>.
          </span>
        </div>
      )}

      {/* ── Middle section ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Importance Chart */}
        <div className="card lg:col-span-2">
          <h3 className="section-title flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-forest-600" />
            Feature Importance — Gradient Boosting
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Relative contribution of each environmental factor to model predictions.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={FEATURE_IMPORTANCES} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Importance']} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {FEATURE_IMPORTANCES.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Model Performance Summary */}
        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="section-title flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-forest-600" />
              Model Performance
            </h3>
            <div className="space-y-3">
              {[
                { label: 'R² Score',   value: loading ? '…' : (gbMetrics ? gbMetrics.r2.toFixed(4) : '0.5161') },
                { label: 'RMSE',       value: loading ? '…' : (gbMetrics ? `${gbMetrics.rmse.toFixed(2)} kg/ha` : '282.28 kg/ha') },
                { label: 'MAE',        value: loading ? '…' : (gbMetrics ? `${gbMetrics.mae.toFixed(2)} kg/ha`  : '237.45 kg/ha') },
                { label: 'Algorithm',  value: 'Gradient Boosting' },
                { label: 'Training',   value: '80% / 20% split' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/model')}
            className="btn-secondary mt-4 text-sm flex items-center justify-center gap-1"
          >
            Full Evaluation <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Recent Predictions ────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">Recent Predictions</h3>
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-forest-600 hover:text-forest-800 font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No predictions yet.</p>
            <button onClick={() => navigate('/predict')} className="btn-primary mt-3 text-sm px-4 py-2">
              Make First Prediction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Date &amp; Time</th>
                  <th className="pb-2 font-medium">Predicted Yield</th>
                  <th className="pb-2 font-medium">Model</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 text-gray-600">{r.date} {r.time}</td>
                    <td className="py-2.5 font-semibold text-forest-700">{r.predicted_yield.toFixed(2)} kg/ha</td>
                    <td className="py-2.5 text-gray-500 text-xs">{r.model}</td>
                    <td className="py-2.5"><span className="badge-success text-xs">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Action ──────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          id="btn-quick-prediction"
          onClick={() => navigate('/predict')}
          className="btn-primary flex items-center gap-2"
        >
          Quick Prediction <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
