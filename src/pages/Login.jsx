import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react';

const DEMO_CREDS = [
  { label: 'Student — Saaqib', u: 'saaqib', p: 'student123' },
  { label: 'Student — Priya',  u: 'priya',  p: 'student123' },
  { label: 'Admin',            u: 'admin',  p: 'admin123'   },
];

export default function Login() {
  const { login, loginError, setLoginError } = useApp();
  const [tab, setTab]     = useState('student');
  const [u, setU]         = useState('');
  const [p, setP]         = useState('');
  const [showPw, setShow] = useState(false);

  const fill = (cred) => {
    setU(cred.u);
    setP(cred.p);
    setLoginError('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!u || !p) { setLoginError('Please enter both username and password.'); return; }
    login(u, p);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #6B0F0F 0%, #8B1A1A 50%, #5A0A0A 100%)' }}>
      {/* Top Institutional Header */}
      <div className="w-full py-3 px-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg font-cinzel">J</div>
          <div>
            <p className="text-white font-bold text-sm tracking-wide" style={{fontFamily:'Cinzel,serif'}}>Jeppiaar Engineering College</p>
            <p className="text-white/60 text-[10px] tracking-widest uppercase">Placement Cell Portal · AY 2026–27</p>
          </div>
        </div>
        <span className="text-white/40 text-xs hidden sm:block">Semmancheri, Chennai – 600 119</span>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Crest Banner */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
                 style={{ background: 'rgba(201,168,76,0.2)', border: '2px solid rgba(201,168,76,0.4)' }}>
              <GraduationCap size={40} className="text-yellow-300" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{fontFamily:'Cinzel,serif'}}>
              Placement Portal
            </h1>
            <p className="text-white/60 text-sm">Sign in to access your placement dashboard</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
            {/* Tab Toggle */}
            <div className="flex border-b border-gray-100">
              {[
                { key: 'student', icon: GraduationCap, label: 'Student Login' },
                { key: 'admin',   icon: ShieldCheck,   label: 'Admin Login'   },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setU(''); setP(''); setLoginError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                    tab === key
                      ? 'text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  style={tab === key ? { background: '#8B1A1A' } : {}}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={submit} className="p-7 space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl text-sm font-medium text-red-700 bg-red-50 border border-red-200">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={u}
                  onChange={(e) => setU(e.target.value)}
                  className="input-solid"
                  placeholder={tab === 'student' ? 'e.g. saaqib' : 'e.g. admin'}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={p}
                    onChange={(e) => setP(e.target.value)}
                    className="input-solid pr-11"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShow(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-solid-primary w-full py-3 mt-2 text-sm">
                Sign In to Portal
              </button>

              {/* Demo Quick-fill */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Quick Demo Access
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_CREDS.filter(c =>
                    tab === 'admin' ? c.u === 'admin' : c.u !== 'admin'
                  ).map((c) => (
                    <button
                      key={c.u}
                      type="button"
                      onClick={() => fill(c)}
                      className="btn-solid-secondary px-3 py-1.5 text-xs font-medium"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            © {new Date().getFullYear()} Jeppiaar Engineering College. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
