import { useApp } from '../../context/AppContext';
import { Briefcase, Users, FileText, Trophy, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { jobs, students, applications, adminStats, notices } = useApp();  // ← all real-time from context
  const navigate = useNavigate();

  const openDrives  = jobs.filter((j) => j.status === 'open').length;
  const pendingApps = applications.filter((a) => a.status === 'pending').length;
  const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;

  const METRICS = [
    { label: 'Total Students',    value: adminStats.totalStudents,    icon: Users,      color: '#8B1A1A', path: '/admin/students'  },
    { label: 'Active Drives',     value: openDrives,                  icon: Briefcase,  color: '#15803d', path: '/admin/jobs'      },
    { label: 'Pending Screening', value: pendingApps,                 icon: FileText,   color: '#b45309', path: '/admin/resumes'   },
    { label: 'Shortlisted',       value: shortlisted,                 icon: Trophy,     color: '#1d4ed8', path: '/admin/resumes'   },
    { label: 'Offers Extended',   value: adminStats.offersExtended,   icon: TrendingUp, color: '#7c3aed', path: '/admin/students'  },
    { label: 'Placement Rate',    value: `${adminStats.placementRate}%`, icon: TrendingUp, color: '#0891b2', path: '/admin/students' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Banner */}
      <div className="rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #4A0E0E 0%, #6B0F0F 60%, #8B1A1A 100%)' }}>
        <div className="relative z-10">
          <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-1">Placement Cell</p>
          <h1 className="text-xl sm:text-2xl font-bold" style={{fontFamily:'Cinzel,serif'}}>Executive Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">AY 2026–2027 · Real-time placement drive overview</p>
        </div>
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-10" style={{ background: '#C9A84C' }} />
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
                <ArrowRight size={13} className="text-gray-300" />
              </div>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{m.label}</p>
            </button>
          );
        })}
      </div>

      {/* Placement Target Progress */}
      <div className="card-solid bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900" style={{fontFamily:'Cinzel,serif'}}>Placement Rate Progress</h2>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#FFF0F0', color: '#8B1A1A', border: '1px solid #F5CCCC' }}>
            {adminStats.placementRate}% Placed
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
               style={{ width: `${adminStats.placementRate}%`, background: 'linear-gradient(90deg, #8B1A1A, #C9A84C)' }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{adminStats.offersExtended} offers of {adminStats.totalStudents} students</span>
          <span>Target: 85%</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pending Applications */}
        <div className="card-solid bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#EDE0D0' }}>
            <h2 className="text-sm font-bold text-gray-900" style={{fontFamily:'Cinzel,serif'}}>Pending Applications</h2>
            <button onClick={() => navigate('/admin/resumes')} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#8B1A1A' }}>
              Screen All <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y" style={{ divideColor: '#EDE0D0' }}>
            {applications.filter((a) => a.status === 'pending').slice(0, 4).map((a) => (
              <button key={a.id} onClick={() => navigate('/admin/resumes')}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-amber-50/50 transition-colors text-left">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                     style={{ background: '#8B1A1A' }}>
                  {a.studentName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{a.studentName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{a.company} · {a.role}</p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">Pending</span>
              </button>
            ))}
            {applications.filter((a) => a.status === 'pending').length === 0 && (
              <div className="p-5 text-center text-xs text-gray-400">All applications screened! ✓</div>
            )}
          </div>
        </div>

        {/* Active Drives */}
        <div className="card-solid bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#EDE0D0' }}>
            <h2 className="text-sm font-bold text-gray-900" style={{fontFamily:'Cinzel,serif'}}>Active Drives</h2>
            <button onClick={() => navigate('/admin/jobs')} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#8B1A1A' }}>
              Manage <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y" style={{ divideColor: '#EDE0D0' }}>
            {jobs.filter((j) => j.status === 'open').slice(0, 4).map((j) => (
              <button key={j.id} onClick={() => navigate('/admin/jobs')}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-amber-50/50 transition-colors text-left">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                     style={{ background: '#15803d' }}>
                  {j.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{j.company}</p>
                  <p className="text-[10px] text-gray-400 truncate">{j.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: '#8B1A1A' }}>{j.salary || 'TBD'}</p>
                  {j.applyBefore && <p className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock size={9} /> {j.applyBefore}</p>}
                </div>
              </button>
            ))}
            {jobs.filter((j) => j.status === 'open').length === 0 && (
              <div className="p-5 text-center text-xs text-gray-400">No active drives. Launch one!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
