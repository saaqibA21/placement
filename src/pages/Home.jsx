import { useApp } from '../context/AppContext';
import { Briefcase, CheckCircle2, Activity, Bell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, jobs, notices, trackerData } = useApp();   // ← all from shared context
  const navigate = useNavigate();

  const openJobs     = jobs.filter((j) => j.status === 'open' && j.eligible);
  const appliedJobs  = jobs.filter((j) => j.applied);
  const activeRounds = trackerData.filter((c) => c.rounds.some((r) => r.status === 'pending'));
  const recentNotices = notices.slice(0, 3);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #6B0F0F 0%, #8B1A1A 60%, #9B2335 100%)' }}>
        <div className="relative z-10">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back,</p>
          <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{fontFamily:'Cinzel,serif'}}>
            {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/60 text-sm">{user?.branch} · Batch {user?.batch} · CGPA {user?.cgpa}</p>
        </div>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10" style={{ background: '#C9A84C' }} />
        <div className="absolute right-8 -bottom-12 w-32 h-32 rounded-full opacity-10" style={{ background: '#C9A84C' }} />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open Drives',   value: openJobs.length,     color: '#8B1A1A', path: '/student/jobs',    icon: Briefcase    },
          { label: 'Applied',       value: appliedJobs.length,  color: '#15803d', path: '/student/jobs',    icon: CheckCircle2 },
          { label: 'Active Rounds', value: activeRounds.length, color: '#b45309', path: '/student/tracker', icon: Activity     },
          { label: 'Notices',       value: notices.length,      color: '#1d4ed8', path: '/student/notice',  icon: Bell         },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.label} onClick={() => navigate(m.path)}
              className="card-solid card-solid-hover p-4 text-left w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl" style={{ background: `${m.color}15` }}>
                  <Icon size={16} style={{ color: m.color }} />
                </div>
                <ArrowRight size={13} className="text-gray-300" />
              </div>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{m.label}</p>
            </button>
          );
        })}
      </div>

      {/* Two Column: Open Drives + Recent Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Open Drives */}
        <div className="card-solid bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#EDE0D0' }}>
            <h2 className="text-sm font-bold text-gray-900" style={{fontFamily:'Cinzel,serif'}}>Open Drives</h2>
            <button onClick={() => navigate('/student/jobs')} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#8B1A1A' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          {openJobs.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">No open drives right now. Check back soon!</div>
          ) : (
            <div className="divide-y" style={{ divideColor: '#EDE0D0' }}>
              {openJobs.slice(0, 4).map((job) => (
                <button key={job.id} onClick={() => navigate('/student/jobs')}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-amber-50/50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#8B1A1A' }}>
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{job.company}</p>
                    <p className="text-[10px] text-gray-400 truncate">{job.role}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold" style={{ color: '#8B1A1A' }}>{job.salary}</p>
                    <p className="text-[10px] text-gray-400">{job.jobType}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notices */}
        <div className="card-solid bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#EDE0D0' }}>
            <h2 className="text-sm font-bold text-gray-900" style={{fontFamily:'Cinzel,serif'}}>Recent Circulars</h2>
            <button onClick={() => navigate('/student/notice')} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#8B1A1A' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          {recentNotices.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">No circulars published yet.</div>
          ) : (
            <div className="divide-y" style={{ divideColor: '#EDE0D0' }}>
              {recentNotices.map((n) => (
                <button key={n.id} onClick={() => navigate('/student/notice')}
                  className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-amber-50/50 transition-colors text-left">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${n.authorColor}`}>
                    {n.authorInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 line-clamp-2">{n.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.timeAgo}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
