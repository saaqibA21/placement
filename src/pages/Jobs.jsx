import { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search, X, ChevronRight, Clock, MapPin, Briefcase,
  CheckCircle2, XCircle, ArrowUpDown, FileText, Upload, Send, User,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const TABS = ['All', 'Eligible', 'Applied', 'Intern', 'FTE', 'GET'];

export default function Jobs() {
  const { jobs, applyJob, user } = useApp();
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('All');
  const [sort, setSort]         = useState('deadline');
  const [selected, setSelected] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [jobToApply, setJobToApply] = useState(null);
  const [customResume, setCustomResume] = useState(null);
  const [toast, setToast]       = useState('');

  const resumeInputRef = useRef();

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const startApply = (job) => {
    setJobToApply(job);
    setCustomResume(null);
    setShowApplyModal(true);
  };

  const handleResumeFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File must be under 5 MB');
      return;
    }
    setCustomResume({
      name: file.name,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      url: URL.createObjectURL(file),
    });
  };

  const submitApplication = () => {
    if (!jobToApply) return;
    applyJob(jobToApply.id, customResume);
    if (selected?.id === jobToApply.id) {
      setSelected((prev) => ({ ...prev, applied: true }));
    }
    setShowApplyModal(false);
    showToast(`Application and resume sent to ${jobToApply.company}!`);
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

  const selectedJob = selected ? jobs.find((j) => j.id === selected.id) || selected : null;

  return (
    <div className="flex h-full overflow-hidden flex-col md:flex-row">
      {/* Main List Panel */}
      <div className={`flex flex-col overflow-hidden transition-all ${selectedJob ? 'md:w-[55%]' : 'w-full'}`}>
        {/* Page Header */}
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b bg-white" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
            Campus Recruitment Drives
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Browse and apply to active placement drives across top tier partners</p>
          <div className="flex flex-wrap gap-5 mt-4">
            {[
              { label: 'Total', value: totalCount, color: '#162E34' },
              { label: 'Open Now', value: openCount, color: '#15803d' },
              { label: 'Eligible', value: eligibleCount, color: '#b45309' },
              { label: 'Applied', value: appliedCount, color: '#0369a1' },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search + Sort */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b flex flex-wrap items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search company or role..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-solid pl-8 py-2 text-xs" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={13} /></button>}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown size={13} className="text-slate-400" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-solid py-2 text-xs" style={{ width: 'auto' }}>
              <option value="deadline">Closest Deadline</option>
              <option value="company">Company A–Z</option>
            </select>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="px-4 sm:px-6 py-2 bg-white border-b flex gap-1 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`tab-light text-xs whitespace-nowrap ${tab === t ? 'active' : ''}`}>{t}</button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3" style={{ background: 'var(--canvas-bg)' }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Briefcase size={40} className="mb-3 opacity-30" />
              <p className="font-medium text-sm">No drives found</p>
              <p className="text-xs mt-1">Admin hasn't posted any matching drives yet</p>
            </div>
          ) : (
            filtered.map((job) => (
              <div key={job.id} onClick={() => { setSelected(job); setDrawerTab('overview'); }}
                className="card-solid card-solid-hover p-4 cursor-pointer transition-all"
                style={{
                  borderColor: selectedJob?.id === job.id ? 'var(--amber-gold)' : undefined,
                  borderWidth: selectedJob?.id === job.id ? '2px' : undefined,
                }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-xs"
                         style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">{job.company}</p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-tight">{job.role}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <StatusBadge status={job.status} />
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: 'var(--amber-pale)', color: '#8C4419', border: '1px solid var(--amber-border)' }}>
                          {job.jobType}
                        </span>
                        {job.applied && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> Applied
                          </span>
                        )}
                        {!job.eligible && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                            <XCircle size={10} /> Not Eligible
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900">{job.salary}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{job.applyBefore ? `Deadline: ${job.applyBefore}` : 'No deadline'}</p>
                    <ChevronRight size={14} className="ml-auto mt-1 text-slate-300" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedJob && (
        <div className="flex-1 flex flex-col border-t md:border-t-0 md:border-l overflow-hidden bg-white" style={{ borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-start justify-between gap-3" style={{ borderColor: 'var(--border)', background: 'var(--canvas-bg)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-xs"
                   style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                {selectedJob.company.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{selectedJob.company}</p>
                <p className="text-slate-500 text-xs">{selectedJob.role}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600"><X size={17} /></button>
          </div>

          <div className="flex gap-1 px-5 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
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
                    <div key={item.label} className="p-3 rounded-xl border" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                {(selectedJob.applyBefore || selectedJob.dateOfVisit) && (
                  <div className="p-3 rounded-xl border space-y-2" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                    {selectedJob.applyBefore && (
                      <div className="flex items-center gap-2 text-xs">
                        <Clock size={13} className="text-red-500" />
                        <span className="text-slate-500">Application Deadline:</span>
                        <span className="font-bold text-slate-800">{selectedJob.applyBefore}</span>
                      </div>
                    )}
                    {selectedJob.dateOfVisit && (
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin size={13} className="text-green-600" />
                        <span className="text-slate-500">Campus Visit:</span>
                        <span className="font-bold text-slate-800">{selectedJob.dateOfVisit} {selectedJob.visitTentative ? '(Tentative)' : ''}</span>
                      </div>
                    )}
                  </div>
                )}
                {selectedJob.description && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Role Description</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedJob.description}</p>
                  </div>
                )}
              </div>
            )}
            {drawerTab === 'eligibility' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Eligibility Criteria</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Minimum CGPA</span>
                      <span className="font-bold text-slate-900">{selectedJob.minCGPA} and above</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-500">Eligible Branches</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(selectedJob.branches || []).map((b) => (
                          <span key={b} className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                                style={{ background: 'var(--amber-pale)', color: '#8C4419', border: '1px solid var(--amber-border)' }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Selection Process</p>
                  <div className="space-y-2.5">
                    {['Application Screening', 'Online Assessment / Aptitude Test', 'Technical Interview', 'HR Interview', 'Offer Rollout'].map((r, i) => (
                      <div key={r} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                             style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                          {i + 1}
                        </div>
                        <span className="text-xs text-slate-700">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {selectedJob.applied ? (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-green-700 bg-green-50 border border-green-200">
                <CheckCircle2 size={16} /> Application Submitted
              </div>
            ) : selectedJob.eligible && selectedJob.status === 'open' ? (
              <button onClick={() => startApply(selectedJob)} className="btn-solid-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2">
                <Send size={15} /> Apply for this Drive
              </button>
            ) : !selectedJob.eligible ? (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-slate-500 bg-slate-50 border border-slate-200">
                <XCircle size={16} /> Not eligible for this drive
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-slate-500 bg-slate-50 border border-slate-200">
                Drive is {selectedJob.status.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Application Confirmation & Resume Modal */}
      {showApplyModal && jobToApply && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg border shadow-2xl space-y-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
                  Submit Campus Application
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {jobToApply.company} · {jobToApply.role}
                </p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {/* Student Info Card */}
            <div className="p-3.5 rounded-xl border text-xs space-y-2" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Applicant Credentials</p>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div><span className="text-slate-400">Name:</span> <strong className="text-slate-900">{user?.name || 'Candidate'}</strong></div>
                <div><span className="text-slate-400">Roll No:</span> <strong className="text-slate-900 font-mono">{user?.rollNo || '21CS001'}</strong></div>
                <div><span className="text-slate-400">Branch:</span> <strong className="text-slate-900">{user?.branch || 'Computer Science'}</strong></div>
                <div><span className="text-slate-400">CGPA:</span> <strong className="text-amber-700">{user?.cgpa || '8.5'}</strong></div>
              </div>
            </div>

            {/* Resume Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Resume Submission
              </label>
              <div className="p-4 rounded-xl border flex items-center justify-between" style={{ background: 'var(--amber-pale)', borderColor: 'var(--amber-border)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white shadow-xs">
                    <FileText size={18} className="text-amber-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {customResume?.name || `Resume_${user?.name?.replace(/\s+/g, '_') || 'Candidate'}.pdf`}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {customResume ? `${customResume.size} · Uploaded Custom` : 'Verified Profile Resume'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  className="btn-solid-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 flex-shrink-0"
                >
                  <Upload size={12} /> Upload Other
                </button>
                <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeFile} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t mt-4" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="btn-solid-secondary px-4 py-2 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitApplication}
                className="btn-solid-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                <Send size={13} /> Confirm & Send Application
              </button>
            </div>
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
