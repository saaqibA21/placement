import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { API_HOST_URL } from '../../services/api';
import { Search, Download, X, FileText, CheckCircle2, XCircle, ChevronRight, Eye, Sparkles, Info, ArrowUpDown, Trophy, CalendarClock, QrCode, UserCheck, UserX } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const STATUS_TABS = ['All', 'Pending', 'Shortlisted', 'Rejected'];

function ScorePill({ score }) {
  if (score === null || score === undefined) {
    return <span className="text-[10px] font-semibold text-slate-400">Not scored</span>;
  }
  const color = score >= 85 ? '#15803d' : score >= 70 ? '#0369a1' : score >= 55 ? '#b45309' : '#be123c';
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ color, background: `${color}14`, border: `1px solid ${color}33` }}>
      <Sparkles size={10} /> {score}
    </span>
  );
}

export default function AdminResumes() {
  const { applications, jobs, trackerData, updateApplicationStatus, advanceApplication, scheduleRound, markAttendance } = useApp();
  const [statusTab, setStatusTab] = useState('All');
  const [search, setSearch]   = useState('');
  const [drawer, setDrawer]   = useState(null);
  const [toast, setToast]     = useState('');
  const [sortByScore, setSortByScore] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', venue: '' });
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleAdvance = async (id) => {
    const res = await advanceApplication(id);
    if (drawer?.id === id) setDrawer((d) => (res ? { ...d, ...res } : d));
    showToast(res?.status === 'shortlisted' ? 'Candidate marked as selected!' : 'Advanced to next round.');
  };

  const handleReject = (id) => {
    updateApplicationStatus(id, 'rejected');
    if (drawer?.id === id) setDrawer((d) => ({ ...d, status: 'rejected' }));
    showToast('Application rejected.');
  };

  const trackerFor = (applicationId) => trackerData.find((t) => t.applicationId === applicationId);
  const currentRoundFor = (app) => {
    const entry = trackerFor(app?.id);
    return entry ? entry.rounds[app.stageIndex ?? 0] : null;
  };

  const handleSchedule = async (applicationId) => {
    if (!scheduleForm.date || !scheduleForm.time) { showToast('Pick a date and time first.'); return; }
    const iso = new Date(`${scheduleForm.date}T${scheduleForm.time}`).toISOString();
    try {
      await scheduleRound(applicationId, iso, scheduleForm.venue);
      showToast('Round scheduled — venue code generated.');
      setScheduleForm({ date: '', time: '', venue: '' });
    } catch (err) {
      showToast(err.message || 'Failed to schedule round.');
    }
  };

  const handleMarkAttendance = async (applicationId, attendance) => {
    try {
      await markAttendance(applicationId, attendance);
      showToast(attendance === 'present' ? 'Marked present.' : attendance === 'absent' ? 'Marked absent.' : 'Attendance reset.');
    } catch (err) {
      showToast(err.message || 'Failed to update attendance.');
    }
  };

  // Render a fresh QR whenever the drawer's current round has a check-in code
  useEffect(() => {
    const round = drawer ? currentRoundFor(applications.find((a) => a.id === drawer.id)) : null;
    if (round?.checkInCode) {
      const url = `${window.location.origin}/checkin/${round.checkInCode}`;
      QRCode.toDataURL(url, { width: 160, margin: 1 }).then(setQrDataUrl).catch(() => setQrDataUrl(null));
    } else {
      setQrDataUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer?.id, trackerData]);

  const counts = {
    All: applications.length,
    Pending: applications.filter((a) => a.status === 'pending').length,
    Shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    Rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const filtered = applications
    .filter((a) => {
      if (statusTab !== 'All' && a.status !== statusTab.toLowerCase()) return false;
      if (search) {
        const t = search.toLowerCase();
        return a.studentName.toLowerCase().includes(t) || a.rollNo.toLowerCase().includes(t) || a.company.toLowerCase().includes(t);
      }
      return true;
    })
    .sort((a, b) => {
      if (!sortByScore) return 0;
      return (b.atsScore ?? -1) - (a.atsScore ?? -1);
    });

  const drawerData = drawer ? applications.find((a) => a.id === drawer.id) || drawer : null;

  const exportCSV = () => {
    const header = 'Name,Roll No,Branch,CGPA,Company,Role,AI Score,Applied On,Status';
    const rows = applications.map((a) =>
      `"${a.studentName}","${a.rollNo}","${a.branch}",${a.cgpa},"${a.company}","${a.role}",${a.atsScore ?? ''},"${a.appliedOn}","${a.status}"`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = 'applications.csv'; el.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full overflow-hidden flex-col md:flex-row">
      {/* Main Panel */}
      <div className={`flex flex-col overflow-hidden transition-all ${drawerData ? 'md:w-[55%]' : 'w-full'}`}>
        <div className="p-4 sm:p-6 border-b bg-white" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
                  Resume Screening & Evaluation
                </h1>
                <button onClick={() => setShowInfo((v) => !v)} title="About AI screening scores"
                  className="text-slate-400 hover:text-slate-600"><Info size={15} /></button>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">Review, filter and screen candidate applications across active drives</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSortByScore((v) => !v)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                  sortByScore ? 'text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                style={sortByScore ? { background: 'var(--amber-gold)', borderColor: 'var(--amber-gold)' } : { borderColor: 'var(--border)' }}>
                <ArrowUpDown size={13} /> Sort by AI Score
              </button>
              <button onClick={exportCSV} className="btn-solid-secondary px-4 py-2 text-xs flex items-center gap-1.5">
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {showInfo && (
            <div className="mb-4 p-3.5 rounded-xl border text-xs text-slate-600 flex items-start gap-2.5"
                 style={{ background: 'var(--amber-pale)', borderColor: 'var(--amber-border)' }}>
              <Sparkles size={15} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <p>
                <strong>AI Score</strong> is generated automatically the moment a student applies: their PDF resume is scanned
                for role-relevant keywords, measurable impact, structure, and action verbs against a benchmark for the drive's
                role and company. It's a triage signal to help you sort a large applicant pool faster — not a hiring decision.
                Non-PDF resumes currently can't be auto-scored. The same engine powers the student-facing AI Resume Review tool.
              </p>
            </div>
          )}

          {/* Status Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATUS_TABS.map((s) => (
              <button key={s} onClick={() => setStatusTab(s)}
                className="p-3 rounded-xl border text-left cursor-pointer transition-all"
                style={{
                  borderColor: statusTab === s ? 'var(--amber-gold)' : 'var(--border)',
                  background: statusTab === s ? 'var(--amber-pale)' : '#fff',
                }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s}</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: statusTab === s ? 'var(--amber-gold)' : 'var(--text-dark)' }}>{counts[s]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name, roll number, or company..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-solid pl-8 py-2 text-xs" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={13} /></button>}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas-bg)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[540px]">
              <thead className="sticky top-0 bg-white border-b text-slate-400 font-bold text-[10px] uppercase tracking-wider"
                     style={{ borderColor: 'var(--border)' }}>
                <tr>
                  {['Candidate', 'Branch / CGPA', 'Company & Role', 'AI Score', 'Applied On', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-slate-400">No applications match current filters</td></tr>
                ) : filtered.map((app) => (
                  <tr key={app.id} className="table-row-light cursor-pointer" onClick={() => setDrawer(app)}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                             style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                          {app.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{app.studentName}</p>
                          <p className="text-slate-400 font-mono text-[10px]">{app.rollNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-700">{app.branch}</p>
                      <p className="font-bold" style={{ color: app.cgpa >= 9 ? '#15803d' : 'var(--amber-gold)' }}>{app.cgpa}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900 truncate max-w-[140px]">{app.company}</p>
                      <p className="text-slate-400 truncate max-w-[140px]">{app.role}</p>
                    </td>
                    <td className="px-4 py-3.5"><ScorePill score={app.atsScore} /></td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono whitespace-nowrap">{app.appliedOn}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3.5"><ChevronRight size={14} className="text-slate-300" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Candidate Drawer */}
      {drawerData && (
        <div className="flex-1 border-t md:border-t-0 md:border-l overflow-y-auto bg-white flex flex-col" style={{ borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: 'var(--border)', background: 'var(--canvas-bg)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-xs"
                   style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                {drawerData.studentName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{drawerData.studentName}</p>
                <p className="text-slate-400 text-xs font-mono">{drawerData.rollNo}</p>
              </div>
            </div>
            <button onClick={() => setDrawer(null)} className="text-slate-400 hover:text-slate-600"><X size={17} /></button>
          </div>

          <div className="flex-1 px-5 py-4 space-y-4">
            <div className="p-4 rounded-xl border" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Application Details</p>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Applied For', value: `${drawerData.company} – ${drawerData.role}` },
                  { label: 'Branch',      value: drawerData.branch },
                  { label: 'CGPA',        value: drawerData.cgpa },
                  { label: 'Applied On',  value: drawerData.appliedOn },
                  { label: 'Current Round', value: drawerData.round },
                  { label: 'Status',      value: <StatusBadge status={drawerData.status} /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-semibold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hiring Pipeline Stepper */}
            {(() => {
              const job = jobs.find((j) => j.id === drawerData.jobId);
              const pipeline = job?.pipeline || [];
              if (pipeline.length === 0) return null;
              return (
                <div className="p-4 rounded-xl border" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Hiring Pipeline</p>
                  <div className="space-y-2">
                    {pipeline.map((stage, i) => {
                      const stageIndex = drawerData.stageIndex ?? 0;
                      const isRejectedHere = drawerData.status === 'rejected' && i === stageIndex;
                      const isSelected = drawerData.status === 'shortlisted' && stageIndex >= pipeline.length - 1;
                      const cleared = i < stageIndex || isSelected;
                      const current = i === stageIndex && !isRejectedHere && !isSelected;
                      return (
                        <div key={stage.id || stage.name} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                               style={{
                                 background: isRejectedHere ? '#be123c' : cleared ? '#15803d' : current ? 'var(--amber-gold)' : '#e2e8f0',
                                 color: cleared || current || isRejectedHere ? '#fff' : '#94a3b8',
                               }}>
                            {isRejectedHere ? '✕' : cleared ? '✓' : i + 1}
                          </div>
                          <span className={`text-xs ${current ? 'font-bold text-slate-900' : cleared ? 'text-slate-600' : isRejectedHere ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                            {stage.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Round Scheduling & Venue Attendance */}
            {drawerData.status !== 'rejected' && (() => {
              const round = currentRoundFor(drawerData);
              if (!round) return null;
              return (
                <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CalendarClock size={12} /> {round.name} — Schedule &amp; Attendance
                  </p>

                  {!round.scheduledAt ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" className="input-solid text-xs py-2" value={scheduleForm.date}
                          onChange={(e) => setScheduleForm((f) => ({ ...f, date: e.target.value }))} />
                        <input type="time" className="input-solid text-xs py-2" value={scheduleForm.time}
                          onChange={(e) => setScheduleForm((f) => ({ ...f, time: e.target.value }))} />
                      </div>
                      <input type="text" placeholder="Venue (e.g. Seminar Hall A, or a video call link)"
                        className="input-solid text-xs py-2" value={scheduleForm.venue}
                        onChange={(e) => setScheduleForm((f) => ({ ...f, venue: e.target.value }))} />
                      <button onClick={() => handleSchedule(drawerData.id)}
                        className="btn-solid-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5">
                        <CalendarClock size={13} /> Schedule This Round
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between"><span className="text-slate-400">When</span>
                          <span className="font-semibold text-slate-800">{new Date(round.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
                        {round.venue && <div className="flex justify-between"><span className="text-slate-400">Venue</span>
                          <span className="font-semibold text-slate-800 text-right max-w-[180px] truncate">{round.venue}</span></div>}
                        <div className="flex justify-between"><span className="text-slate-400">RSVP</span>
                          <span className={`font-bold ${round.confirmation === 'confirmed' ? 'text-green-700' : round.confirmation === 'declined' ? 'text-rose-600' : 'text-slate-500'}`}>
                            {round.confirmation === 'none' ? 'Awaiting response' : round.confirmation}
                          </span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Attendance</span>
                          <span className={`font-bold ${round.attendance === 'present' ? 'text-green-700' : round.attendance === 'absent' ? 'text-rose-600' : 'text-slate-500'}`}>
                            {round.attendance === 'not_marked' ? 'Not marked' : round.attendance}
                          </span></div>
                      </div>

                      {qrDataUrl && (
                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border" style={{ borderColor: 'var(--border)' }}>
                          <img src={qrDataUrl} alt="Venue check-in QR" className="w-28 h-28" />
                          <p className="text-[10px] text-slate-400 flex items-center gap-1"><QrCode size={10} /> Code: <span className="font-mono font-bold text-slate-700">{round.checkInCode}</span></p>
                          <p className="text-[9px] text-slate-400 text-center">Display at the venue — students scan with their phone camera, or type the code on their Participation page.</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => handleMarkAttendance(drawerData.id, 'present')}
                          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-white flex items-center justify-center gap-1" style={{ background: '#15803d' }}>
                          <UserCheck size={12} /> Present
                        </button>
                        <button onClick={() => handleMarkAttendance(drawerData.id, 'absent')}
                          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-white flex items-center justify-center gap-1" style={{ background: '#be123c' }}>
                          <UserX size={12} /> Absent
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Candidate Resume Card */}
            <div className="p-4 rounded-xl border space-y-2" style={{ background: 'var(--amber-pale)', borderColor: 'var(--amber-border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Candidate Resume</p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <FileText size={16} className="text-amber-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {drawerData.resumeName || `Resume_${drawerData.studentName.replace(/\s+/g, '_')}.pdf`}
                    </p>
                    <p className="text-[10px] text-slate-400">Submitted with application</p>
                  </div>
                </div>
                {drawerData.resumeUrl ? (
                  <a
                    href={drawerData.resumeUrl.startsWith('http') || drawerData.resumeUrl.startsWith('blob:') ? drawerData.resumeUrl : `${API_HOST_URL}${drawerData.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-solid-secondary px-3 py-1.5 text-xs flex items-center gap-1 font-semibold flex-shrink-0"
                  >
                    <Eye size={12} /> View File
                  </a>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex-shrink-0">
                    Verified Profile CV
                  </span>
                )}
              </div>
            </div>

            {/* AI Screening Report */}
            <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-700" /> AI Screening Report
                </p>
                <ScorePill score={drawerData.atsScore} />
              </div>
              {drawerData.atsReport?.pillars ? (
                <>
                  <div className="space-y-1.5">
                    {Object.values(drawerData.atsReport.pillars).map((p) => (
                      <div key={p.label} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-32 flex-shrink-0 truncate">{p.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: 'var(--amber-gold)' }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 w-7 text-right">{p.score}</span>
                      </div>
                    ))}
                  </div>
                  {drawerData.atsReport.missingKeywords?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Missing Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {drawerData.atsReport.missingKeywords.slice(0, 6).map((k) => (
                          <span key={k} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">{drawerData.atsReport?.note || 'No automatic score available for this application.'}</p>
              )}
            </div>
          </div>

          <div className="px-5 py-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Screening Decision</p>
            {(() => {
              const job = jobs.find((j) => j.id === drawerData.jobId);
              const pipeline = job?.pipeline || [];
              const lastIndex = Math.max(pipeline.length - 1, 0);
              const atFinalStage = (drawerData.stageIndex ?? 0) >= lastIndex;
              const nextStageName = atFinalStage ? null : pipeline[(drawerData.stageIndex ?? 0) + 1]?.name;
              const isRejected = drawerData.status === 'rejected';
              const isSelected = drawerData.status === 'shortlisted' && atFinalStage;
              return (
                <>
                  <button onClick={() => handleAdvance(drawerData.id)}
                    disabled={isRejected || isSelected}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#15803d' }}>
                    {atFinalStage ? <Trophy size={14} /> : <CheckCircle2 size={14} />}
                    {isSelected ? 'Candidate Selected' : atFinalStage ? 'Mark as Selected' : `Advance to: ${nextStageName || 'Next Round'}`}
                  </button>
                  <button onClick={() => handleReject(drawerData.id)}
                    disabled={isRejected}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#be123c' }}>
                    <XCircle size={14} /> {isRejected ? 'Application Rejected' : 'Reject at This Stage'}
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg z-50"
             style={{ background: '#15803d' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
