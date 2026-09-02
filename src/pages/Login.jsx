import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

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
    <div
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15, 33, 37, 0.82) 0%, rgba(22, 46, 52, 0.88) 50%, rgba(10, 22, 25, 0.94) 100%), url('/bg-hero.jpg')`,
      }}
    >
      {/* Top Institutional Header */}
      <div className="w-full py-3.5 px-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 font-bold text-lg font-cinzel shadow-lg"
            style={{ background: 'rgba(217, 130, 43, 0.25)', border: '1px solid rgba(217, 130, 43, 0.4)' }}
          >
            J
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: 'Cinzel,serif' }}>
              Jeppiaar Engineering College
            </p>
            <p className="text-amber-300/80 text-[10px] tracking-widest uppercase font-semibold">
              Placement Cell Portal · AY 2026–27
            </p>
          </div>
        </div>
        <span className="text-white/50 text-xs hidden sm:block font-medium">Semmancheri, Chennai – 600 119</span>
      </div>

      {/* Hero & Login Section */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-8 max-w-6xl mx-auto w-full">
        {/* Left Hero Text / Chalkboard Highlight */}
        <div className="text-center lg:text-left flex-1 max-w-lg text-white space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 border border-amber-400/30 backdrop-blur-md"
            style={{ background: 'rgba(217, 130, 43, 0.15)' }}
          >
            <Sparkles size={14} className="text-amber-400" /> Official Placement Drive Hub
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md"
            style={{ fontFamily: 'Cinzel,serif' }}
          >
            Your Journey <br />
            <span className="text-amber-400 drop-shadow-[0_2px_10px_rgba(217,130,43,0.5)]">
              Starts Here!
            </span>
          </h1>

          <p className="text-slate-200/80 text-sm sm:text-base leading-relaxed">
            Your Journey Starts with the Right Choice. Access campus recruitment drives, upload your CV, track selection rounds, and secure top tier placements.
          </p>

          <div className="hidden sm:flex items-center gap-6 pt-2 text-xs text-slate-300/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>100+ Hiring Partners</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Live Drive Tracker</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Direct Screening</span>
            </div>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="w-full max-w-md">
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border"
            style={{ borderColor: 'rgba(217, 130, 43, 0.35)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}
          >
            {/* Tab Toggle */}
            <div className="flex border-b border-slate-200/80 bg-slate-50/80">
              {[
                { key: 'student', icon: GraduationCap, label: 'Student Portal' },
                { key: 'admin',   icon: ShieldCheck,   label: 'Admin Cell'   },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setU(''); setP(''); setLoginError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs sm:text-sm font-semibold transition-all ${
                    tab === key
                      ? 'text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  style={
                    tab === key
                      ? { background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }
                      : {}
                  }
                >
                  <Icon size={16} className={tab === key ? 'text-amber-400' : ''} />
                  {label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={submit} className="p-6 sm:p-7 space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl text-xs sm:text-sm font-medium text-red-700 bg-red-50 border border-red-200">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={u}
                  onChange={(e) => setU(e.target.value)}
                  className="input-solid text-xs sm:text-sm"
                  placeholder={tab === 'student' ? 'e.g. saaqib' : 'e.g. admin'}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={p}
                    onChange={(e) => setP(e.target.value)}
                    className="input-solid pr-11 text-xs sm:text-sm"
                    placeholder="Enter your portal password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D9822B 0%, #B86518 100%)',
                  boxShadow: '0 4px 14px rgba(217, 130, 43, 0.4)',
                }}
              >
                Sign In to {tab === 'student' ? 'Student Portal' : 'Placement Admin'}
              </button>

              {/* Demo Quick-fill */}
              <div className="pt-3 border-t border-slate-200/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-amber-50 hover:border-amber-300 text-slate-700 border border-slate-200 transition-all"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <p className="text-center text-white/40 text-[11px] mt-4 font-medium">
            © {new Date().getFullYear()} Jeppiaar Engineering College. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
