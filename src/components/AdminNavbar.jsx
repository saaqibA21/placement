import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Users, Bell, Building2, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/jobs', label: 'Post Jobs', icon: Briefcase },
  { to: '/admin/resumes', label: 'Resumes', icon: FileText },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/notices', label: 'Notices', icon: Bell },
  { to: '/admin/companies', label: 'Companies', icon: Building2 },
];

export default function AdminNavbar() {
  const { logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#1a1a1a]">
      <div className="flex items-center h-12 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6 flex-shrink-0">
          <span className="text-white font-bold text-xl font-serif italic">j</span>
          <span className="text-green-400 text-xs font-semibold bg-green-400/10 px-2 py-0.5 rounded">ADMIN</span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-1 flex-1">
          {adminLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-black font-medium'
                    : 'text-gray-300 hover:text-white'
                }`
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors ml-4"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  );
}
