import { useState } from 'react';
import { History, Search, Trash2, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHistory, clearHistory } from '../services/historyService';
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

function RecordRow({ record }: { record: PredictionRecord }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-600">{record.date}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{record.time}</td>
        <td className="px-4 py-3 text-sm font-semibold text-forest-700">
          {record.predicted_yield.toFixed(2)} kg/ha
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">{record.model}</td>
        <td className="px-4 py-3">
          <span className="badge-success text-xs">{record.status}</span>
        </td>
        <td className="px-4 py-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-400 hover:text-forest-600 transition-colors"
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-forest-50/50">
          <td colSpan={6} className="px-4 py-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {Object.entries(record.inputs).map(([k, v]) => (
                <div key={k} className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-gray-500">{FIELD_LABELS[k] ?? k}</span>
                  <span className="font-semibold text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function HistoryPage() {
  const navigate  = useNavigate();
  const [search, setSearch]   = useState('');
  const [records, setRecords] = useState<PredictionRecord[]>(getHistory);

  const filtered = records.filter(
    (r) =>
      r.date.includes(search) ||
      r.predicted_yield.toFixed(2).includes(search) ||
      r.model.toLowerCase().includes(search.toLowerCase())
  );

  const handleClear = () => {
    clearHistory();
    setRecords([]);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <History className="w-5 h-5 text-forest-600" />
          <h2 className="page-title mb-0">Prediction History</h2>
        </div>
        <p className="page-subtitle">
          Locally stored prediction records. History is saved in your browser.
        </p>
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="search-history"
            type="text"
            placeholder="Search by date, yield, or model…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        {records.length > 0 && (
          <button
            id="btn-clear-history"
            onClick={handleClear}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium
                       px-4 py-2.5 rounded-xl border border-red-200 hover:border-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      {records.length === 0 ? (
        <div className="card text-center py-16">
          <Database className="w-10 h-10 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium mb-1">No predictions yet</p>
          <p className="text-sm text-gray-400 mb-4">
            No predictions yet. Start your first crop yield prediction.
          </p>
          <button onClick={() => navigate('/predict')} className="btn-primary text-sm px-5 py-2.5">
            Make First Prediction
          </button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              {filtered.length} of {records.length} record{records.length !== 1 ? 's' : ''}
              {' '}(locally stored in browser)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Predicted Yield</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((record) => (
                  <RecordRow key={record.id} record={record} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
