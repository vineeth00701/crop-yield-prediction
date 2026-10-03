import {
  BookOpen, Database, FlaskConical, TrendingUp, AlertTriangle,
  Rocket, Leaf, BarChart2,
} from 'lucide-react';

function Section({
  icon: Icon, title, children,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-forest-700" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Hero */}
      <div className="relative rounded-3xl bg-gradient-hero text-white px-8 py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-green-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">About AgriPredict</h2>
              <p className="text-green-200 text-sm">Phase 4 Final Implementation</p>
            </div>
          </div>
          <p className="text-white/80 leading-relaxed max-w-2xl">
            AgriPredict is a machine learning-based web application developed as a
            Data Sciences Mini Project. It estimates agricultural crop yield using
            environmental and agronomic factors through a Gradient Boosting Regressor
            trained on 800 observations spanning 40 regions from 2000 to 2019.
          </p>
        </div>
      </div>

      {/* Project Objective */}
      <Section icon={BookOpen} title="Project Objective">
        <p>
          The objective of this project is to predict agricultural crop yield (measured in
          kg/ha) using a combination of environmental and agronomic input variables.
          By analyzing factors such as rainfall, temperature, soil quality, nutrient levels,
          and pest management, the model aims to provide a data-driven estimate of crop
          productivity for a given set of conditions.
        </p>
        <p>
          The application serves as a decision-support tool for understanding how environmental
          factors relate to agricultural output.
        </p>
      </Section>

      {/* Dataset */}
      <Section icon={Database} title="Dataset">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {[
            { label: 'Observations', value: '800' },
            { label: 'Time Period',  value: '2000–2019' },
            { label: 'Regions',      value: '40' },
            { label: 'Features',     value: '9 + target' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-forest-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-forest-700">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        <p>
          The dataset contains 800 agricultural observations recorded across 40 geographic
          regions over a 20-year period (2000–2019). It includes 9 environmental and
          agronomic input features with <strong>Crop_Yield_kg_ha</strong> as the target variable.
        </p>
        <p>
          The environmental and agronomic feature values were synthetically generated based
          on empirically validated agronomic models to represent realistic agricultural
          conditions across diverse regions.
        </p>
        <div className="mt-2">
          <p className="font-medium text-gray-700 mb-1">Input Features:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {[
              'Rainfall_mm — Annual or seasonal rainfall in millimeters',
              'Temperature_C — Average temperature in degrees Celsius',
              'Soil_pH — Soil acidity/alkalinity level',
              'Nitrogen_kg_ha — Nitrogen fertilizer application',
              'Phosphorus_kg_ha — Phosphorus fertilizer application',
              'Potassium_kg_ha — Potassium fertilizer application',
              'Pesticide_Use_kg_ha — Pesticide application rate',
              'Irrigation_hours — Hours of irrigation applied',
              'Soil_Organic_Matter — Percentage of organic matter in soil',
            ].map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      </Section>

      {/* Data Preparation */}
      <Section icon={FlaskConical} title="Data Preparation">
        <p>The dataset was subjected to the following quality checks:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Missing value validation:</strong> Confirmed zero missing values across all columns.</li>
          <li><strong>Duplicate checking:</strong> No duplicate records were identified.</li>
          <li><strong>Outlier analysis:</strong> Feature distributions were reviewed for extreme values.</li>
          <li><strong>Data type validation:</strong> All features confirmed as numeric; target variable is continuous.</li>
        </ul>
        <p>
          Features were standardized using <code>StandardScaler</code> prior to model training
          to ensure consistent feature scaling for the Gradient Boosting algorithm.
          An 80/20 train-test split was applied with a fixed random seed for reproducibility.
        </p>
      </Section>

      {/* EDA */}
      <Section icon={BarChart2} title="Exploratory Data Analysis">
        <p>
          Exploratory analysis examined the distribution of each feature, their
          correlation with the target variable, and inter-feature relationships.
          Pearson correlation coefficients were calculated to identify linear associations
          between environmental factors and crop yield.
        </p>
        <p>
          Pesticide Use (+0.3607) and Soil Organic Matter (+0.3425) showed the strongest
          positive linear correlations with crop yield. Rainfall showed a small negative
          correlation (−0.0665), which may reflect regional variability in the dataset.
        </p>
      </Section>

      {/* Machine Learning */}
      <Section icon={TrendingUp} title="Machine Learning Methodology">
        <p>Two regression algorithms were evaluated:</p>
        <div className="space-y-3 mt-2">
          <div className="p-3 bg-forest-50 rounded-xl border border-forest-100">
            <p className="font-semibold text-forest-800 mb-1">Gradient Boosting Regressor (Primary)</p>
            <p>
              An ensemble method that builds trees sequentially, with each tree correcting
              the errors of the previous one. Hyperparameters were tuned for n_estimators,
              learning_rate, max_depth, and subsampling rate.
              Achieved R² ≈ 0.53 on the test set.
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="font-semibold text-gray-700 mb-1">Random Forest Regressor (Comparison)</p>
            <p>
              A parallel ensemble of decision trees using bootstrap aggregation (bagging).
              Provides a baseline comparison and was used to assess relative model performance.
            </p>
          </div>
        </div>
        <p className="mt-2">
          Model evaluation metrics include: R² (coefficient of determination), RMSE (Root
          Mean Squared Error), and MAE (Mean Absolute Error). Feature importance values
          were extracted from the trained Gradient Boosting model to identify which
          environmental factors most influence predictions.
        </p>
      </Section>

      {/* Limitations */}
      <Section icon={AlertTriangle} title="Project Limitations">
        <ul className="list-disc list-inside space-y-1.5">
          <li>The dataset size is limited to 800 observations, which may constrain generalization.</li>
          <li>
            The environmental and agronomic feature values were synthetically generated based
            on empirically validated agronomic models; real-world dataset results may differ.
          </li>
          <li>Model performance may vary across different crop types, climates, and geographic regions.</li>
          <li>Prediction quality depends directly on the accuracy and representativeness of input values.</li>
          <li>
            The system is a decision-support tool and does not replace professional agricultural
            advice, field expertise, or domain-specific crop models.
          </li>
          <li>
            A moderate R² of ~0.52 indicates that approximately half the variance in crop yield
            is explained by the model; other unobserved factors also influence yield.
          </li>
        </ul>
      </Section>

      {/* Future Enhancements */}
      <Section icon={Rocket} title="Future Enhancements">
        <ul className="list-disc list-inside space-y-1.5">
          <li>Integration of larger real-world agricultural datasets from government and research sources.</li>
          <li>Development of crop-specific models (wheat, rice, maize, etc.) for targeted predictions.</li>
          <li>Real-time weather API integration to auto-populate temperature and rainfall fields.</li>
          <li>Incorporation of satellite imagery and NDVI data for field-level analysis.</li>
          <li>IoT soil sensor integration for automated soil quality parameter collection.</li>
          <li>Regional and seasonal crop analysis with multi-year trend visualization.</li>
          <li>Periodic model retraining pipeline as new agricultural data becomes available.</li>
          <li>Agricultural monitoring dashboard with alert systems for unfavorable conditions.</li>
        </ul>
      </Section>
    </div>
  );
}
