import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search, X, ChevronRight, Clock, MapPin, Briefcase,
  CheckCircle2, XCircle, ArrowUpDown,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const TABS = ['All', 'Eligible', 'Applied', 'Intern', 'FTE', 'GET'];

export default function Jobs() {
  const { jobs, applyJob } = useApp();          // ← reads from shared global state
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('All');
  const [sort, setSort]         = useState('deadline');
  const [selected, setSelected] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleApply = (id) => {
    applyJob(id);                               // ← writes to shared global state
    if (selected?.id === id) setSelected((prev) => ({ ...prev, applied: true }));
    showToast('Application submitted successfully!');
  };

  const filtered = useMemo(() => {
    let list = [...jobs];
    if (tab === 'Eligible') list = list.filter((j) => j.eligible);
    else if (tab === 'Applied') list = list.filter((j) => j.applied);
    else if (['Intern', 'FTE', 'GET'].includes(tab)) list = list.filter((j) => j.jobType === tab);
    if (search) {
      const t = search.toLowerCase();
      list = list.filter((j) => j.company.toLowerCase().includes(t) || j.role.toLowerCase().includes(t));
    }
    if (sort === 'deadline') {
      list.sort((a, b) => {
        if (!a.applyBefore) return 1;
        if (!b.applyBefore) return -1;
        return new Date(a.applyBefore) - new Date(b.applyBefore);
      });
    } else if (sort === 'company') {
      list.sort((a, b) => a.company.localeCompare(b.company));
    }
    return list;
  }, [jobs, tab, search, sort]);

  const totalCount    = jobs.length;
  const eligibleCount = jobs.filter((j) => j.eligible).length;
  const appliedCount  = jobs.filter((j) => j.applied).length;
  const openCount     = jobs.filter((j) => j.status === 'open').length;

  // Keep selected in sync when global jobs update
  const selectedJob = selected ? jobs.find((j) => j.id === selected.id) || selected : null;

  return (
    <div className="flex h-full overflow-hidden flex-col md:flex-row">
      {/* Main List Panel */}
      <div className={`flex flex-col overflow-hidden transition-all ${selectedJob ? 'md:w-[55%]' : 'w-full'}`}>
        {/* Page Header */}
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b bg-white" style={{ borderColor: '#EDE0D0' }}>
          <h1 className="text-xl font-bold text-gray-900" style={{fontFamily:'Cinzel,serif'}}>Campus Recruitment Drives</h1>
          <p className="text-gray-500 text-xs mt-0.5">Browse and apply to all active placement drives</p>
          <div className="flex flex-wrap gap-5 mt-4">
            {[
              { label: 'Total', value: totalCount, color: '#8B1A1A' },
              { label: 'Open Now', value: openCount, color: '#15803d' },
              { label: 'Eligible', value: eligibleCount, color: '#b45309' },
              { label: 'Applied', value: appliedCount, color: '#1d4ed8' },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search + Sort */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b flex flex-wrap items-center gap-3" style={{ borderColor: '#EDE0D0' }}>
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search company or role..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-solid pl-8 py-2 text-xs" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={13} /></button>}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown size={13} className="text-gray-400" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-solid py-2 text-xs" style={{ width: 'auto' }}>
              <option value="deadline">Closest Deadline</option>
              <option value="company">Company A–Z</option>
            </select>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="px-4 sm:px-6 py-2 bg-white border-b flex gap-1 overflow-x-auto" style={{ borderColor: '#EDE0D0' }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`tab-light text-xs whitespace-nowrap ${tab === t ? 'active' : ''}`}>{t}</button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3" style={{ background: '#FFFDF7' }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Briefcase size={40} className="mb-3 opacity-30" />
              <p className="font-medium text-sm">No drives found</p>
              <p className="text-xs mt-1">Admin hasn't posted any matching drives yet</p>
            </div>
          ) : (
            filtered.map((job) => (
              <div key={job.id} onClick={() => { setSelected(job); setDrawerTab('overview'); }}
                className="card-solid card-solid-hover p-4 cursor-pointer transition-all"
                style={{
                  borderColor: selectedJob?.id === job.id ? '#8B1A1A' : undefined,
                  borderWidth: selectedJob?.id === job.id ? '2px' : undefined,
                }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                         style={{ background: '#8B1A1A' }}>
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">{job.company}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-tight">{job.role}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <StatusBadge status={job.status} />
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: '#FFF8E7', color: '#7A5C00', border: '1px solid #E8D5B5' }}>
                          {job.jobType}
                        </span>
                        {job.applied && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> Applied
                          </span>
                        )}
                        {!job.eligible && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                            <XCircle size={10} /> Not Eligible
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{job.salary}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{job.applyBefore ? `Deadline: ${job.applyBefore}` : 'No deadline'}</p>
                    <ChevronRight size={14} className="ml-auto mt-1 text-gray-300" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedJob && (
        <div className="flex-1 flex flex-col border-t md:border-t-0 md:border-l overflow-hidden bg-white" style={{ borderColor: '#EDE0D0' }}>
          <div className="px-5 py-4 border-b flex items-start justify-between gap-3" style={{ borderColor: '#EDE0D0', background: '#FFFDF7' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: '#8B1A1A' }}>
                {selectedJob.company.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{selectedJob.company}</p>
                <p className="text-gray-500 text-xs">{selectedJob.role}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={17} /></button>
          </div>

          <div className="flex gap-1 px-5 py-2 border-b" style={{ borderColor: '#EDE0D0' }}>
            {['overview', 'eligibility'].map((t) => (
              <button key={t} onClick={() => setDrawerTab(t)} className={`tab-light text-xs ${drawerTab === t ? 'active' : ''}`}>
                {t === 'overview' ? 'Overview' : 'Eligibility & Rounds'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {drawerTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Salary / CTC',  value: selectedJob.salary    || '—' },
                    { label: 'Stipend',        value: selectedJob.stipend   || '—' },
                    { label: 'Program Type',   value: selectedJob.jobType          },
                    { label: 'Posted On',      value: selectedJob.jobPosted || '—' },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl border" style={{ background: '#FFFDF7', borderColor: '#EDE0D0' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                {(selectedJob.applyBefore || selectedJob.dateOfVisit) && (
                  <div className="p-3 rounded-xl border space-y-2" style={{ background: '#FFFDF7', borderColor: '#EDE0D0' }}>
                    {selectedJob.applyBefore && (
                      <div className="flex items-center gap-2 text-xs">
                        <Clock size={13} className="text-red-500" />
                        <span className="text-gray-500">Application Deadline:</span>
                        <span className="font-bold text-gray-800">{selectedJob.applyBefore}</span>
                      </div>
                    )}
                    {selectedJob.dateOfVisit && (
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin size={13} className="text-green-600" />
                        <span className="text-gray-500">Campus Visit:</span>
                        <span className="font-bold text-gray-800">{selectedJob.dateOfVisit} {selectedJob.visitTentative ? '(Tentative)' : ''}</span>
                      </div>
                    )}
                  </div>
                )}
                {selectedJob.description && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Role Description</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{selectedJob.description}</p>
                  </div>
                )}
              </div>
            )}
            {drawerTab === 'eligibility' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ background: '#FFFDF7', borderColor: '#EDE0D0' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Eligibility Criteria</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Minimum CGPA</span>
                      <span className="font-bold text-gray-900">{selectedJob.minCGPA} and above</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Eligible Branches</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(selectedJob.branches || []).map((b) => (
                          <span key={b} className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                                style={{ background: '#FFF0F0', color: '#8B1A1A', border: '1px solid #F5CCCC' }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: '#FFFDF7', borderColor: '#EDE0D0' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Selection Process</p>
                  <div className="space-y-2.5">
                    {['Application Screening', 'Online Assessment / Aptitude Test', 'Technical Interview', 'HR Interview', 'Offer Rollout'].map((r, i) => (
                      <div key={r} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: '#8B1A1A' }}>{i + 1}</div>
                        <span className="text-xs text-gray-700">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t" style={{ borderColor: '#EDE0D0' }}>
            {selectedJob.applied ? (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-green-700 bg-green-50 border border-green-200">
                <CheckCircle2 size={16} /> Application Submitted
              </div>
            ) : selectedJob.eligible && selectedJob.status === 'open' ? (
              <button onClick={() => handleApply(selectedJob.id)} className="btn-solid-primary w-full py-3 text-sm">Apply for this Drive</button>
            ) : !selectedJob.eligible ? (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200">
                <XCircle size={16} /> Not eligible for this drive
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200">
                Drive is {selectedJob.status.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg z-50" style={{ background: '#15803d' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
