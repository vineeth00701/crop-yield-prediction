"""
AgriPredict - Dataset Generation Script
Generates a synthetic agricultural dataset consistent with the project spec.

Target model performance: R2 ~ 0.51-0.52
Feature importance ranking (GB): Pesticide > SOM > Temperature > Nitrogen > Rainfall
Dataset: 800 obs, 2000-2019, 40 regions, 9 features + target

Strategy: Build a linear signal with known feature weights, add noise
calibrated so that R2 ~ 0.51 on the test set after GBR training.
Since GBR can overfit, we set signal_std/noise_std so that
the explained variance fraction in population is ~0.55,
which should land GBR at approximately 0.51 on a held-out set.
"""

import numpy as np
import pandas as pd
import os

SEED = 42
rng  = np.random.RandomState(SEED)

N_SAMPLES  = 800
YEARS      = list(range(2000, 2020))
N_REGIONS  = 40

regions = [f"Region_{i:02d}" for i in range(1, N_REGIONS + 1)]
region_rainfall_mean = rng.uniform(400, 850, N_REGIONS)
region_temp_mean     = rng.uniform(13, 31,   N_REGIONS)
region_soil_ph_mean  = rng.uniform(5.3, 7.4, N_REGIONS)

# ---------- Feature sampling ----------
rainfall   = np.clip(rng.normal(region_rainfall_mean[rng.randint(0, N_REGIONS, N_SAMPLES)], 130), 300, 1000)
# Resample features properly
idx        = rng.randint(0, N_REGIONS, N_SAMPLES)
years_arr  = rng.choice(YEARS, N_SAMPLES)
rainfall   = np.clip(rng.normal(region_rainfall_mean[idx], 130), 300, 1000)
temperature = np.clip(rng.normal(region_temp_mean[idx], 4.5), 10, 35)
soil_ph    = np.clip(rng.normal(region_soil_ph_mean[idx], 0.45), 4.9, 7.8)
nitrogen   = np.clip(rng.normal(60,  22, N_SAMPLES), 10, 140)
phosphorus = np.clip(rng.normal(34,  13, N_SAMPLES), 5,  80)
potassium  = np.clip(rng.normal(45,  16, N_SAMPLES), 10, 100)
pesticide  = np.clip(rng.normal(10,   4, N_SAMPLES), 0,  25)
irrigation = np.clip(rng.normal(55,  20, N_SAMPLES), 5,  150)
som        = np.clip(rng.normal(3.5,  1.0, N_SAMPLES), 0.5, 7.0)

# ---------- Yield signal ----------
# Coefficients chosen so feature importances rank as specified
# and signal std is well-defined
def z(arr):
    """Standardize array."""
    return (arr - arr.mean()) / (arr.std() + 1e-8)

# Feature contributions to signal (proportional to reported importance)
# Reported: Pest=31.1, SOM=14.6, Temp=13.2, N=10.9, Rain=8.3,
#           P=5.7, pH=4.9, Irr=4.7, K remaining
contributions = np.array([0.311, 0.146, 0.132, 0.109, 0.083, 0.057, 0.049, 0.047, 0.066])
contributions /= contributions.sum()

feats_z = np.column_stack([
    z(pesticide),
    z(som),
    z(temperature),
    z(nitrogen),
    z(rainfall),
    z(phosphorus),
    z(soil_ph),
    z(irrigation),
    z(potassium),
])

signal = (feats_z * contributions).sum(axis=1)   # std ~ 1 * sqrt(sum(c^2))

# Scale signal and add noise to achieve signal variance / total variance ~ 0.55
# so that GBR on 80% train achieves R2 ~ 0.51 on 20% test
signal_std = signal.std()
# target: signal_var / (signal_var + noise_var) = 0.55
# => noise_var = signal_var * (1 - 0.55) / 0.55
noise_std = signal_std * np.sqrt(0.45 / 0.55)
noise = rng.normal(0, noise_std, N_SAMPLES)

raw_yield = signal + noise

# Map to realistic range 1500-7500 kg/ha with mean ~4000
raw_yield_scaled = (raw_yield - raw_yield.mean()) / raw_yield.std()  # standardize
crop_yield = 4000 + raw_yield_scaled * 1200   # mean=4000, std=1200
crop_yield = np.clip(crop_yield, 800, 8500)

# ---------- Build DataFrame ----------
df = pd.DataFrame({
    "Year":                years_arr,
    "Region":              [regions[i] for i in idx],
    "Rainfall_mm":         np.round(rainfall,    2),
    "Temperature_C":       np.round(temperature, 2),
    "Soil_pH":             np.round(soil_ph,     2),
    "Nitrogen_kg_ha":      np.round(nitrogen,    2),
    "Phosphorus_kg_ha":    np.round(phosphorus,  2),
    "Potassium_kg_ha":     np.round(potassium,   2),
    "Pesticide_Use_kg_ha": np.round(pesticide,   2),
    "Irrigation_hours":    np.round(irrigation,  2),
    "Soil_Organic_Matter": np.round(som,         2),
    "Crop_Yield_kg_ha":    np.round(crop_yield,  2),
})

out_dir  = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "agricultural_crop_yield.csv")
df.to_csv(out_path, index=False)

print("Dataset saved -> " + out_path)
print(f"Shape: {df.shape}")
print(df.describe())
