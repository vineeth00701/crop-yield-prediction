import { useEffect, useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { fetchDatasetStats } from '../services/api';
import type { DatasetStats } from '../types';

// Reported Pearson correlations from project specification
const CORRELATIONS = [
  { feature: 'Pesticide Use',       key: 'Pesticide_Use_kg_ha', r: 0.3607,  color: '#166534' },
  { feature: 'Soil Organic Matter', key: 'Soil_Organic_Matter',  r: 0.3425,  color: '#16a34a' },
  { feature: 'Nitrogen',            key: 'Nitrogen_kg_ha',        r: 0.2888,  color: '#22c55e' },
  { feature: 'Soil pH',             key: 'Soil_pH',               r: 0.1311,  color: '#4ade80' },
  { feature: 'Temperature',         key: 'Temperature_C',         r: 0.1139,  color: '#86efac' },
  { feature: 'Rainfall',            key: 'Rainfall_mm',           r: -0.0665, color: '#ea580c' },
];

const FEATURE_META: Record<string, { label: string; unit: string; color: string }> = {
  Rainfall_mm:          { label: 'Rainfall',            unit: 'mm',     color: '#3b82f6' },
  Temperature_C:        { label: 'Temperature',          unit: '°C',     color: '#ef4444' },
  Soil_pH:              { label: 'Soil pH',              unit: '',       color: '#a855f7' },
  Nitrogen_kg_ha:       { label: 'Nitrogen',             unit: 'kg/ha',  color: '#22c55e' },
  Phosphorus_kg_ha:     { label: 'Phosphorus',           unit: 'kg/ha',  color: '#f59e0b' },
  Potassium_kg_ha:      { label: 'Potassium',            unit: 'kg/ha',  color: '#14b8a6' },
  Pesticide_Use_kg_ha:  { label: 'Pesticide Use',        unit: 'kg/ha',  color: '#166534' },
  Irrigation_hours:     { label: 'Irrigation Hours',     unit: 'hrs',    color: '#0ea5e9' },
  Soil_Organic_Matter:  { label: 'Soil Organic Matter',  unit: '%',      color: '#84cc16' },
  Crop_Yield_kg_ha:     { label: 'Crop Yield',           unit: 'kg/ha',  color: '#166534' },
};

interface HistogramProps {
  stats: DatasetStats;
  feature: string;
}

function Histogram({ stats, feature }: HistogramProps) {
  const meta = FEATURE_META[feature] ?? { label: feature, unit: '', color: '#166534' };
  const data = stats.hist_counts.map((count, i) => ({
    bin:   `${stats.hist_edges[i].toFixed(1)}`,
    count,
  }));

  return (
    <div className="card">
      <h4 className="font-semibold text-gray-800 mb-1 text-sm">{meta.label} Distribution</h4>
      <p className="text-xs text-gray-400 mb-3">
        Mean: {stats.mean.toFixed(2)} {meta.unit} · Std: {stats.std.toFixed(2)} · Range: {stats.min.toFixed(1)}–{stats.max.toFixed(1)}
      </p>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ left: -10, right: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="bin" tick={{ fontSize: 8 }} interval={4} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip
            formatter={(v: any) => [v, 'Count']}
            labelFormatter={(l: any) => `≥ ${l} ${meta.unit}`}
          />
          <Bar dataKey="count" fill={meta.color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AnalysisPage() {
  const [stats, setStats]   = useState<Record<string, DatasetStats> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasetStats().then((res) => {
      if (res?.status === 'success') setStats(res.data);
      setLoading(false);
    });
  }, []);

  const featureKeys = Object.keys(FEATURE_META).filter((k) => k !== 'Crop_Yield_kg_ha');

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="page-header">
        <h2 className="page-title">Environmental Factor Analysis</h2>
        <p className="page-subtitle">
          Distributions and statistical relationships of the 9 environmental and agronomic features.
        </p>
      </div>

      {/* ── Correlation Heatmap ────────────────────────────────────────── */}
      <div className="card">
        <h3 className="section-title">Pearson Correlations with Crop Yield</h3>
        <p className="text-xs text-gray-400 mb-1">Reported project correlations (r values).</p>

        <div className="space-y-2 mt-4">
          {CORRELATIONS.map(({ feature, r, color }) => {
            const barWidth = Math.abs(r) * 100;
            const positive = r >= 0;
            return (
              <div key={feature} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-44 flex-shrink-0">{feature}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden relative">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 text-xs font-semibold text-white transition-all duration-500"
                    style={{
                      width:           `${barWidth}%`,
                      backgroundColor: positive ? color : '#dc2626',
                      minWidth:        '40px',
                    }}
                  >
                    {r > 0 ? `+${r.toFixed(4)}` : r.toFixed(4)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-400" />
            Correlation describes statistical association and does not establish causation.
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
            Pesticide use should not be interpreted as an automatic recommendation for increasing application.
          </div>
        </div>
      </div>

      {/* ── Correlation scatter (visual) ───────────────────────────────── */}
      <div className="card">
        <h3 className="section-title">Correlation Overview (Bar Chart)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={CORRELATIONS.map((c) => ({ name: c.feature, r: c.r }))}
            margin={{ left: 10, right: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
            <YAxis domain={[-0.15, 0.45]} tick={{ fontSize: 11 }} tickFormatter={(v) => v.toFixed(2)} />
            <Tooltip formatter={(v: any) => [Number(v).toFixed(4), 'Pearson r']} />
            <Bar dataKey="r" radius={[4, 4, 0, 0]}>
              {CORRELATIONS.map((c, i) => (
                <Cell key={i} fill={c.r >= 0 ? '#16a34a' : '#dc2626'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Feature distributions ──────────────────────────────────────── */}
      <div>
        <h3 className="section-title">Feature Distributions</h3>
        {!loading && !stats && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Dataset statistics unavailable. Start the backend to load distribution charts.
          </div>
        )}
        {loading && (
          <div className="text-center py-10 text-gray-400 text-sm">Loading distributions…</div>
        )}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {featureKeys.map((key) =>
              stats[key] ? <Histogram key={key} stats={stats[key]} feature={key} /> : null
            )}
          </div>
        )}
      </div>

      {/* ── Crop Yield Distribution ────────────────────────────────────── */}
      {stats?.Crop_Yield_kg_ha && (
        <div>
          <h3 className="section-title">Crop Yield Distribution</h3>
          <div className="card">
            <p className="text-sm text-gray-500 mb-3">
              Target variable: <strong>Crop_Yield_kg_ha</strong> — 
              Mean: {stats.Crop_Yield_kg_ha.mean.toFixed(2)} kg/ha · 
              Std: {stats.Crop_Yield_kg_ha.std.toFixed(2)} · 
              Range: {stats.Crop_Yield_kg_ha.min.toFixed(0)}–{stats.Crop_Yield_kg_ha.max.toFixed(0)} kg/ha
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={stats.Crop_Yield_kg_ha.hist_counts.map((count, i) => ({
                  bin: `${stats.Crop_Yield_kg_ha.hist_edges[i].toFixed(0)}`,
                  count,
                }))}
                margin={{ left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bin" tick={{ fontSize: 9 }} interval={3} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v: any) => [v, 'Observations']} />
                <Bar dataKey="count" fill="#166534" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
