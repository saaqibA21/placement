import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, ChevronRight, LogOut, User, X, Menu } from 'lucide-react';

const BREADCRUMB_MAP = {
  '/student/home':      ['Portal', 'Dashboard'],
  '/student/jobs':      ['Portal', 'Campus Drives'],
  '/student/companies': ['Portal', 'Partner Companies'],
  '/student/tracker':   ['Portal', 'Round Tracker'],
  '/student/notice':    ['Portal', 'Circulars & Notices'],
  '/student/chat':      ['Portal', 'Helpdesk Chat'],
  '/student/survey':    ['Portal', 'Surveys'],
  '/student/profile':   ['Portal', 'My Profile & CV'],
  '/student/requests':  ['Portal', 'Special Requests'],
  '/student/calendar':  ['Portal', 'Drive Calendar'],
  '/student/policy':    ['Portal', 'Placement Policy'],
  '/admin/dashboard':   ['Admin', 'Overview Dashboard'],
  '/admin/jobs':        ['Admin', 'Manage Drives'],
  '/admin/resumes':     ['Admin', 'Resume Screening'],
  '/admin/students':    ['Admin', 'Student Directory'],
  '/admin/notices':     ['Admin', 'Broadcast Notices'],
  '/admin/companies':   ['Admin', 'Corporate Partners'],
};

export default function Header({ onMenuToggle }) {
  const { user, logout, notices } = useApp();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [notifOpen, setNotifOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const crumbs = BREADCRUMB_MAP[location.pathname] || ['Portal'];
  const recentNotices = notices.slice(0, 4);
  const unreadCount   = recentNotices.length;

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white border-b"
            style={{ borderColor: '#EDE0D0' }}>

      {/* Left: Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onMenuToggle && (
          <button onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 md:hidden">
            <Menu size={18} />
          </button>
        )}

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
              <span className={i === crumbs.length - 1 ? 'font-bold text-gray-800' : 'text-gray-400'}>{c}</span>
            </span>
          ))}
        </nav>
        <p className="sm:hidden text-xs font-bold text-gray-800">{crumbs[crumbs.length - 1]}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Academic Year chip — hidden on very small screens */}
        <span className="hidden md:block text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider"
              style={{ background: '#FFF8E7', color: '#7A5C00', border: '1px solid #E8D5B5' }}>
          AY 2026–27
        </span>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <Bell size={17} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#C9A84C' }} />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border z-50"
                 style={{ borderColor: '#EDE0D0' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#EDE0D0' }}>
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Recent Notices</span>
                <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
              {recentNotices.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-gray-400">No notices yet</div>
              ) : (
                <div className="divide-y" style={{ divideColor: '#EDE0D0' }}>
                  {recentNotices.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-amber-50 cursor-pointer transition-colors"
                         onClick={() => { setNotifOpen(false); navigate(user?.role === 'admin' ? '/admin/notices' : '/student/notice'); }}>
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2">{n.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{n.timeAgo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                 style={{ background: '#8B1A1A' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-semibold text-gray-700 hidden sm:block max-w-[100px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border z-50"
                 style={{ borderColor: '#EDE0D0' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: '#EDE0D0' }}>
                <p className="text-xs font-bold text-gray-800">{user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                {user?.role !== 'admin' && (
                  <button onClick={() => { navigate('/student/profile'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    <User size={13} /> My Profile
                  </button>
                )}
                <button onClick={() => { logout(); navigate('/'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
