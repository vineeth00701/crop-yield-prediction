import axios from 'axios';
import type {
  PredictionInput,
  PredictionResponse,
  MetricsResponse,
  EvalData,
  DatasetStats,
  HealthResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Health ────────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<HealthResponse> {
  const res = await api.get('/health');
  return res.data;
}

// ── Predict ───────────────────────────────────────────────────────────────────
export async function predictYield(
  input: PredictionInput
): Promise<PredictionResponse> {
  try {
    const res = await api.post('/predict', input);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // Server returned an error response
        return err.response.data as PredictionResponse;
      } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        return {
          status: 'error',
          message:
            'Prediction service is currently unavailable. Please check the backend connection.',
        };
      }
    }
    return {
      status: 'error',
      message: 'Unable to connect to the prediction service.',
    };
  }
}

// ── Metrics ───────────────────────────────────────────────────────────────────
export async function fetchMetrics(): Promise<MetricsResponse | null> {
  try {
    const res = await api.get('/metrics');
    return res.data;
  } catch {
    return null;
  }
}

// ── Evaluation data ───────────────────────────────────────────────────────────
export async function fetchEvalData(): Promise<{
  status: string;
  data: EvalData;
} | null> {
  try {
    const res = await api.get('/eval');
    return res.data;
  } catch {
    return null;
  }
}

// ── Dataset statistics ────────────────────────────────────────────────────────
export async function fetchDatasetStats(): Promise<{
  status: string;
  data: Record<string, DatasetStats>;
} | null> {
  try {
    const res = await api.get('/dataset-stats');
    return res.data;
  } catch {
    return null;
  }
}
