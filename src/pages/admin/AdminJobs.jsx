import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_PIPELINE } from '../../utils/eligibility';
import {
  Plus, Pencil, Trash2, X, Search, Briefcase, Clock, CheckCircle2,
  Copy, GripVertical, ListChecks, ShieldCheck, FileEdit, Sparkles,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const EMPTY = {
  company: '', role: '', salary: '', stipend: '', stipendType: 'Per Month',
  applyBefore: '', dateOfVisit: '', jobType: 'Intern', visitTentative: true,
  branches: ['CS', 'CS-AI&ML'], description: '',
  eligibility: {
    gender: 'Any', minCGPA: 7.0, maxCGPA: 10, maxCurrentArrears: null, maxArrearsHistory: null,
    batches: [], tenthMinPercent: null, twelfthMinPercent: null, diplomaMinPercent: null, twelfthOrDiploma: false,
  },
  pipeline: DEFAULT_PIPELINE.map((s) => ({ ...s })),
  questions: [],
};

const ALL_BRANCHES = ['CS', 'CS-AI&ML', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const ALL_BATCHES = ['2026', '2027', '2028'];

// Ready-made starting points so admin staff can launch a common drive type
// in a couple of clicks instead of typing every field from scratch.
const TEMPLATES = {
  'Tier-1 Product Intern': {
    jobType: 'Intern', stipend: '₹45,000 / mo', stipendType: 'Per Month',
    branches: ['CS', 'CS-AI&ML', 'IT', 'ECE'],
    eligibility: { gender: 'Any', minCGPA: 8.0, maxCGPA: 10, maxCurrentArrears: 0, maxArrearsHistory: 0, batches: [], tenthMinPercent: 75, twelfthMinPercent: 75, diplomaMinPercent: 75, twelfthOrDiploma: true },
    pipeline: DEFAULT_PIPELINE.map((s) => ({ ...s })),
  },
  'Service-Based FTE / GET': {
    jobType: 'GET', salary: '4.5 LPA',
    branches: ['CS', 'CS-AI&ML', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'],
    eligibility: { gender: 'Any', minCGPA: 6.5, maxCGPA: 10, maxCurrentArrears: 0, maxArrearsHistory: 2, batches: [], tenthMinPercent: 60, twelfthMinPercent: 60, diplomaMinPercent: 60, twelfthOrDiploma: true },
    pipeline: [
      { id: 'p1', name: 'Application & Resume Screening', type: 'screening' },
      { id: 'p2', name: 'Aptitude & English Test', type: 'test' },
      { id: 'p3', name: 'Technical Interview', type: 'interview' },
      { id: 'p4', name: 'HR Interview', type: 'interview' },
      { id: 'p5', name: 'Offer Rollout', type: 'offer' },
    ],
  },
  'Core Engineering FTE': {
    jobType: 'FTE', salary: '6.0 LPA',
    branches: ['MECH', 'CIVIL', 'EEE'],
    eligibility: { gender: 'Any', minCGPA: 7.0, maxCGPA: 10, maxCurrentArrears: 0, maxArrearsHistory: 1, batches: [], tenthMinPercent: 65, twelfthMinPercent: 65, diplomaMinPercent: 65, twelfthOrDiploma: true },
    pipeline: DEFAULT_PIPELINE.map((s) => ({ ...s })),
  },
};

const TABS = [
  { key: 'basic',       label: 'Basic Info',        icon: FileEdit },
  { key: 'eligibility', label: 'Eligibility Rules',  icon: ShieldCheck },
  { key: 'pipeline',    label: 'Hiring Pipeline',    icon: ListChecks },
  { key: 'questions',   label: 'Screening Questions', icon: Sparkles },
];

export default function AdminJobs() {
  const { jobs, addJob, updateJob, deleteJob, duplicateJob } = useApp();
  const [show, setShow]     = useState(false);
  const [editId, setEditId] = useState(null);
  const [editMeta, setEditMeta] = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [modalTab, setModalTab] = useState('basic');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openNew = () => { setForm(EMPTY); setEditId(null); setEditMeta(null); setModalTab('basic'); setShow(true); };

  const openEdit = (j) => {
    setForm({
      ...EMPTY,
      ...j,
      eligibility: { ...EMPTY.eligibility, ...(j.eligibility || {}) },
      pipeline: j.pipeline && j.pipeline.length > 0 ? j.pipeline.map((s) => ({ ...s })) : EMPTY.pipeline,
      questions: j.questions ? j.questions.map((q) => ({ ...q })) : [],
    });
    setEditId(j.id);
    setEditMeta({ createdByName: j.createdByName, createdAt: j.createdAt, updatedByName: j.updatedByName, updatedAt: j.updatedAt });
    setModalTab('basic');
    setShow(true);
  };

  const remove = (id) => { deleteJob(id); showToast('Drive deleted.'); };

  const duplicate = async (id) => {
    await duplicateJob(id);
    showToast('Drive duplicated — set new dates and publish.');
  };

  const cycleStatus = (id) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    const next = job.status === 'open' ? 'in_progress' : job.status === 'in_progress' ? 'closed' : 'open';
    updateJob(id, { status: next });
  };

  const save = () => {
    if (!form.company || !form.role) { setModalTab('basic'); showToast('Company and role are required.'); return; }
    if (editId) {
      updateJob(editId, form);
      showToast('Drive updated!');
    } else {
      addJob(form);
      showToast('Drive published! Students can now see and apply.');
    }
    setShow(false);
  };

  const applyTemplate = (name) => {
    const t = TEMPLATES[name];
    if (!t) return;
    setForm((p) => ({
      ...p,
      ...t,
      eligibility: { ...p.eligibility, ...t.eligibility },
      pipeline: t.pipeline.map((s) => ({ ...s })),
    }));
    showToast(`"${name}" template applied — adjust and publish.`);
  };

  const toggleBranch = (b) =>
    setForm((p) => ({ ...p, branches: p.branches.includes(b) ? p.branches.filter((x) => x !== b) : [...p.branches, b] }));

  const toggleBatch = (b) =>
    setForm((p) => ({ ...p, eligibility: { ...p.eligibility, batches: p.eligibility.batches.includes(b) ? p.eligibility.batches.filter((x) => x !== b) : [...p.eligibility.batches, b] } }));

  const setElig = (key, val) => setForm((p) => ({ ...p, eligibility: { ...p.eligibility, [key]: val } }));

  // Pipeline stage editing
  const addStage = () => setForm((p) => ({ ...p, pipeline: [...p.pipeline, { id: `p${Date.now()}`, name: '', type: 'interview' }] }));
  const updateStage = (id, name) => setForm((p) => ({ ...p, pipeline: p.pipeline.map((s) => (s.id === id ? { ...s, name } : s)) }));
  const removeStage = (id) => setForm((p) => ({ ...p, pipeline: p.pipeline.filter((s) => s.id !== id) }));
  const moveStage = (index, dir) => setForm((p) => {
    const arr = [...p.pipeline];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return p;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    return { ...p, pipeline: arr };
  });

  // Screening questions editing
  const addQuestion = () => setForm((p) => ({ ...p, questions: [...p.questions, { id: `q${Date.now()}`, text: '', type: 'text' }] }));
  const updateQuestion = (id, patch) => setForm((p) => ({ ...p, questions: p.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) }));
  const removeQuestion = (id) => setForm((p) => ({ ...p, questions: p.questions.filter((q) => q.id !== id) }));

  const totalCount      = jobs.length;
  const openCount       = jobs.filter((j) => j.status === 'open').length;
  const inProgressCount = jobs.filter((j) => j.status === 'in_progress').length;
  const closedCount     = jobs.filter((j) => j.status === 'closed').length;

  const filtered = jobs.filter((j) => {
    if (statusFilter !== 'All') {
      const key = statusFilter.toLowerCase().replace(' ', '_');
      if (j.status !== key) return false;
    }
    if (search) {
      const t = search.toLowerCase();
      if (!j.company.toLowerCase().includes(t) && !j.role.toLowerCase().includes(t)) return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg z-50"
             style={{ background: '#15803d' }}>{toast}</div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-retro">
            Manage Recruitment Drives
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">{totalCount} drives · changes appear instantly for students</p>
        </div>
        <button onClick={openNew} className="btn-solid-primary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5">
          <Plus size={15} /> Launch New Drive
        </button>
      </div>

      {/* Status Counter Cards (clickable filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'All',         label: 'Total Drives',       value: totalCount,       color: '#262654' },
          { key: 'Open',        label: 'Open For Applying',  value: openCount,        color: '#15803d' },
          { key: 'In Progress', label: 'Interviews Active',  value: inProgressCount,  color: '#b45309' },
          { key: 'Closed',      label: 'Concluded',          value: closedCount,      color: '#be123c' },
        ].map((s) => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              statusFilter === s.key ? 'shadow-md' : 'bg-white hover:bg-slate-50'
            }`}
            style={{ borderColor: statusFilter === s.key ? s.color : 'var(--border)',
                     background: statusFilter === s.key ? `${s.color}10` : '#fff' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card-solid p-3 bg-white border flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by company or role..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-solid pl-8 py-2 text-xs" />
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">{filtered.length} shown</span>
      </div>

      {/* Table */}
      <div className="card-solid bg-white overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[680px]">
            <thead className="bg-slate-50 border-b text-slate-400 font-bold text-[10px] uppercase tracking-wider"
                   style={{ borderColor: 'var(--border)' }}>
              <tr>
                {['Company & Role', 'Type', 'Salary', 'Deadline', 'Status (Click)', 'Posted By', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <Briefcase size={28} className="mx-auto mb-2 opacity-20" />
                    No drives found
                  </td>
                </tr>
              ) : filtered.map((j) => (
                <tr key={j.id} className="table-row-light">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 truncate max-w-[200px]">{j.company}</p>
                    <p className="text-slate-400 truncate max-w-[200px]">{j.role}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-semibold text-slate-600">{j.jobType}</td>
                  <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900">{j.salary || '—'}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-400 font-mono">
                    {j.applyBefore ? <span className="flex items-center gap-1"><Clock size={10} />{j.applyBefore}</span> : '—'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button onClick={() => cycleStatus(j.id)} title="Click to cycle status" className="hover:opacity-75 transition-opacity">
                      <StatusBadge status={j.status} />
                    </button>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500">{j.createdByName || '—'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(j)} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => duplicate(j.id)} title="Duplicate as template" className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"><Copy size={14} /></button>
                      <button onClick={() => remove(j.id)} title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal — Guided Job Builder */}
      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border shadow-2xl flex flex-col" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-bold text-slate-900 font-retro">
                {editId ? 'Edit Recruitment Drive' : 'Launch New Campus Drive'}
              </h3>
              <button onClick={() => setShow(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            {/* Quick-start templates (new drives only) */}
            {!editId && (
              <div className="px-6 pt-4 flex-shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Start — apply a template</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(TEMPLATES).map((name) => (
                    <button key={name} type="button" onClick={() => applyTemplate(name)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-700 border border-slate-200 transition-all">
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 flex-shrink-0 overflow-x-auto">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setModalTab(key)}
                  className={`tab-light text-xs whitespace-nowrap flex items-center gap-1.5 ${modalTab === key ? 'active' : ''}`}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {modalTab === 'basic' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company & Designation</p>
                    <input className="input-solid text-xs py-2 w-full" value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company Name *" />
                    <input className="input-solid text-xs py-2 w-full" value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Position / Role Title *" />
                  </div>

                  <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compensation & Type</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input className="input-solid text-xs py-2" value={form.salary}
                        onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Salary (e.g. 15L)" />
                      <input className="input-solid text-xs py-2" value={form.stipend}
                        onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="Stipend (e.g. 40K)" />
                      <select className="input-solid text-xs py-2" value={form.jobType}
                        onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
                        {['Intern', 'GET', 'FTE', 'PGET'].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Application Deadline</label>
                        <input className="input-solid text-xs py-2 w-full" type="date" value={form.applyBefore}
                          onChange={(e) => setForm({ ...form, applyBefore: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Campus Visit Date</label>
                        <input className="input-solid text-xs py-2 w-full" type="date" value={form.dateOfVisit}
                          onChange={(e) => setForm({ ...form, dateOfVisit: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <textarea className="input-solid h-20 text-xs py-2 resize-none w-full" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Role description, prerequisites, evaluation format..." />

                  {editMeta && (
                    <p className="text-[10px] text-slate-400 pt-1">
                      Created by {editMeta.createdByName || '—'} on {editMeta.createdAt ? new Date(editMeta.createdAt).toLocaleString('en-IN') : '—'}
                      {editMeta.updatedByName && <> · Last modified by {editMeta.updatedByName} on {new Date(editMeta.updatedAt).toLocaleString('en-IN')}</>}
                    </p>
                  )}
                </div>
              )}

              {modalTab === 'eligibility' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Eligible Branches</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_BRANCHES.map((b) => (
                        <button key={b} type="button" onClick={() => toggleBranch(b)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                            form.branches?.includes(b)
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic & General Eligibility</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Min CGPA</label>
                        <input className="input-solid text-xs py-2 w-full" type="number" step="0.1" value={form.eligibility.minCGPA}
                          onChange={(e) => setElig('minCGPA', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Max CGPA</label>
                        <input className="input-solid text-xs py-2 w-full" type="number" step="0.1" value={form.eligibility.maxCGPA}
                          onChange={(e) => setElig('maxCGPA', parseFloat(e.target.value) || 10)} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Gender</label>
                        <select className="input-solid text-xs py-2 w-full" value={form.eligibility.gender}
                          onChange={(e) => setElig('gender', e.target.value)}>
                          {['Any', 'Male', 'Female'].map((g) => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Max Current Arrears</label>
                        <input className="input-solid text-xs py-2 w-full" type="number" value={form.eligibility.maxCurrentArrears ?? ''}
                          placeholder="No limit"
                          onChange={(e) => setElig('maxCurrentArrears', e.target.value === '' ? null : parseInt(e.target.value, 10))} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Max Arrears History</label>
                        <input className="input-solid text-xs py-2 w-full" type="number" value={form.eligibility.maxArrearsHistory ?? ''}
                          placeholder="No limit"
                          onChange={(e) => setElig('maxArrearsHistory', e.target.value === '' ? null : parseInt(e.target.value, 10))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-2">Eligible Batches (pass-out year) — leave empty for all</label>
                      <div className="flex flex-wrap gap-2">
                        {ALL_BATCHES.map((b) => (
                          <button key={b} type="button" onClick={() => toggleBatch(b)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                              form.eligibility.batches.includes(b)
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">10th / 12th / Diploma Thresholds</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">10th % Required</label>
                        <input className="input-solid text-xs py-2 w-full" type="number" value={form.eligibility.tenthMinPercent ?? ''}
                          placeholder="No requirement"
                          onChange={(e) => setElig('tenthMinPercent', e.target.value === '' ? null : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">12th % Required</label>
                        <input className="input-solid text-xs py-2 w-full" type="number" value={form.eligibility.twelfthMinPercent ?? ''}
                          placeholder="No requirement"
                          onChange={(e) => setElig('twelfthMinPercent', e.target.value === '' ? null : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Diploma % Required</label>
                        <input className="input-solid text-xs py-2 w-full" type="number" value={form.eligibility.diplomaMinPercent ?? ''}
                          placeholder="No requirement"
                          onChange={(e) => setElig('diplomaMinPercent', e.target.value === '' ? null : parseFloat(e.target.value))} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={form.eligibility.twelfthOrDiploma}
                        onChange={(e) => setElig('twelfthOrDiploma', e.target.checked)} />
                      Accept either 12th OR Diploma (instead of requiring both)
                    </label>
                  </div>
                </div>
              )}

              {modalTab === 'pipeline' && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-500">Define the rounds candidates move through. Students see this as their selection process; admins advance applicants stage by stage.</p>
                  {form.pipeline.map((stage, i) => (
                    <div key={stage.id} className="flex items-center gap-2 p-2.5 rounded-xl border bg-white" style={{ borderColor: 'var(--border)' }}>
                      <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #1B1B3D 0%, #262654 100%)' }}>{i + 1}</span>
                      <input className="input-solid text-xs py-1.5 flex-1" value={stage.name}
                        onChange={(e) => updateStage(stage.id, e.target.value)} placeholder="Round name" />
                      <button type="button" onClick={() => moveStage(i, -1)} disabled={i === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25">▲</button>
                      <button type="button" onClick={() => moveStage(i, 1)} disabled={i === form.pipeline.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25">▼</button>
                      <button type="button" onClick={() => removeStage(stage.id)} className="p-1 text-slate-400 hover:text-red-600">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addStage} className="btn-solid-secondary px-3 py-1.5 text-xs flex items-center gap-1.5">
                    <Plus size={13} /> Add Round
                  </button>
                </div>
              )}

              {modalTab === 'questions' && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-500">Optional screening questions shown to students when they apply for this drive.</p>
                  {form.questions.length === 0 && (
                    <p className="text-slate-400 italic py-3">No screening questions added — students apply with just their resume.</p>
                  )}
                  {form.questions.map((q, i) => (
                    <div key={q.id} className="flex items-start gap-2 p-2.5 rounded-xl border bg-white" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-slate-400 font-bold mt-2">{i + 1}.</span>
                      <input className="input-solid text-xs py-1.5 flex-1" value={q.text}
                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })} placeholder="Question text" />
                      <select className="input-solid text-xs py-1.5" style={{ width: '110px' }} value={q.type}
                        onChange={(e) => updateQuestion(q.id, { type: e.target.value })}>
                        <option value="text">Short Answer</option>
                        <option value="yesno">Yes / No</option>
                      </select>
                      <button type="button" onClick={() => removeQuestion(q.id)} className="p-1.5 text-slate-400 hover:text-red-600">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addQuestion} className="btn-solid-secondary px-3 py-1.5 text-xs flex items-center gap-1.5">
                    <Plus size={13} /> Add Question
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              <button type="button" onClick={() => setShow(false)} className="btn-solid-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="button" onClick={save} className="btn-solid-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={13} /> {editId ? 'Save Changes' : 'Publish Drive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
