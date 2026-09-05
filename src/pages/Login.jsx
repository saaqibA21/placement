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
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, #0A0A1F 0%, #12122B 45%, #1B1B3D 75%, #0A0A1F 100%)`,
      }}
    >
      {/* Retro film-grain / scanline overlay */}
      <div className="retro-grain" />

      {/* Top Institutional Header */}
      <div className="w-full py-3.5 px-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/30 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 font-bold text-lg font-retro shadow-lg"
            style={{ background: 'rgba(217, 100, 47, 0.22)', border: '1.5px solid rgba(217, 100, 47, 0.45)' }}
          >
            J
          </div>
          <div>
            <p className="text-white font-retro text-base leading-none">
              Jeppiaar Engineering College
            </p>
            <p className="retro-tag text-amber-400/85 text-[10px] mt-1">
              Placement Cell Portal · AY 2026–27
            </p>
          </div>
        </div>
        <span className="retro-tag text-white/40 text-[10px] hidden sm:block">Semmancheri, Chennai – 600 119</span>
      </div>

      {/* Hero & Login Section */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-8 max-w-6xl mx-auto w-full relative z-10">
        {/* Left Hero Text / Retro Poster Block */}
        <div className="text-center lg:text-left flex-1 max-w-lg text-white space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full retro-tag text-[11px] text-amber-300 border border-amber-400/30 backdrop-blur-md"
            style={{ background: 'rgba(217, 100, 47, 0.15)' }}
          >
            <Sparkles size={14} className="text-amber-400" /> Official Placement Drive Hub
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-retro text-white leading-[0.95] drop-shadow-md">
            Your Journey
            <br />
            <span className="text-amber-400 drop-shadow-[0_2px_16px_rgba(217,100,47,0.55)]">
              Starts Here!
            </span>
          </h1>

          <p className="text-slate-200/80 text-sm sm:text-base leading-relaxed normal-case max-w-md mx-auto lg:mx-0">
            Your Journey Starts with the Right Choice. Access campus recruitment drives, upload your CV, track selection rounds, and secure top tier placements.
          </p>

          <div className="hidden sm:flex items-center gap-6 pt-3 mt-1 retro-dashed text-xs text-slate-300/80">
            <div className="flex items-center gap-2 pt-3">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="retro-tag text-[10px]">100+ Hiring Partners</span>
            </div>
            <div className="flex items-center gap-2 pt-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="retro-tag text-[10px]">Live Drive Tracker</span>
            </div>
            <div className="flex items-center gap-2 pt-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="retro-tag text-[10px]">Direct Screening</span>
            </div>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="w-full max-w-md">
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border-2"
            style={{ borderColor: 'rgba(217, 100, 47, 0.4)', boxShadow: '0 20px 45px -15px rgba(0,0,0,0.6)' }}
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
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 retro-tag text-[11px] sm:text-xs transition-all ${
                    tab === key
                      ? 'text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  style={
                    tab === key
                      ? { background: 'linear-gradient(135deg, #1B1B3D 0%, #262654 100%)' }
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
                className="w-full py-3 mt-2 retro-tag text-xs sm:text-sm text-white rounded-xl shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D9642F 0%, #A6461C 100%)',
                  boxShadow: '0 4px 14px rgba(217, 100, 47, 0.4)',
                }}
              >
                Sign In to {tab === 'student' ? 'Student Portal' : 'Placement Admin'}
              </button>

              {/* Demo Quick-fill */}
              <div className="pt-3 border-t border-slate-200/80">
                <p className="retro-tag text-[10px] text-slate-400 mb-2">
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

          <div className="flex items-center justify-between mt-4 px-1">
            <p className="retro-tag text-white/35 text-[10px]">
              © {new Date().getFullYear()} Jeppiaar Engineering
            </p>
            <p className="retro-tag text-amber-400/50 text-[10px]">
              Drive Rec. No. 001 · AY 2026–27
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
