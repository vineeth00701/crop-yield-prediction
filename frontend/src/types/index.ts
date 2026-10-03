// ── API Types ─────────────────────────────────────────────────────────────────

export interface PredictionInput {
  Rainfall_mm: number;
  Temperature_C: number;
  Soil_pH: number;
  Nitrogen_kg_ha: number;
  Phosphorus_kg_ha: number;
  Potassium_kg_ha: number;
  Pesticide_Use_kg_ha: number;
  Irrigation_hours: number;
  Soil_Organic_Matter: number;
}

export interface PredictionResponse {
  status: 'success' | 'error';
  predicted_yield_kg_ha?: number;
  model_name?: string;
  timestamp?: string;
  message?: string;
}

export interface ModelMetrics {
  r2: number;
  rmse: number;
  mae: number;
}

export interface MetricsResponse {
  status: string;
  data: {
    gradient_boosting: ModelMetrics;
    random_forest: ModelMetrics;
    feature_importance: Record<string, number>;
    features: string[];
    correlations: Record<string, number>;
  };
}

export interface EvalData {
  y_test: number[];
  y_pred_gb: number[];
  y_pred_rf: number[];
  residuals: number[];
}

export interface DatasetStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
  hist_counts: number[];
  hist_edges: number[];
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  timestamp: string;
}

// ── App Types ─────────────────────────────────────────────────────────────────

export interface PredictionRecord {
  id: string;
  date: string;
  time: string;
  timestamp: string;
  predicted_yield: number;
  model: string;
  status: string;
  inputs: PredictionInput;
}

export interface FormErrors {
  [key: string]: string;
}
