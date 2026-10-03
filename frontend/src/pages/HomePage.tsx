import { useNavigate } from 'react-router-dom';
import {
  Leaf, TrendingUp, BarChart2, FlaskConical, Database,
  ArrowRight, CheckCircle2, ChevronRight,
} from 'lucide-react';

const stats = [
  { label: 'Dataset Observations', value: '800',           sub: '2000–2019 period' },
  { label: 'Environmental Features', value: '9',           sub: 'Agronomic inputs'  },
  { label: 'Dataset Period',         value: '20 Years',    sub: '2000 to 2019'      },
  { label: 'Prediction Model',       value: 'Grad. Boost', sub: 'Primary estimator' },
];

const howItWorks = [
  {
    step: '01',
    title: 'Enter Parameters',
    desc: 'Input environmental and agronomic conditions such as rainfall, temperature, soil nutrients, and irrigation hours.',
  },
  {
    step: '02',
    title: 'Model Processing',
    desc: 'Data passes through the trained Gradient Boosting Regressor pipeline including feature scaling and prediction.',
  },
  {
    step: '03',
    title: 'Yield Estimation',
    desc: 'The model generates an estimated crop yield in kg/ha based on the submitted environmental conditions.',
  },
  {
    step: '04',
    title: 'Analyze Results',
    desc: 'Review the prediction alongside environmental factor analysis and model performance metrics.',
  },
];

const features = [
  {
    icon: BarChart2,
    title: 'Environmental Analysis',
    desc: 'Explore distributions and correlations of 9 key environmental and agronomic features.',
  },
  {
    icon: TrendingUp,
    title: 'Machine Learning Prediction',
    desc: 'Gradient Boosting Regressor trained on 800 observations across 40 agricultural regions.',
  },
  {
    icon: FlaskConical,
    title: 'Model Evaluation',
    desc: 'Transparent reporting of model performance: R², RMSE, MAE, and feature importances.',
  },
  {
    icon: Database,
    title: 'Agricultural Insights',
    desc: 'Understand which factors drive crop yield and their statistical association with output.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 animate-slide-up">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-hero text-white">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 px-10 py-16 md:px-16 md:py-20 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
                          rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Leaf className="w-4 h-4 text-green-300" />
            Phase 4 Final Implementation · Data Sciences Mini Project
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            AgriPredict
          </h1>
          <p className="text-xl md:text-2xl text-green-200 font-light mb-4">
            Intelligent Crop Yield Estimation Through Environmental Data
          </p>
          <p className="text-white/75 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
            A machine learning application that estimates agricultural crop yield
            using environmental and agronomic factors. Built on a Gradient Boosting
            Regressor trained on 800 observations across 40 regions (2000–2019).
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              id="btn-start-prediction"
              onClick={() => navigate('/predict')}
              className="flex items-center gap-2 bg-white text-forest-800 font-semibold
                         px-6 py-3 rounded-xl hover:bg-green-50 transition-all duration-200
                         active:scale-[0.98]"
            >
              Start Prediction <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="btn-explore-analytics"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white
                         font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-200
                         active:scale-[0.98] backdrop-blur-sm"
            >
              Explore Analytics
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl font-extrabold text-forest-700 mb-1">{s.value}</div>
              <div className="text-sm font-semibold text-gray-700">{s.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">How AgriPredict Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A straightforward pipeline from environmental input to crop yield estimation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step, idx) => (
            <div key={step.step} className="card relative">
              <div className="text-5xl font-black text-forest-100 leading-none mb-3">{step.step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              {idx < howItWorks.length - 1 && (
                <ChevronRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2
                                         w-8 h-8 text-gray-200 z-10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Application Features</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Explore each module of the AgriPredict application.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card flex gap-4">
              <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-forest-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="card bg-gradient-card border-forest-200 flex flex-col md:flex-row
                           items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-forest-600" />
            <span className="font-semibold text-forest-800">Ready to estimate crop yield?</span>
          </div>
          <p className="text-sm text-gray-600">
            Enter your environmental conditions and get an instant prediction from the trained model.
          </p>
        </div>
        <button
          onClick={() => navigate('/predict')}
          className="btn-primary whitespace-nowrap flex-shrink-0"
        >
          Make a Prediction
        </button>
      </section>
    </div>
  );
}
