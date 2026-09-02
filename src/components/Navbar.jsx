import { NavLink, useNavigate } from 'react-router-dom';
import { Grid3x3, Sun, User, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

const navLinks = [
  { to: '/student/home', label: 'Home' },
  { to: '/student/companies', label: 'Companies' },
  { to: '/student/jobs', label: 'Jobs' },
  { to: '/student/profile', label: 'Profile' },
  { to: '/student/tracker', label: 'Tracker' },
  { to: '/student/chat', label: 'Chat' },
  { to: '/student/survey', label: 'Survey' },
  { to: '/student/requests', label: 'Requests' },
  { to: '/student/calendar', label: 'Calendar' },
  { to: '/student/notice', label: 'Notice' },
  { to: '/student/policy', label: 'Policy' },
];

export default function Navbar() {
  const { logout } = useApp();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#1a1a1a]">
      <div className="flex items-center h-12 px-4">
        {/* Logo */}
        <div className="flex-shrink-0 mr-6">
          <span className="text-white font-bold text-xl font-serif italic">j</span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-black font-medium'
                    : 'text-gray-300 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-3 ml-4 relative">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Grid3x3 size={18} />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Sun size={18} />
          </button>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <User size={18} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-1 w-36 shadow-xl z-50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2a2a2a] transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
