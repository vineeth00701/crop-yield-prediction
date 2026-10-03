import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart2,
  FlaskConical,
  History,
  Info,
  Leaf,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',               icon: LayoutDashboard },
  { to: '/predict',    label: 'Yield Prediction',         icon: TrendingUp       },
  { to: '/analysis',   label: 'Environmental Analysis',   icon: BarChart2        },
  { to: '/model',      label: 'Model Performance',        icon: FlaskConical     },
  { to: '/history',    label: 'Prediction History',       icon: History          },
  { to: '/about',      label: 'About Project',            icon: Info             },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'open translate-x-0' : ''} transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 bg-gradient-to-br from-forest-600 to-forest-800 rounded-xl
                            flex items-center justify-center shadow-md flex-shrink-0">
              <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base leading-tight">AgriPredict</div>
              <div className="text-[10px] text-gray-400 leading-tight mt-0.5 font-medium tracking-wide uppercase">
                Crop Yield Estimation
              </div>
            </div>
          </NavLink>
          {/* Mobile close button */}
          <button
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">
            Navigation
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-forest-50 rounded-xl p-3 text-center">
            <p className="text-xs font-semibold text-forest-800">Phase 4 Implementation</p>
            <p className="text-[10px] text-forest-600 mt-0.5">Agricultural Data Science Project</p>
          </div>
        </div>
      </aside>
    </>
  );
}
