import { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { API_HOST_URL } from '../../services/api';
import {
  FileSpreadsheet, Download, Upload, CheckCircle2, XCircle, AlertTriangle,
  Send, Users, ArrowRight,
} from 'lucide-react';

const DECISION_ADVANCE = new Set(['shortlist', 'shortlisted', 'select', 'selected', 'advance', 'advanced', 'pass', 'passed', 'yes', 'cleared', 'qualified']);
const DECISION_REJECT = new Set(['reject', 'rejected', 'no', 'not selected', 'notselected', 'fail', 'failed', 'decline', 'declined']);

function normalizeDecision(raw) {
  const v = String(raw ?? '').trim().toLowerCase();
  if (!v) return null;
  if (DECISION_ADVANCE.has(v)) return 'advance';
  if (DECISION_REJECT.has(v)) return 'reject';
  return 'unrecognized';
}

export default function AdminBulkRounds() {
  const { jobs, applications, students, bulkUpdateApplications, addNotice } = useApp();
  const [jobId, setJobId] = useState(jobs[0]?.id ?? null);
  const [stageIndex, setStageIndex] = useState(0);
  const [preview, setPreview] = useState(null); // parsed rows from an imported sheet
  const [result, setResult] = useState(null);   // server summary after applying
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState('');
  const [noticeDraft, setNoticeDraft] = useState(null);
  const fileRef = useRef();

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const job = jobs.find((j) => j.id === jobId);
  const pipeline = job?.pipeline || [];

  const stageCounts = useMemo(() => {
    if (!job) return [];
    return pipeline.map((stage, i) => ({
      ...stage,
      count: applications.filter((a) => a.jobId === job.id && a.status === 'pending' && (a.stageIndex ?? 0) === i).length,
    }));
  }, [job, pipeline, applications]);

  const candidates = useMemo(() => {
    if (!job) return [];
    return applications.filter((a) => a.jobId === job.id && a.status === 'pending' && (a.stageIndex ?? 0) === stageIndex);
  }, [job, applications, stageIndex]);

  const emailFor = (studentId) => students.find((s) => s.id === studentId)?.email || '';

  const selectJob = (id) => { setJobId(id); setStageIndex(0); setPreview(null); setResult(null); };

  // ── Export ────────────────────────────────────────────────────────────────
  const exportRoundSheet = async () => {
    if (candidates.length === 0) { showToast('No candidates pending at this round.'); return; }
    const XLSX = await import('xlsx');
    const rows = candidates.map((a) => ({
      'Application ID': a.id,
      'Roll No': a.rollNo,
      'Name': a.studentName,
      'Branch': a.branch,
      'CGPA': a.cgpa,
      'Email': emailFor(a.studentId),
      'AI Score': a.atsScore ?? '',
      'Resume Link': a.resumeUrl ? `${API_HOST_URL}${a.resumeUrl}` : '',
      'Decision (Shortlist / Reject)': '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 6 }, { wch: 26 }, { wch: 10 }, { wch: 40 }, { wch: 26 }];

    const instructions = XLSX.utils.aoa_to_sheet([
      ['How to use this sheet'],
      [`Round: ${pipeline[stageIndex]?.name || ''} — ${job.company} (${job.role})`],
      [''],
      ['1. Do not edit the "Application ID" column — it is used to match each row back to the right candidate.'],
      ['2. Fill "Decision (Shortlist / Reject)" for each row with either Shortlist or Reject.'],
      ['3. Leave a row blank to leave that candidate unchanged.'],
      ['4. Save the file and send it back to the placement cell — they will import it directly.'],
    ]);
    instructions['!cols'] = [{ wch: 90 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Round Sheet');
    XLSX.utils.book_append_sheet(wb, instructions, 'Instructions');
    const filename = `${job.company}_${pipeline[stageIndex]?.name || 'Round'}_${new Date().toISOString().slice(0, 10)}.xlsx`.replace(/[^a-zA-Z0-9._-]/g, '_');
    XLSX.writeFile(wb, filename);
    showToast('Round sheet downloaded.');
  };

  // ── Import ────────────────────────────────────────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(evt.target.result, { type: 'array' });
        const sheetName = wb.SheetNames.includes('Round Sheet') ? 'Round Sheet' : wb.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

        const parsed = rows.map((r) => {
          const appId = parseInt(r['Application ID'], 10);
          const decision = normalizeDecision(r['Decision (Shortlist / Reject)'] ?? r['Decision']);
          const local = applications.find((a) => a.id === appId);
          return { applicationId: appId, decision, rawDecision: r['Decision (Shortlist / Reject)'] ?? r['Decision'] ?? '', local };
        });
        setPreview(parsed);
        setResult(null);
      } catch (err) {
        showToast('Could not read that file — make sure it’s the exported .xlsx sheet.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const applyImport = async () => {
    if (!preview) return;
    const updates = preview
      .filter((r) => r.local && (r.decision === 'advance' || r.decision === 'reject'))
      .map((r) => ({ applicationId: r.applicationId, decision: r.decision }));
    if (updates.length === 0) { showToast('No recognized Shortlist/Reject decisions to apply.'); return; }

    setApplying(true);
    try {
      const summary = await bulkUpdateApplications(updates);
      setResult(summary);
      setPreview(null);
      const advancedTotal = (summary?.advanced || 0) + (summary?.selected || 0);
      setNoticeDraft({
        title: `${job.company} — ${pipeline[stageIndex]?.name || 'Round'} Results`,
        body: `Results for ${pipeline[stageIndex]?.name || 'this round'} (${job.company} — ${job.role}) have been updated.\n\n` +
          `${advancedTotal} candidate(s) have moved forward${summary?.selected ? ` (${summary.selected} fully selected)` : ''}.\n` +
          `${summary?.rejected || 0} candidate(s) were not selected this round.\n\n` +
          `Check your Round Tracker for your individual status.`,
        tags: ['Job'],
        category: 'job',
        author: 'Placement Cell',
        authorInitial: 'P',
        authorColor: 'bg-emerald-700',
        timeAgo: 'Just now',
      });
      showToast('Bulk update applied!');
    } catch (err) {
      showToast(err.message || 'Failed to apply bulk update.');
    } finally {
      setApplying(false);
    }
  };

  const publishNotice = () => {
    if (!noticeDraft) return;
    addNotice(noticeDraft);
    showToast('Posted to Notices!');
    setNoticeDraft(null);
  };

  const previewCounts = preview ? {
    advance: preview.filter((r) => r.decision === 'advance' && r.local).length,
    reject: preview.filter((r) => r.decision === 'reject' && r.local).length,
    skipped: preview.filter((r) => !r.decision).length,
    unrecognized: preview.filter((r) => r.decision === 'unrecognized').length,
    notFound: preview.filter((r) => !r.local).length,
  } : null;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg z-50" style={{ background: '#262654' }}>
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-slate-900 font-retro">Bulk Round Management</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Export a round's candidates to Excel, send it to the company for screening, then import their decisions back in one shot.
        </p>
      </div>

      {/* Job selector */}
      <div className="card-solid bg-white p-4">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Recruitment Drive</label>
        <select className="input-solid text-xs py-2" value={jobId ?? ''} onChange={(e) => selectJob(parseInt(e.target.value, 10))}>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.company} — {j.role}</option>)}
        </select>
      </div>

      {job && (
        <>
          {/* Round selector */}
          <div className="card-solid bg-white p-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Round</label>
            <div className="flex flex-wrap gap-2">
              {stageCounts.map((stage, i) => (
                <button key={stage.id || i} onClick={() => { setStageIndex(i); setPreview(null); setResult(null); }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-colors ${
                    stageIndex === i ? 'text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  style={stageIndex === i ? { background: 'var(--amber-gold)', borderColor: 'var(--amber-gold)' } : { borderColor: 'var(--border)' }}>
                  {i + 1}. {stage.name}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${stageIndex === i ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>{stage.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Candidate list + export */}
          <div className="card-solid bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Users size={14} /> {candidates.length} candidate(s) pending at this round</p>
              <button onClick={exportRoundSheet} disabled={candidates.length === 0}
                className="btn-solid-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                <Download size={13} /> Export Round Sheet (.xlsx)
              </button>
            </div>
            {candidates.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[500px]">
                  <thead className="text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b" style={{ borderColor: 'var(--border)' }}>
                    <tr>{['Roll No', 'Name', 'Branch', 'CGPA', 'AI Score'].map((h) => <th key={h} className="text-left px-2 py-2">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                    {candidates.map((a) => (
                      <tr key={a.id}>
                        <td className="px-2 py-2 font-mono text-slate-500">{a.rollNo}</td>
                        <td className="px-2 py-2 font-semibold text-slate-800">{a.studentName}</td>
                        <td className="px-2 py-2 text-slate-600">{a.branch}</td>
                        <td className="px-2 py-2 text-slate-600">{a.cgpa}</td>
                        <td className="px-2 py-2 text-slate-600">{a.atsScore ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Import */}
          <div className="card-solid bg-white p-4 sm:p-5 space-y-3">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><FileSpreadsheet size={14} /> Import Updated Sheet</p>
            <p className="text-[11px] text-slate-400">Upload the same file back once the company has filled in the Decision column.</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
            <button onClick={() => fileRef.current?.click()} className="btn-solid-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5">
              <Upload size={13} /> Choose Updated Excel File
            </button>

            {preview && previewCounts && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">{previewCounts.advance} will advance</span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">{previewCounts.reject} will be rejected</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{previewCounts.skipped} left blank</span>
                  {previewCounts.unrecognized > 0 && <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{previewCounts.unrecognized} unrecognized value</span>}
                  {previewCounts.notFound > 0 && <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{previewCounts.notFound} row(s) don't match a known application</span>}
                </div>

                <div className="max-h-64 overflow-y-auto border rounded-xl" style={{ borderColor: 'var(--border)' }}>
                  <table className="w-full text-xs min-w-[460px]">
                    <thead className="text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b sticky top-0 bg-white" style={{ borderColor: 'var(--border)' }}>
                      <tr>{['Name', 'Roll No', 'Decision', 'Result'].map((h) => <th key={h} className="text-left px-2 py-2">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                      {preview.map((r, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1.5 font-semibold text-slate-800">{r.local?.studentName || '—'}</td>
                          <td className="px-2 py-1.5 font-mono text-slate-500">{r.local?.rollNo || `#${r.applicationId}`}</td>
                          <td className="px-2 py-1.5 text-slate-500">{r.rawDecision || '—'}</td>
                          <td className="px-2 py-1.5">
                            {!r.local ? <span className="text-amber-600 font-semibold flex items-center gap-1"><AlertTriangle size={11} /> Not found</span>
                              : r.decision === 'advance' ? <span className="text-green-700 font-semibold flex items-center gap-1"><CheckCircle2 size={11} /> Advance</span>
                              : r.decision === 'reject' ? <span className="text-rose-600 font-semibold flex items-center gap-1"><XCircle size={11} /> Reject</span>
                              : r.decision === 'unrecognized' ? <span className="text-amber-600 font-semibold">Unrecognized</span>
                              : <span className="text-slate-400">No change</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button onClick={applyImport} disabled={applying}
                  className="btn-solid-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
                  <ArrowRight size={13} /> {applying ? 'Applying…' : 'Apply These Updates'}
                </button>
              </div>
            )}
          </div>

          {/* Result + notice */}
          {result && (
            <div className="card-solid bg-white p-4 sm:p-5 space-y-3" style={{ borderColor: '#bbf7d0' }}>
              <p className="text-xs font-bold text-green-700 flex items-center gap-1.5"><CheckCircle2 size={14} /> Bulk update applied</p>
              <p className="text-xs text-slate-600">
                {result.advanced} advanced · {result.selected} fully selected · {result.rejected} rejected
                {result.skipped ? ` · ${result.skipped} skipped` : ''}
              </p>

              {noticeDraft && (
                <div className="p-4 rounded-xl border space-y-2" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Post Results to Notices</p>
                  <input className="input-solid text-xs py-2" value={noticeDraft.title}
                    onChange={(e) => setNoticeDraft((d) => ({ ...d, title: e.target.value }))} />
                  <textarea className="input-solid text-xs py-2 h-28 resize-none" value={noticeDraft.body}
                    onChange={(e) => setNoticeDraft((d) => ({ ...d, body: e.target.value }))} />
                  <button onClick={publishNotice} className="btn-solid-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5">
                    <Send size={13} /> Publish Notice
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
