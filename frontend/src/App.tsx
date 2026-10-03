import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage       from './pages/HomePage';
import DashboardPage  from './pages/DashboardPage';
import PredictPage    from './pages/PredictPage';
import ResultPage     from './pages/ResultPage';
import AnalysisPage   from './pages/AnalysisPage';
import ModelPage      from './pages/ModelPage';
import HistoryPage    from './pages/HistoryPage';
import AboutPage      from './pages/AboutPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Pages with sidebar layout */}
        <Route element={<Layout />}>
          <Route path="/"          element={<HomePage />}      />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/predict"   element={<PredictPage />}   />
          <Route path="/predict/result" element={<ResultPage />} />
          <Route path="/analysis"  element={<AnalysisPage />}  />
          <Route path="/model"     element={<ModelPage />}     />
          <Route path="/history"   element={<HistoryPage />}   />
          <Route path="/about"     element={<AboutPage />}     />
        </Route>
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
