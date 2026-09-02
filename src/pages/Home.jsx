import { useApp } from '../context/AppContext';
import { Briefcase, CheckCircle2, Activity, Bell, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, jobs, notices, trackerData } = useApp();
  const navigate = useNavigate();

  const openJobs     = jobs.filter((j) => j.status === 'open' && j.eligible);
  const appliedJobs  = jobs.filter((j) => j.applied);
  const activeRounds = trackerData.filter((c) => c.rounds.some((r) => r.status === 'pending'));
  const recentNotices = notices.slice(0, 3);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Welcome Hero Banner styled like the illuminated chalkboard */}
      <div
        className="rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden shadow-xl border"
        style={{
          background: 'linear-gradient(135deg, #0F2125 0%, #162E34 50%, #1F4047 100%)',
          borderColor: 'rgba(217, 130, 43, 0.4)',
          boxShadow: '0 10px 25px -5px rgba(15, 33, 37, 0.4), inset 0 0 20px rgba(217, 130, 43, 0.15)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-amber-300 border border-amber-400/30"
              style={{ background: 'rgba(217, 130, 43, 0.15)' }}
            >
              <Sparkles size={13} className="text-amber-400" />
              Your Journey Starts Here!
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Cinzel,serif' }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              {user?.branch} · Batch {user?.batch} · CGPA <span className="text-amber-400 font-bold">{user?.cgpa}</span>
            </p>
          </div>

          <button
            onClick={() => navigate('/student/jobs')}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md hover:brightness-110 transition-all flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #D9822B 0%, #B86518 100%)',
              boxShadow: '0 4px 12px rgba(217, 130, 43, 0.35)',
            }}
          >
            Explore Drives <ArrowRight size={14} />
          </button>
        </div>

        {/* Decorative ambient lighting */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-15 blur-2xl" style={{ background: '#D9822B' }} />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full opacity-15 blur-2xl" style={{ background: '#2C555E' }} />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open Drives',   value: openJobs.length,     color: '#162E34', path: '/student/jobs',    icon: Briefcase    },
          { label: 'Applied',       value: appliedJobs.length,  color: '#15803d', path: '/student/jobs',    icon: CheckCircle2 },
          { label: 'Active Rounds', value: activeRounds.length, color: '#D9822B', path: '/student/tracker', icon: Activity     },
          { label: 'Notices',       value: notices.length,      color: '#0284c7', path: '/student/notice',  icon: Bell         },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.label} onClick={() => navigate(m.path)}
              className="card-solid card-solid-hover p-4 text-left w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl" style={{ background: `${m.color}15` }}>
                  <Icon size={16} style={{ color: m.color }} />
                </div>
                <ArrowRight size={13} className="text-slate-400" />
              </div>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{m.label}</p>
            </button>
          );
        })}
      </div>

      {/* Two Column: Open Drives + Recent Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Open Drives */}
        <div className="card-solid bg-white overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>Open Drives</h2>
            <button onClick={() => navigate('/student/jobs')} className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: 'var(--amber-gold)' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          {openJobs.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No open drives right now. Check back soon!</div>
          ) : (
            <div className="divide-y" style={{ divideColor: 'var(--border)' }}>
              {openJobs.slice(0, 4).map((job) => (
                <button key={job.id} onClick={() => navigate('/student/jobs')}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors text-left">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                       style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{job.company}</p>
                    <p className="text-[10px] text-slate-500 truncate">{job.role}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold" style={{ color: 'var(--amber-gold)' }}>{job.salary}</p>
                    <p className="text-[10px] text-slate-400">{job.jobType}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notices */}
        <div className="card-solid bg-white overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>Recent Circulars</h2>
            <button onClick={() => navigate('/student/notice')} className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: 'var(--amber-gold)' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          {recentNotices.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No circulars published yet.</div>
          ) : (
            <div className="divide-y" style={{ divideColor: 'var(--border)' }}>
              {recentNotices.map((n) => (
                <button key={n.id} onClick={() => navigate('/student/notice')}
                  className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors text-left">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${n.authorColor}`}>
                    {n.authorInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 line-clamp-2">{n.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{n.timeAgo}</p>
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
