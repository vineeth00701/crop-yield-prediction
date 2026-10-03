import { Menu, Leaf } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/':          'Home',
  '/dashboard': 'Dashboard',
  '/predict':   'Yield Prediction',
  '/analysis':  'Environmental Analysis',
  '/model':     'Model Performance',
  '/history':   'Prediction History',
  '/about':     'About Project',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'AgriPredict';

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between
                        sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-semibold text-gray-900 text-lg">{title}</h1>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-forest-50 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-forest-500 rounded-full animate-pulse-slow" />
          <span className="text-xs font-medium text-forest-700">Gradient Boosting Model</span>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-forest-600 to-forest-800 rounded-lg
                        flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
}
