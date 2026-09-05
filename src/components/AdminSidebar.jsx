import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Briefcase, FileSearch, Users, Megaphone, Building2, LogOut, ShieldCheck,
} from 'lucide-react';

const GROUPS = [
  {
    label: 'Executive Overview',
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Placement Dashboard' },
    ],
  },
  {
    label: 'Recruitment Operations',
    items: [
      { to: '/admin/jobs',     icon: Briefcase,   label: 'Manage Drives'     },
      { to: '/admin/resumes',  icon: FileSearch,  label: 'Resume Screening'  },
      { to: '/admin/students', icon: Users,       label: 'Student Directory' },
    ],
  },
  {
    label: 'Portal Management',
    items: [
      { to: '/admin/notices',   icon: Megaphone,   label: 'Broadcast Notices' },
      { to: '/admin/companies', icon: Building2,   label: 'Corporate Partners' },
    ],
  },
];

export default function AdminSidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="flex flex-col w-[235px] flex-shrink-0 h-full select-none"
           style={{ background: 'linear-gradient(180deg, #101028 0%, #1D1D45 60%, #08081A 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* College Identity */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(217,100,47,0.25)', border: '1px solid rgba(217,100,47,0.45)' }}>
            <ShieldCheck size={18} className="text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-[11px] font-bold leading-tight truncate" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:'0.03em' }}>
              Placement Admin
            </p>
            <p className="text-amber-400/80 text-[9.5px] tracking-wider uppercase mt-0.5 font-semibold">Control Panel</p>
          </div>
        </div>

        {/* Admin Badge */}
        {user && (
          <div className="mt-3 p-2.5 rounded-xl border border-white/5" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-amber-300 flex-shrink-0"
                   style={{ background: 'rgba(217,100,47,0.3)' }}>
                A
              </div>
              <div className="min-w-0">
                <p className="text-white text-[11px] font-semibold truncate">{user.name}</p>
                <p className="text-white/40 text-[9.5px] truncate font-mono">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[9px] font-bold uppercase tracking-widest px-2 mb-1.5"
               style={{ color: 'rgba(217,100,47,0.8)' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) => `nav-item-admin ${isActive ? 'active' : ''}`}>
                  <Icon size={15} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="nav-item-admin w-full text-red-300 hover:text-red-200 hover:bg-red-900/30">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
