import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Circle, XCircle, Search, LayoutList, Table2 } from 'lucide-react';

const ROUND_ICON = { cleared: CheckCircle2, pending: Clock, rejected: XCircle };
const ROUND_COLOR = { cleared: 'text-green-600', pending: 'text-amber-500', rejected: 'text-rose-600' };
const ROUND_BADGE = {
  cleared: 'bg-green-50 text-green-700 border border-green-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
};
const ROUND_LABEL = { cleared: 'Cleared ✓', pending: 'In Progress', rejected: 'Rejected ✕' };

function currentRound(rounds) {
  return rounds.find((r) => r.status === 'pending' || r.status === 'rejected') || rounds[rounds.length - 1];
}

export default function Tracker() {
  const { trackerData } = useApp();
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('All');
  const [view, setView]         = useState('list'); // list | table

  const getProgress = (rounds) =>
    Math.round((rounds.filter((r) => r.status === 'cleared').length / rounds.length) * 100);

  const filtered = trackerData.filter((c) => {
    if (search && !c.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'In Review') return c.rounds.some((r) => r.status === 'pending');
    if (filter === 'Cleared Any') return c.rounds.some((r) => r.status === 'cleared');
    if (filter === 'Offer') return c.rounds[c.rounds.length - 1].status === 'cleared';
    if (filter === 'Rejected') return c.rounds.some((r) => r.status === 'rejected');
    return true;
  });

  const stagesCleared = trackerData.reduce((acc, c) => acc + c.rounds.filter((r) => r.status === 'cleared').length, 0);
  const activeReview  = trackerData.filter((c) => c.rounds.some((r) => r.status === 'pending')).length;
  const offersCount   = trackerData.filter((c) => c.rounds[c.rounds.length - 1].status === 'cleared').length;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
            Application Round Tracker
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Track your selection stages and interview progress across applied drives.</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl border bg-white" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === 'list' ? 'text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            style={view === 'list' ? { background: 'var(--amber-gold)' } : {}}>
            <LayoutList size={13} /> List
          </button>
          <button onClick={() => setView('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === 'table' ? 'text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            style={view === 'table' ? { background: 'var(--amber-gold)' } : {}}>
            <Table2 size={13} /> Table
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Applied',    value: trackerData.length, color: '#162E34' },
          { label: 'Stages Cleared',   value: stagesCleared,      color: '#15803d' },
          { label: 'In Active Review', value: activeReview,       color: '#b45309' },
          { label: 'Offers Received',  value: offersCount,        color: '#0284c7' },
        ].map((s) => (
          <div key={s.label} className="card-solid p-3.5 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card-solid p-3 bg-white flex flex-col sm:flex-row gap-3 items-center" style={{ borderColor: 'var(--border)' }}>
        <div className="relative flex-1 w-full">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search company..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-solid pl-8 py-2 text-xs" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['All', 'In Review', 'Cleared Any', 'Offer', 'Rejected'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`tab-light text-xs ${filter === f ? 'active' : ''}`}>{f}</button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <div className="card-solid bg-white overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[560px]">
              <thead className="bg-slate-50 border-b text-slate-400 font-bold text-[10px] uppercase tracking-wider" style={{ borderColor: 'var(--border)' }}>
                <tr>
                  {['Company', 'Type', 'Current Round', 'Status', 'Progress'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-16 text-slate-400">No applications match current filters</td></tr>
                ) : filtered.map((c) => {
                  const round = currentRound(c.rounds);
                  const pct = getProgress(c.rounds);
                  return (
                    <tr key={c.id} className="table-row-light">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${c.color || 'bg-emerald-700'}`}>
                            {c.initial}
                          </div>
                          <span className="font-bold text-slate-900">{c.company}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold whitespace-nowrap">{c.jobType}</td>
                      <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{round?.name}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ROUND_BADGE[round?.status] || 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                          {ROUND_LABEL[round?.status] || 'Upcoming'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 w-28">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? '#15803d' : 'linear-gradient(90deg, #162E34, #D9822B)' }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
      <div className="space-y-3">
        {filtered.map((c) => {
          const pct   = getProgress(c.rounds);
          const isOpen = expanded === c.id;
          return (
            <div key={c.id} className="card-solid bg-white overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : c.id)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-xs ${c.color || 'bg-emerald-700'}`}>
                  {c.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm">{c.company}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: 'var(--amber-pale)', color: '#8C4419', border: '1px solid var(--amber-border)' }}>
                      {c.jobType}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] mt-0.5">{c.date}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                           style={{ width: `${pct}%`, background: pct === 100 ? '#15803d' : 'linear-gradient(90deg, #162E34, #D9822B)' }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mt-4 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Official Recruitment Stages & Evaluation
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">Verified by Placement Cell</span>
                  </div>
                  <div className="space-y-2">
                    {c.rounds.map((r, idx) => {
                      const Icon = ROUND_ICON[r.status] || Circle;
                      return (
                      <div key={idx}
                        className="w-full flex items-center gap-4 p-3 rounded-xl border transition-all bg-slate-50/40 text-left"
                        style={{ borderColor: 'var(--border)' }}>
                        <div className="flex-shrink-0">
                          <Icon size={20} className={ROUND_COLOR[r.status] || 'text-slate-300'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${ROUND_COLOR[r.status] ? ROUND_COLOR[r.status].replace('600', '700').replace('500', '700') : 'text-slate-500'}`}>
                            {r.name}
                          </p>
                          {r.date && <p className="text-[10px] text-slate-400 mt-0.5">{r.date}</p>}
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${ROUND_BADGE[r.status] || 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                          {ROUND_LABEL[r.status] || 'Upcoming'}
                        </span>
                      </div>
                    );})}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
