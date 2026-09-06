import { useApp } from '../../context/AppContext';
import { Briefcase, Users, FileText, Trophy, TrendingUp, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { jobs, students, applications, adminStats } = useApp();
  const navigate = useNavigate();

  const openDrives  = jobs.filter((j) => j.status === 'open').length;
  const pendingApps = applications.filter((a) => a.status === 'pending').length;
  const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;

  const METRICS = [
    { label: 'Total Students',    value: adminStats.totalStudents,    icon: Users,      color: '#162E34', path: '/admin/students'  },
    { label: 'Active Drives',     value: openDrives,                  icon: Briefcase,  color: '#15803d', path: '/admin/jobs'      },
    { label: 'Pending Screening', value: pendingApps,                 icon: FileText,   color: '#D9822B', path: '/admin/resumes'   },
    { label: 'Shortlisted',       value: shortlisted,                 icon: Trophy,     color: '#0369a1', path: '/admin/resumes'   },
    { label: 'Offers Extended',   value: adminStats.offersExtended,   icon: TrendingUp, color: '#7c3aed', path: '/admin/students'  },
    { label: 'Placement Rate',    value: `${adminStats.placementRate}%`, icon: TrendingUp, color: '#0891b2', path: '/admin/students' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Banner */}
      <div
        className="rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden shadow-xl border"
        style={{
          background: 'linear-gradient(135deg, #0A191C 0%, #12282D 50%, #162E34 100%)',
          borderColor: 'rgba(217, 130, 43, 0.4)',
          boxShadow: '0 10px 25px -5px rgba(10, 25, 28, 0.5), inset 0 0 20px rgba(217, 130, 43, 0.15)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-amber-300 border border-amber-400/30"
              style={{ background: 'rgba(217, 130, 43, 0.15)' }}
            >
              <ShieldCheck size={13} className="text-amber-400" />
              Placement Operations & Oversight
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Cinzel,serif' }}>
              Executive Dashboard
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">AY 2026–2027 · Real-time placement drive overview</p>
          </div>

          <button
            onClick={() => navigate('/admin/jobs')}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md hover:brightness-110 transition-all flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #D9822B 0%, #B86518 100%)',
              boxShadow: '0 4px 12px rgba(217, 130, 43, 0.35)',
            }}
          >
            Manage Drives <ArrowRight size={14} />
          </button>
        </div>

        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-15 blur-2xl" style={{ background: '#D9822B' }} />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full opacity-15 blur-2xl" style={{ background: '#2C555E' }} />
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.label} onClick={() => navigate(m.path)}
              className="card-solid card-solid-hover p-4 text-left w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl" style={{ background: `${m.color}15` }}>
                  <Icon size={17} style={{ color: m.color }} />
                </div>
                <ArrowRight size={13} className="text-slate-400" />
              </div>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{m.label}</p>
            </button>
          );
        })}
      </div>

      {/* Placement Target Progress */}
      <div className="card-solid bg-white p-5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>Placement Rate Progress</h2>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--amber-pale)', color: '#8C4419', border: '1px solid var(--amber-border)' }}>
            {adminStats.placementRate}% Placed
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
               style={{ width: `${adminStats.placementRate}%`, background: 'linear-gradient(90deg, #162E34, #D9822B)' }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span>{adminStats.offersExtended} offers of {adminStats.totalStudents} students</span>
          <span>Target: 85%</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pending Applications */}
        <div className="card-solid bg-white overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>Pending Applications</h2>
            <button onClick={() => navigate('/admin/resumes')} className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: 'var(--amber-gold)' }}>
              Screen All <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y" style={{ divideColor: 'var(--border)' }}>
            {applications.filter((a) => a.status === 'pending').slice(0, 4).map((a) => (
              <button key={a.id} onClick={() => navigate('/admin/resumes')}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors text-left">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                  {a.studentName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{a.studentName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{a.company} · {a.role}</p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">Pending</span>
              </button>
            ))}
            {applications.filter((a) => a.status === 'pending').length === 0 && (
              <div className="p-5 text-center text-xs text-slate-400">All applications screened! ✓</div>
            )}
          </div>
        </div>

        {/* Active Drives */}
        <div className="card-solid bg-white overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>Active Drives</h2>
            <button onClick={() => navigate('/admin/jobs')} className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: 'var(--amber-gold)' }}>
              Manage <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y" style={{ divideColor: 'var(--border)' }}>
            {jobs.filter((j) => j.status === 'open').slice(0, 4).map((j) => (
              <button key={j.id} onClick={() => navigate('/admin/jobs')}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors text-left">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                     style={{ background: '#15803d' }}>
                  {j.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{j.company}</p>
                  <p className="text-[10px] text-slate-500 truncate">{j.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: 'var(--amber-gold)' }}>{j.salary || 'TBD'}</p>
                  {j.applyBefore && <p className="text-[10px] text-slate-400 flex items-center gap-0.5"><Clock size={9} /> {j.applyBefore}</p>}
                </div>
              </button>
            ))}
            {jobs.filter((j) => j.status === 'open').length === 0 && (
              <div className="p-5 text-center text-xs text-slate-400">No active drives. Launch one!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
