import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Circle, Search } from 'lucide-react';

const STAGE_CYCLE = ['upcoming', 'pending', 'cleared'];

export default function Tracker() {
  const { trackerData, setTrackerData } = useApp();
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('All');

  const advanceRound = (companyId, roundIdx) => {
    setTrackerData((prev) =>
      prev.map((c) => {
        if (c.id !== companyId) return c;
        const rounds = c.rounds.map((r, i) => {
          if (i !== roundIdx) return r;
          const next = STAGE_CYCLE[(STAGE_CYCLE.indexOf(r.status) + 1) % STAGE_CYCLE.length];
          return {
            ...r, status: next,
            date: next !== 'upcoming'
              ? new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' })
              : null,
          };
        });
        return { ...c, rounds };
      })
    );
  };

  const getProgress = (rounds) =>
    Math.round((rounds.filter((r) => r.status === 'cleared').length / rounds.length) * 100);

  const filtered = trackerData.filter((c) => {
    if (search && !c.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'In Review') return c.rounds.some((r) => r.status === 'pending');
    if (filter === 'Cleared Any') return c.rounds.some((r) => r.status === 'cleared');
    if (filter === 'Offer') return c.rounds[c.rounds.length - 1].status === 'cleared';
    return true;
  });

  const stagesCleared = trackerData.reduce((acc, c) => acc + c.rounds.filter((r) => r.status === 'cleared').length, 0);
  const activeReview  = trackerData.filter((c) => c.rounds.some((r) => r.status === 'pending')).length;
  const offersCount   = trackerData.filter((c) => c.rounds[c.rounds.length - 1].status === 'cleared').length;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900" style={{fontFamily:"'Bebas Neue',sans-serif", letterSpacing:'0.03em'}}>Application Round Tracker</h1>
        <p className="text-gray-500 text-xs mt-0.5">Click any round to advance its status.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Applied',    value: trackerData.length, color: '#D9642F' },
          { label: 'Stages Cleared',   value: stagesCleared,      color: '#15803d' },
          { label: 'In Active Review', value: activeReview,       color: '#b45309' },
          { label: 'Offers Received',  value: offersCount,        color: '#1d4ed8' },
        ].map((s) => (
          <div key={s.label} className="card-solid p-3.5 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card-solid p-3 bg-white flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search company..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-solid pl-8 py-2 text-xs" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['All', 'In Review', 'Cleared Any', 'Offer'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`tab-light text-xs ${filter === f ? 'active' : ''}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((c) => {
          const pct   = getProgress(c.rounds);
          const isOpen = expanded === c.id;
          return (
            <div key={c.id} className="card-solid bg-white overflow-hidden">
              <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-amber-50/30 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : c.id)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${c.color}`}>
                  {c.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-gray-900 text-sm">{c.company}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: '#F7ECDD', color: '#7A4A18', border: '1px solid #E3C9A8' }}>
                      {c.jobType}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[10px] mt-0.5">{c.date}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                           style={{ width: `${pct}%`, background: pct === 100 ? '#15803d' : '#D9642F' }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{pct}%</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: '#D9E3E0' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-4 mb-3">
                    Selection Rounds — click to update status
                  </p>
                  <div className="space-y-2">
                    {c.rounds.map((r, idx) => (
                      <button key={idx} onClick={() => advanceRound(c.id, idx)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl border transition-all hover:border-red-200 hover:bg-red-50/30 text-left"
                        style={{ borderColor: '#D9E3E0' }}>
                        <div className="flex-shrink-0">
                          {r.status === 'cleared' ? (
                            <CheckCircle2 size={20} className="text-green-600" />
                          ) : r.status === 'pending' ? (
                            <Clock size={20} className="text-amber-500" />
                          ) : (
                            <Circle size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${r.status === 'cleared' ? 'text-green-700' : r.status === 'pending' ? 'text-amber-700' : 'text-gray-400'}`}>
                            {r.name}
                          </p>
                          {r.date && <p className="text-[10px] text-gray-400 mt-0.5">{r.date}</p>}
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${
                          r.status === 'cleared' ? 'bg-green-50 text-green-700 border border-green-200'
                          : r.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                          {r.status === 'cleared' ? 'Cleared ✓' : r.status === 'pending' ? 'In Progress' : 'Upcoming'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
