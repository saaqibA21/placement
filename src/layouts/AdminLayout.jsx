import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import { LayoutDashboard, Briefcase, FileSearch, FileSpreadsheet, Users } from 'lucide-react';

const ADMIN_BOTTOM_NAV_ITEMS = [
  { to: '/admin/dashboard',   icon: LayoutDashboard, label: 'Dash'    },
  { to: '/admin/jobs',        icon: Briefcase,       label: 'Drives'  },
  { to: '/admin/resumes',     icon: FileSearch,      label: 'Screen'  },
  { to: '/admin/bulk-rounds', icon: FileSpreadsheet, label: 'Rounds'  },
  { to: '/admin/students',    icon: Users,           label: 'Students'},
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--canvas-bg)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay with smooth backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div className="w-[245px] max-w-[80vw] h-full flex-shrink-0 shadow-2xl z-10 animate-slide-right">
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div 
            className="flex-1 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
            aria-label="Close menu backdrop"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0" style={{ background: 'var(--canvas-bg)' }}>
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (< 768px) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 z-30 flex items-center justify-around px-2 shadow-lg">
          {ADMIN_BOTTOM_NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-all duration-150 ${
                  isActive
                    ? 'text-teal-900 scale-105 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-lg transition-colors ${
                      isActive ? 'bg-teal-100 text-teal-900' : 'text-slate-500'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="mt-0.5 tracking-tight">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
