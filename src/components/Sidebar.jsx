import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Home, Briefcase, Building2, Activity, Bell, MessageSquare,
  ClipboardList, User, FileText, CalendarDays, BookOpen, LogOut,
} from 'lucide-react';

const GROUPS = [
  {
    label: 'Main Workspace',
    items: [
      { to: '/student/home',      icon: Home,          label: 'Dashboard'          },
      { to: '/student/jobs',      icon: Briefcase,     label: 'Recruitment Drives' },
      { to: '/student/companies', icon: Building2,     label: 'Partner Companies'  },
      { to: '/student/tracker',   icon: Activity,      label: 'Round Tracker'      },
    ],
  },
  {
    label: 'Communications',
    items: [
      { to: '/student/notice', icon: Bell,           label: 'Circulars & Notices' },
      { to: '/student/chat',   icon: MessageSquare,  label: 'Helpdesk Chat'       },
      { to: '/student/survey', icon: ClipboardList,  label: 'Surveys'             },
    ],
  },
  {
    label: 'Student Services',
    items: [
      { to: '/student/profile',   icon: User,          label: 'My Profile & CV'    },
      { to: '/student/requests',  icon: FileText,      label: 'Special Requests'   },
      { to: '/student/calendar',  icon: CalendarDays,  label: 'Drive Calendar'     },
      { to: '/student/policy',    icon: BookOpen,      label: 'Placement Policy'   },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="flex flex-col w-[235px] flex-shrink-0 h-full select-none"
           style={{ background: 'linear-gradient(180deg, #0E2024 0%, #162E34 60%, #0B191C 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* University Identity Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10 space-y-3">
        {/* Official Logo Banner */}
        <div className="bg-white rounded-xl p-2 shadow-sm flex items-center justify-center">
          <img
            src="/logo.jpg"
            alt="Jeppiaar University Logo"
            className="h-8 w-auto object-contain"
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">
            Student Portal
          </p>
          <span className="text-white/40 text-[9px] font-mono">AY 2026–27</span>
        </div>

        {/* Student Profile Pill */}
        {user && (
          <div className="p-2.5 rounded-xl border border-white/5" style={{ background: 'rgba(0,0,0,0.35)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-amber-300 flex-shrink-0"
                   style={{ background: 'rgba(217,130,43,0.3)' }}>
                {user.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-white text-[11px] font-semibold truncate">{user.name}</p>
                <p className="text-white/45 text-[9.5px] truncate font-mono">{user.rollNo}</p>
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
               style={{ color: 'rgba(217,130,43,0.85)' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) => `nav-item-light ${isActive ? 'active' : ''}`}>
                  <Icon size={15} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-white/10">
        <button onClick={handleLogout}
          className="nav-item-light w-full text-red-300 hover:text-red-200 hover:bg-red-900/30">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
