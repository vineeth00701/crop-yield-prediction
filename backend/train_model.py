"""
AgriPredict - Model Training Script
Trains a Gradient Boosting Regressor (primary) and Random Forest Regressor
(comparison) on the agricultural dataset.

Reported metrics (target from project specification):
  Gradient Boosting → R² ≈ 0.5161, RMSE ≈ 282.28, MAE ≈ 237.45
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(__file__)
DATA_PATH  = os.path.join(BASE_DIR, "data", "agricultural_crop_yield.csv")
MODEL_DIR  = os.path.join(BASE_DIR, "model")
os.makedirs(MODEL_DIR, exist_ok=True)

# ── Feature definition ────────────────────────────────────────────────────────
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
TARGET = "Crop_Yield_kg_ha"

# ── Load data ─────────────────────────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)
print(f"Dataset loaded: {df.shape}")
print(f"Missing values:\n{df[FEATURES + [TARGET]].isnull().sum()}")
print(f"Duplicate rows: {df.duplicated().sum()}")

X = df[FEATURES].values
y = df[TARGET].values

# ── Train / test split ────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── Preprocessing (StandardScaler) ───────────────────────────────────────────
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

# ── Gradient Boosting (primary model) ────────────────────────────────────────
gb_model = GradientBoostingRegressor(
    n_estimators=200,
    learning_rate=0.08,
    max_depth=4,
    min_samples_split=5,
    min_samples_leaf=3,
    subsample=0.85,
    random_state=42,
)
gb_model.fit(X_train_sc, y_train)
y_pred_gb = gb_model.predict(X_test_sc)

gb_r2   = r2_score(y_test, y_pred_gb)
gb_rmse = np.sqrt(mean_squared_error(y_test, y_pred_gb))
gb_mae  = mean_absolute_error(y_test, y_pred_gb)

print("\n=== Gradient Boosting Regressor ===")
print(f"  R²   = {gb_r2:.4f}")
print(f"  RMSE = {gb_rmse:.2f} kg/ha")
print(f"  MAE  = {gb_mae:.2f} kg/ha")

# ── Random Forest (comparison model) ─────────────────────────────────────────
rf_model = RandomForestRegressor(
    n_estimators=200,
    max_depth=8,
    min_samples_split=5,
    min_samples_leaf=3,
    random_state=42,
)
rf_model.fit(X_train_sc, y_train)
y_pred_rf = rf_model.predict(X_test_sc)

rf_r2   = r2_score(y_test, y_pred_rf)
rf_rmse = np.sqrt(mean_squared_error(y_test, y_pred_rf))
rf_mae  = mean_absolute_error(y_test, y_pred_rf)

print("\n=== Random Forest Regressor ===")
print(f"  R²   = {rf_r2:.4f}")
print(f"  RMSE = {rf_rmse:.2f} kg/ha")
print(f"  MAE  = {rf_mae:.2f} kg/ha")

# ── Feature importance ────────────────────────────────────────────────────────
importances = gb_model.feature_importances_
imp_pct = (importances / importances.sum() * 100).tolist()
feat_imp = {FEATURES[i]: round(imp_pct[i], 2) for i in range(len(FEATURES))}
feat_imp_sorted = dict(sorted(feat_imp.items(), key=lambda x: -x[1]))

print("\n=== Feature Importances (GB) ===")
for f, v in feat_imp_sorted.items():
    print(f"  {f:25s}: {v:.1f}%")

# ── Correlation with target ───────────────────────────────────────────────────
corr_df = df[FEATURES + [TARGET]].corr()[TARGET].drop(TARGET)
print("\n=== Pearson Correlations with Crop Yield ===")
for feat, val in corr_df.items():
    print(f"  {feat:25s}: {val:+.4f}")

# ── Evaluation residuals for UI ───────────────────────────────────────────────
eval_data = {
    "y_test":    y_test.tolist(),
    "y_pred_gb": y_pred_gb.tolist(),
    "y_pred_rf": y_pred_rf.tolist(),
    "residuals": (y_test - y_pred_gb).tolist(),
}

# ── Correlations ──────────────────────────────────────────────────────────────
corr_data = corr_df.round(4).to_dict()

# ── Save artefacts ────────────────────────────────────────────────────────────
joblib.dump(gb_model, os.path.join(MODEL_DIR, "gradient_boosting_model.pkl"))
joblib.dump(rf_model, os.path.join(MODEL_DIR, "random_forest_model.pkl"))
joblib.dump(scaler,   os.path.join(MODEL_DIR, "scaler.pkl"))

metrics = {
    "gradient_boosting": {
        "r2":   round(gb_r2,   4),
        "rmse": round(gb_rmse, 2),
        "mae":  round(gb_mae,  2),
    },
    "random_forest": {
        "r2":   round(rf_r2,   4),
        "rmse": round(rf_rmse, 2),
        "mae":  round(rf_mae,  2),
    },
    "feature_importance": feat_imp_sorted,
    "features": FEATURES,
    "correlations": corr_data,
}

with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)

with open(os.path.join(MODEL_DIR, "eval_data.json"), "w") as f:
    json.dump(eval_data, f)

print("\nAll model artefacts saved to:", MODEL_DIR)
