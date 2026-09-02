import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Home, Briefcase, Building2, Activity, Bell, MessageSquare,
  ClipboardList, User, FileText, CalendarDays, BookOpen, LogOut, GraduationCap,
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
    <aside className="flex flex-col w-[230px] flex-shrink-0 h-full select-none"
           style={{ background: 'linear-gradient(180deg, #6B0F0F 0%, #8B1A1A 60%, #7A1515 100%)' }}>

      {/* College Identity */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(201,168,76,0.25)', border: '1px solid rgba(201,168,76,0.4)' }}>
            <GraduationCap size={18} className="text-yellow-300" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-[11px] font-bold leading-tight truncate" style={{fontFamily:'Cinzel,serif'}}>
              Jeppiaar College
            </p>
            <p className="text-white/40 text-[9.5px] tracking-wider uppercase mt-0.5">Placement Cell</p>
          </div>
        </div>

        {/* Student Badge */}
        {user && (
          <div className="mt-3 p-2.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-yellow-200 flex-shrink-0"
                   style={{ background: 'rgba(201,168,76,0.3)' }}>
                {user.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-white text-[11px] font-semibold truncate">{user.name}</p>
                <p className="text-white/40 text-[9.5px] truncate">{user.rollNo}</p>
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
               style={{ color: 'rgba(201,168,76,0.7)' }}>
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
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="nav-item-light w-full text-red-300 hover:text-red-200 hover:bg-red-900/30">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
