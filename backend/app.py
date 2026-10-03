"""
AgriPredict Backend — Flask API
Serves prediction, metrics, evaluation data, and dataset statistics.
"""

import os
import json
import numpy as np
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

# ── App setup ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

BASE_DIR  = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "model")

# ── Feature order MUST match training ────────────────────────────────────────
FEATURES = [
    "Rainfall_mm",
    "Temperature_C",
    "Soil_pH",
    "Nitrogen_kg_ha",
    "Phosphorus_kg_ha",
    "Potassium_kg_ha",
    "Pesticide_Use_kg_ha",
    "Irrigation_hours",
    "Soil_Organic_Matter",
]

# ── Lazy-loaded model objects ─────────────────────────────────────────────────
_gb_model = None
_scaler   = None
_metrics  = None
_eval_data = None


def load_models():
    global _gb_model, _scaler, _metrics, _eval_data

    gb_path  = os.path.join(MODEL_DIR, "gradient_boosting_model.pkl")
    sc_path  = os.path.join(MODEL_DIR, "scaler.pkl")
    mt_path  = os.path.join(MODEL_DIR, "metrics.json")
    ev_path  = os.path.join(MODEL_DIR, "eval_data.json")

    if not os.path.exists(gb_path):
        raise FileNotFoundError(
            "Model not found. Run `python train_model.py` first."
        )

    _gb_model  = joblib.load(gb_path)
    _scaler    = joblib.load(sc_path)

    with open(mt_path) as f:
        _metrics = json.load(f)

    with open(ev_path) as f:
        _eval_data = json.load(f)

    print("[AgriPredict] Models loaded successfully.")


# ── Load on startup ───────────────────────────────────────────────────────────
try:
    load_models()
    MODEL_LOADED = True
except Exception as e:
    print(f"[AgriPredict WARNING] {e}")
    MODEL_LOADED = False


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": MODEL_LOADED,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    })


# ─────────────────────────────────────────────────────────────────────────────
# Prediction
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    if not MODEL_LOADED:
        return jsonify({
            "status": "error",
            "message": "Machine learning model could not be loaded. Please contact the administrator.",
        }), 503

    data = request.get_json(force=True, silent=True)
    if data is None:
        return jsonify({"status": "error", "message": "Invalid JSON body."}), 400

    # Validate and extract features in exact training order
    feature_vector = []
    missing = []
    invalid = []

    for feat in FEATURES:
        val = data.get(feat)
        if val is None:
            missing.append(feat)
        else:
            try:
                feature_vector.append(float(val))
            except (TypeError, ValueError):
                invalid.append(feat)

    if missing:
        return jsonify({
            "status": "error",
            "message": f"Missing required fields: {', '.join(missing)}",
        }), 422

    if invalid:
        return jsonify({
            "status": "error",
            "message": f"Invalid (non-numeric) values for: {', '.join(invalid)}",
        }), 422

    # Sanity bounds (very broad — do not reject valid values)
    bounds = {
        "Rainfall_mm":        (0, 3000),
        "Temperature_C":      (-10, 60),
        "Soil_pH":            (0, 14),
        "Nitrogen_kg_ha":     (0, 500),
        "Phosphorus_kg_ha":   (0, 500),
        "Potassium_kg_ha":    (0, 500),
        "Pesticide_Use_kg_ha":(0, 200),
        "Irrigation_hours":   (0, 1000),
        "Soil_Organic_Matter":(0, 100),
    }
    out_of_bounds = []
    for i, feat in enumerate(FEATURES):
        lo, hi = bounds[feat]
        if not (lo <= feature_vector[i] <= hi):
            out_of_bounds.append(feat)

    if out_of_bounds:
        return jsonify({
            "status": "error",
            "message": f"Values out of physically meaningful range: {', '.join(out_of_bounds)}",
        }), 422

    try:
        X = np.array([feature_vector])
        X_sc = _scaler.transform(X)
        prediction = float(_gb_model.predict(X_sc)[0])
        prediction = round(prediction, 2)
    except Exception as e:
        app.logger.error(f"Prediction error: {e}")
        return jsonify({
            "status": "error",
            "message": "An error occurred during prediction. Please try again.",
        }), 500

    return jsonify({
        "status": "success",
        "predicted_yield_kg_ha": prediction,
        "model_name": "Gradient Boosting Regressor",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    })


# ─────────────────────────────────────────────────────────────────────────────
# Metrics
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/metrics", methods=["GET"])
def metrics():
    if not MODEL_LOADED or _metrics is None:
        return jsonify({"status": "error", "message": "Metrics unavailable."}), 503
    return jsonify({"status": "success", "data": _metrics})


# ─────────────────────────────────────────────────────────────────────────────
# Evaluation data (for charts)
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/eval", methods=["GET"])
def eval_data():
    if not MODEL_LOADED or _eval_data is None:
        return jsonify({"status": "error", "message": "Evaluation data unavailable."}), 503

    # Return a sample (max 200 points) for performance
    n = len(_eval_data["y_test"])
    step = max(1, n // 200)
    sampled = {
        "y_test":    _eval_data["y_test"][::step],
        "y_pred_gb": _eval_data["y_pred_gb"][::step],
        "y_pred_rf": _eval_data["y_pred_rf"][::step],
        "residuals": _eval_data["residuals"][::step],
    }
    return jsonify({"status": "success", "data": sampled})


# ─────────────────────────────────────────────────────────────────────────────
# Dataset statistics endpoint
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/dataset-stats", methods=["GET"])
def dataset_stats():
    """Returns per-feature statistics for the analysis page."""
    import pandas as pd
    data_path = os.path.join(BASE_DIR, "data", "agricultural_crop_yield.csv")
    if not os.path.exists(data_path):
        return jsonify({"status": "error", "message": "Dataset not found."}), 503

    df = pd.read_csv(data_path)
    cols = FEATURES + ["Crop_Yield_kg_ha"]
    stats = {}
    for col in cols:
        s = df[col]
        # Build histogram-friendly buckets (20 bins)
        counts, edges = np.histogram(s, bins=20)
        stats[col] = {
            "mean":   round(float(s.mean()), 3),
            "std":    round(float(s.std()),  3),
            "min":    round(float(s.min()),  3),
            "max":    round(float(s.max()),  3),
            "median": round(float(s.median()), 3),
            "hist_counts": counts.tolist(),
            "hist_edges":  [round(e, 2) for e in edges.tolist()],
        }
    return jsonify({"status": "success", "data": stats})


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
