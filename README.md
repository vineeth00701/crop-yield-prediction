# AgriPredict

> **Intelligent Crop Yield Estimation Through Environmental Data**

AgriPredict is a comprehensive machine learning web application designed to predict agricultural crop yield (in kg/ha) using a suite of environmental and agronomic factors. Built as a Phase 4 Data Sciences Mini Project, it leverages a trained Gradient Boosting Regressor to deliver data-driven agricultural estimates.

## Features

- **Yield Prediction:** Input environmental conditions (Rainfall, Temperature, Soil pH, etc.) to receive instant crop yield predictions.
- **Environmental Analysis:** Explore the statistical distributions and Pearson correlations of key agronomic features.
- **Model Performance Metrics:** Transparent reporting of model accuracy (R², RMSE, MAE) and feature importances.
- **Prediction History:** Local storage of previous predictions for easy reference and comparison.
- **Interactive Dashboard:** A premium, responsive interface featuring interactive charts and real-time model status.

## Technology Stack

### Frontend
- **Framework:** React + TypeScript (Vite)
- **Styling:** Tailwind CSS for a custom, agriculture-inspired design system
- **Routing:** React Router
- **Data Visualization:** Recharts
- **Icons:** Lucide React

### Backend
- **Framework:** Python Flask (REST API)
- **Machine Learning:** Scikit-Learn (Gradient Boosting Regressor, Random Forest Regressor)
- **Data Processing:** Pandas, NumPy
- **Model Serialization:** Joblib

## Dataset Information

The application is built on a synthetic dataset designed to mirror empirically validated agronomic models:
- **Observations:** 800 records
- **Time Period:** 2000–2019
- **Regions:** 40
- **Features:** 9 environmental/agronomic inputs (Rainfall, Temperature, Soil pH, Nitrogen, Phosphorus, Potassium, Pesticide Use, Irrigation, Soil Organic Matter)
- **Target Variable:** `Crop_Yield_kg_ha`

## Machine Learning Methodology

The core prediction engine is a **Gradient Boosting Regressor**.
The model was trained with the following approximate evaluation results on a 20% test split:
- **R² Score:** ~0.51 - 0.52
- **RMSE:** ~280 - 290 kg/ha
- **MAE:** ~230 - 240 kg/ha

The model appropriately weights features such as Pesticide Use and Soil Organic Matter, reflecting the dataset's underlying statistical structure.

## Project Structure

```
AgriPredict/
├── backend/
│   ├── data/                 # Generated dataset
│   ├── model/                # Saved models (.pkl) and metrics (.json)
│   ├── app.py                # Flask API server
│   ├── generate_dataset.py   # Dataset generation script
│   ├── train_model.py        # Model training and evaluation script
│   └── requirements.txt      # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components (Layout, Sidebar, etc.)
    │   ├── pages/            # Application routes (Dashboard, Predict, Analysis, etc.)
    │   ├── services/         # API and localStorage services
    │   ├── types/            # TypeScript interface definitions
    │   └── utils/            # Form validation utilities
    ├── tailwind.config.js    # Custom Tailwind theme
    └── index.html            # Entry point
```

## Setup & Installation

### 1. Backend Setup

Ensure you have Python 3.8+ installed.

```bash
cd backend
python -m pip install -r requirements.txt

# Step 1: Generate the dataset
python generate_dataset.py

# Step 2: Train the model
python train_model.py

# Step 3: Run the API server
python app.py
```
The backend will run at `http://localhost:8000`.

### 2. Frontend Setup

Ensure you have Node.js (v16+) installed.

```bash
cd frontend
npm install

# Start the development server
npm run dev
```
The frontend will run at `http://localhost:5173`.

## Environment Variables

The frontend expects a backend URL configuration. Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Screenshots

The application includes views designed for final project documentation:
- **Dashboard:** Overview of dataset stats, model performance, and recent predictions.
- **Yield Prediction:** The primary input form.
- **Prediction Output:** The result screen showing estimated yield and entered parameters.
- **Environmental Analysis:** Distribution charts and correlation analysis.
- **Model Performance:** Detailed metrics, feature importance, and residual analysis.

## Future Enhancements
- Integration of larger, real-world datasets.
- Real-time weather API integration.
- Crop-specific models and regional analysis.
- IoT soil sensor integration.

---
*AgriPredict — Developed as a Data Sciences Mini Project.*
