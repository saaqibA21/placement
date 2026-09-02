import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Pencil, Trash2, X, Search, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const EMPTY = {
  company: '', role: '', salary: '', stipend: '', stipendType: 'Per Month',
  applyBefore: '', dateOfVisit: '', jobType: 'Intern', visitTentative: true,
  minCGPA: 7.0, branches: ['CS', 'CS-AI&ML'], description: '',
};

const ALL_BRANCHES = ['CS', 'CS-AI&ML', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

export default function AdminJobs() {
  const { jobs, addJob, updateJob, deleteJob } = useApp();   // ← shared context
  const [show, setShow]     = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openNew = () => { setForm(EMPTY); setEditId(null); setShow(true); };

  const openEdit = (j) => { setForm({ ...j }); setEditId(j.id); setShow(true); };

  const remove = (id) => { deleteJob(id); showToast('Drive deleted.'); };

  const cycleStatus = (id) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    const next = job.status === 'open' ? 'in_progress' : job.status === 'in_progress' ? 'closed' : 'open';
    updateJob(id, { status: next });
  };

  const save = () => {
    if (!form.company || !form.role) return;
    if (editId) {
      updateJob(editId, form);
      showToast('Drive updated!');
    } else {
      addJob(form);
      showToast('Drive published! Students can now see and apply.');
    }
    setShow(false);
  };

  const toggleBranch = (b) =>
    setForm((p) => ({ ...p, branches: p.branches.includes(b) ? p.branches.filter((x) => x !== b) : [...p.branches, b] }));

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
             style={{ background: '#15803d' }}>✓ {toast}</div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{fontFamily:'Cinzel,serif'}}>Manage Recruitment Drives</h1>
          <p className="text-gray-500 text-xs mt-0.5">{totalCount} drives · changes appear instantly for students</p>
        </div>
        <button onClick={openNew} className="btn-solid-primary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5">
          <Plus size={15} /> Launch New Drive
        </button>
      </div>

      {/* Status Counter Cards (clickable filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'All',         label: 'Total Drives',       value: totalCount,       color: '#8B1A1A' },
          { key: 'Open',        label: 'Open For Applying',  value: openCount,        color: '#15803d' },
          { key: 'In Progress', label: 'Interviews Active',  value: inProgressCount,  color: '#b45309' },
          { key: 'Closed',      label: 'Concluded',          value: closedCount,      color: '#be123c' },
        ].map((s) => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              statusFilter === s.key ? 'shadow-md' : 'bg-white hover:bg-amber-50/40'
            }`}
            style={{ borderColor: statusFilter === s.key ? s.color : '#EDE0D0',
                     background: statusFilter === s.key ? `${s.color}10` : '#fff' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{s.label}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card-solid p-3 bg-white border border-gray-100 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by company or role..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-solid pl-8 py-2 text-xs" />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{filtered.length} shown</span>
      </div>

      {/* Table */}
      <div className="card-solid bg-white overflow-hidden border" style={{ borderColor: '#EDE0D0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead className="bg-gray-50 border-b text-gray-400 font-bold text-[10px] uppercase tracking-wider"
                   style={{ borderColor: '#EDE0D0' }}>
              <tr>
                {['Company & Role', 'Type', 'Salary', 'Deadline', 'Status (Click)', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: '#EDE0D0' }}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Briefcase size={28} className="mx-auto mb-2 opacity-20" />
                    No drives found
                  </td>
                </tr>
              ) : filtered.map((j) => (
                <tr key={j.id} className="table-row-light">
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900 truncate max-w-[200px]">{j.company}</p>
                    <p className="text-gray-400 truncate max-w-[200px]">{j.role}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-600">{j.jobType}</td>
                  <td className="px-5 py-4 whitespace-nowrap font-bold text-gray-900">{j.salary || '—'}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-gray-400 font-mono">
                    {j.applyBefore ? <span className="flex items-center gap-1"><Clock size={10} />{j.applyBefore}</span> : '—'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button onClick={() => cycleStatus(j.id)} title="Click to cycle status" className="hover:opacity-75 transition-opacity">
                      <StatusBadge status={j.status} />
                    </button>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(j)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => remove(j.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border shadow-2xl" style={{ borderColor: '#EDE0D0' }}>
            <div className="flex items-center justify-between pb-4 mb-5 border-b" style={{ borderColor: '#EDE0D0' }}>
              <h3 className="text-base font-bold text-gray-900" style={{fontFamily:'Cinzel,serif'}}>
                {editId ? 'Edit Recruitment Drive' : 'Launch New Campus Drive'}
              </h3>
              <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Company & Role */}
              <div className="p-4 rounded-xl border space-y-3" style={{ background: '#FFFDF7', borderColor: '#EDE0D0' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Company & Designation</p>
                <input className="input-solid text-xs py-2" value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company Name *" />
                <input className="input-solid text-xs py-2" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Position / Role Title *" />
              </div>

              {/* Compensation */}
              <div className="p-4 rounded-xl border space-y-3" style={{ background: '#FFFDF7', borderColor: '#EDE0D0' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Compensation & Type</p>
                <div className="grid grid-cols-3 gap-3">
                  <input className="input-solid text-xs py-2" value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Salary (e.g. 15L)" />
                  <input className="input-solid text-xs py-2" value={form.stipend}
                    onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="Stipend (e.g. 40K)" />
                  <select className="input-solid text-xs py-2" value={form.jobType}
                    onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
                    {['Intern', 'GET', 'FTE', 'PGET'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Eligibility & Dates */}
              <div className="p-4 rounded-xl border space-y-3" style={{ background: '#FFFDF7', borderColor: '#EDE0D0' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Eligibility & Schedule</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Min CGPA</label>
                    <input className="input-solid text-xs py-2" type="number" step="0.1" value={form.minCGPA}
                      onChange={(e) => setForm({ ...form, minCGPA: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Application Deadline</label>
                    <input className="input-solid text-xs py-2" type="date" value={form.applyBefore}
                      onChange={(e) => setForm({ ...form, applyBefore: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Campus Visit Date</label>
                    <input className="input-solid text-xs py-2" type="date" value={form.dateOfVisit}
                      onChange={(e) => setForm({ ...form, dateOfVisit: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-2">Eligible Branches</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_BRANCHES.map((b) => (
                      <button key={b} type="button" onClick={() => toggleBranch(b)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                          form.branches?.includes(b)
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <textarea className="input-solid h-20 text-xs py-2 resize-none" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Role description, prerequisites, evaluation format..." />
            </div>

            <div className="flex justify-end gap-2 pt-5 border-t mt-5" style={{ borderColor: '#EDE0D0' }}>
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
