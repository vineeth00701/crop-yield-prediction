import { useEffect, useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts';
import { fetchMetrics, fetchEvalData } from '../services/api';
import type { MetricsResponse, EvalData } from '../types';

// Project-reported feature importances
const FEATURE_IMPORTANCES = [
  { name: 'Pesticide Use',       value: 31.1, color: '#166534' },
  { name: 'Soil Organic Matter', value: 14.6, color: '#16a34a' },
  { name: 'Temperature',         value: 13.2, color: '#22c55e' },
  { name: 'Nitrogen',            value: 10.9, color: '#4ade80' },
  { name: 'Rainfall',            value:  8.3, color: '#86efac' },
  { name: 'Phosphorus',          value:  5.7, color: '#a3e635' },
  { name: 'Soil pH',             value:  4.9, color: '#fbbf24' },
  { name: 'Irrigation',          value:  4.7, color: '#f59e0b' },
  { name: 'Potassium',           value:  6.6, color: '#d97706' }, // remainder
];

function MetricPill({
  label, value, sub, highlight,
}: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`card text-center ${highlight ? 'border-forest-300 bg-forest-50' : ''}`}>
      <div className={`text-2xl font-extrabold ${highlight ? 'text-forest-700' : 'text-gray-800'}`}>
        {value}
      </div>
      <div className="text-sm font-medium text-gray-600 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function ModelPage() {
  const [metrics, setMetrics]   = useState<MetricsResponse | null>(null);
  const [evalData, setEvalData] = useState<EvalData | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([fetchMetrics(), fetchEvalData()]).then(([m, e]) => {
      setMetrics(m);
      setEvalData(e?.status === 'success' ? e.data : null);
      setLoading(false);
    });
  }, []);

  const gb = metrics?.data?.gradient_boosting;
  const rf = metrics?.data?.random_forest;

  // Scatter data: actual vs predicted
  const scatterData = evalData
    ? evalData.y_test.map((y, i) => ({
        actual:    Math.round(y),
        predicted: Math.round(evalData.y_pred_gb[i]),
      }))
    : [];

  // Residual histogram
  const residualData = (() => {
    if (!evalData) return [];
    const res = evalData.residuals;
    const bins = 15;
    const min = Math.min(...res), max = Math.max(...res);
    const width = (max - min) / bins;
    const counts = new Array(bins).fill(0);
    res.forEach((r) => {
      const i = Math.min(Math.floor((r - min) / width), bins - 1);
      counts[i]++;
    });
    return counts.map((c, i) => ({
      bin:   `${Math.round(min + i * width)}`,
      count: c,
    }));
  })();

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="page-header">
        <h2 className="page-title">Machine Learning Model Evaluation</h2>
        <p className="page-subtitle">
          Performance comparison between Gradient Boosting Regressor (primary) and Random Forest Regressor.
        </p>
      </div>

      {!loading && !metrics && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          Backend unavailable. Showing reported project metrics.
        </div>
      )}

      {/* ── Primary model metrics ──────────────────────────────────────── */}
      <div>
        <h3 className="section-title">Gradient Boosting Regressor — Primary Model</h3>
        <div className="grid grid-cols-3 gap-4">
          <MetricPill
            label="R² Score"
            value={loading ? '…' : (gb ? gb.r2.toFixed(4) : '0.5161')}
            sub="Coefficient of determination"
            highlight
          />
          <MetricPill
            label="RMSE"
            value={loading ? '…' : (gb ? `${gb.rmse.toFixed(2)}` : '282.28')}
            sub="Root Mean Squared Error (kg/ha)"
          />
          <MetricPill
            label="MAE"
            value={loading ? '…' : (gb ? `${gb.mae.toFixed(2)}` : '237.45')}
            sub="Mean Absolute Error (kg/ha)"
          />
        </div>
      </div>

      {/* ── Comparison model metrics ───────────────────────────────────── */}
      <div>
        <h3 className="section-title">Random Forest Regressor — Comparison Model</h3>
        <div className="grid grid-cols-3 gap-4">
          <MetricPill
            label="R² Score"
            value={loading ? '…' : (rf ? rf.r2.toFixed(4) : '—')}
            sub="Coefficient of determination"
          />
          <MetricPill
            label="RMSE"
            value={loading ? '…' : (rf ? `${rf.rmse.toFixed(2)}` : '—')}
            sub="Root Mean Squared Error (kg/ha)"
          />
          <MetricPill
            label="MAE"
            value={loading ? '…' : (rf ? `${rf.mae.toFixed(2)}` : '—')}
            sub="Mean Absolute Error (kg/ha)"
          />
        </div>
      </div>

      {/* ── Feature Importance ────────────────────────────────────────── */}
      <div className="card">
        <h3 className="section-title">Feature Importance — Gradient Boosting</h3>
        <p className="text-xs text-gray-400 mb-1">
          Reported relative contribution of each feature to model predictions.
        </p>
        <div className="flex items-start gap-2 text-xs text-gray-500 mb-4">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-400" />
          Feature importance reflects predictive influence within this model and does not imply causal relationship.
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={FEATURE_IMPORTANCES} layout="vertical" margin={{ left: 10, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 35]} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => [`${v}%`, 'Importance']} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, formatter: (v: any) => `${v}%` }}>
              {FEATURE_IMPORTANCES.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Actual vs Predicted ────────────────────────────────────────── */}
      <div className="card">
        <h3 className="section-title">Actual vs Predicted Yield</h3>
        {!evalData && !loading && (
          <p className="text-sm text-gray-400 py-6 text-center">
            Evaluation data unavailable. Please start the backend server.
          </p>
        )}
        {loading && (
          <p className="text-sm text-gray-400 py-6 text-center">Loading evaluation data…</p>
        )}
        {evalData && scatterData.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-3">
              Each point represents one test observation. Points near the diagonal indicate accurate predictions.
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="actual"
                  name="Actual Yield"
                  label={{ value: 'Actual (kg/ha)', position: 'insideBottom', offset: -5, fontSize: 11 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="predicted"
                  name="Predicted Yield"
                  label={{ value: 'Predicted (kg/ha)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(v: any, n: any) => [`${v} kg/ha`, n === 'actual' ? 'Actual' : 'Predicted']}
                />
                <ReferenceLine
                  segment={[
                    { x: Math.min(...scatterData.map((d) => d.actual)), y: Math.min(...scatterData.map((d) => d.actual)) },
                    { x: Math.max(...scatterData.map((d) => d.actual)), y: Math.max(...scatterData.map((d) => d.actual)) },
                  ]}
                  stroke="#166534"
                  strokeDasharray="6 3"
                  label={{ value: 'Perfect fit', fill: '#166534', fontSize: 10 }}
                />
                <Scatter data={scatterData} fill="#4ade80" fillOpacity={0.65} />
              </ScatterChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* ── Residual Analysis ──────────────────────────────────────────── */}
      <div className="card">
        <h3 className="section-title">Residual Analysis</h3>
        {!evalData && !loading && (
          <p className="text-sm text-gray-400 py-6 text-center">
            Residual data unavailable. Please start the backend server.
          </p>
        )}
        {evalData && (
          <>
            <p className="text-xs text-gray-400 mb-3">
              Distribution of residuals (Actual − Predicted). A centered distribution indicates no systematic bias.
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={residualData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bin" tick={{ fontSize: 9 }} label={{ value: 'Residual (kg/ha)', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v: any) => [v, 'Count']} />
                <ReferenceLine x="0" stroke="#dc2626" strokeDasharray="4 2" />
                <Bar dataKey="count" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* ── Notes ─────────────────────────────────────────────────────── */}
      <div className="card bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-1">
            <p className="font-semibold">Interpretation Notes</p>
            <p>An R² of ~0.52 indicates moderate predictive power. The model explains approximately half the variance in crop yield from the provided environmental features.</p>
            <p>RMSE and MAE values indicate the average magnitude of prediction error in kg/ha units.</p>
            <p>The dataset consists of synthetically generated observations based on empirically validated agronomic models.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
