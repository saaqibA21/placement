import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Pencil, Trash2, X, Building2, Calendar, Search } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const EMPTY_FORM = { name: '', type: 'Product', logo: '', color: 'bg-red-800', visitDate: '', roles: [], status: 'upcoming' };
const TYPES = ['Product', 'Service', 'Consulting', 'Finance', 'Core'];
const COLORS = ['bg-red-800', 'bg-indigo-600', 'bg-emerald-600', 'bg-rose-600', 'bg-purple-600', 'bg-amber-600', 'bg-teal-600', 'bg-blue-600'];

export default function AdminCompanies() {
  const { companies, addCompany, updateCompany, deleteCompany } = useApp();  // ← shared context
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [search, setSearch]       = useState('');
  const [rolesInput, setRolesInput] = useState('');
  const [toast, setToast]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openNew = () => { setForm(EMPTY_FORM); setRolesInput(''); setEditingId(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ ...c }); setRolesInput(c.roles.join(', ')); setEditingId(c.id); setShowForm(true); };

  const save = () => {
    if (!form.name) return;
    const finalForm = {
      ...form,
      roles: rolesInput.split(',').map((r) => r.trim()).filter(Boolean),
      logo: form.name.charAt(0).toUpperCase(),
    };
    if (editingId) {
      updateCompany(editingId, finalForm);
    } else {
      addCompany(finalForm);
    }
    showToast(editingId ? 'Partner updated!' : 'Partner added!');
    setShowForm(false);
  };

  const filtered = companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg z-50"
             style={{ background: '#15803d' }}>✓ {toast}</div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{fontFamily:"'Bebas Neue',sans-serif", letterSpacing:'0.03em'}}>Corporate Partners</h1>
          <p className="text-gray-500 text-xs mt-0.5">{companies.length} partners registered for campus hiring</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search company..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-solid pl-9 text-xs py-2 w-48" />
          </div>
          <button onClick={openNew} className="btn-solid-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5">
            <Plus size={15} /> Add Partner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((company) => (
          <div key={company.id} className="card-solid card-solid-hover p-5 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${company.color} text-white font-extrabold text-lg flex items-center justify-center`}>
                  {company.logo}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(company)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => { deleteCompany(company.id); showToast('Partner removed.'); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{company.name}</h3>
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mb-3">{company.type}</span>
              <div className="flex flex-wrap gap-1.5 mb-4 min-h-[32px]">
                {company.roles.map((r) => (
                  <span key={r} className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">{r}</span>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: '#D9E3E0' }}>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={11} />
                {company.visitDate ? new Date(company.visitDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : 'TBD'}
              </span>
              <StatusBadge status={company.status} />
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border shadow-2xl" style={{ borderColor: '#D9E3E0' }}>
            <div className="flex items-center justify-between pb-4 mb-5 border-b" style={{ borderColor: '#D9E3E0' }}>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2" style={{fontFamily:"'Bebas Neue',sans-serif", letterSpacing:'0.03em'}}>
                <Building2 size={16} style={{ color: '#D9642F' }} />
                {editingId ? 'Edit Partner' : 'Add Corporate Partner'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-600 block mb-1.5">Company Name *</label>
                <input className="input-solid text-xs py-2" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Goldman Sachs" />
              </div>
              <div>
                <label className="font-semibold text-gray-600 block mb-1.5">Industry Sector</label>
                <select className="input-solid text-xs py-2" value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-600 block mb-2">Brand Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-lg ${c} transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : 'opacity-60 hover:opacity-100'}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 block mb-1.5">Offered Roles (comma separated)</label>
                <input className="input-solid text-xs py-2" value={rolesInput}
                  onChange={(e) => setRolesInput(e.target.value)} placeholder="e.g. SWE Intern, PM Intern" />
              </div>
              <div>
                <label className="font-semibold text-gray-600 block mb-1.5">Campus Visit Date</label>
                <input className="input-solid text-xs py-2" type="date" value={form.visitDate}
                  onChange={(e) => setForm({ ...form, visitDate: e.target.value })} />
              </div>
              <div>
                <label className="font-semibold text-gray-600 block mb-1.5">Status</label>
                <select className="input-solid text-xs py-2" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="upcoming">Upcoming</option>
                  <option value="visited">Visited</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-5 border-t mt-5" style={{ borderColor: '#D9E3E0' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-solid-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="button" onClick={save} className="btn-solid-primary px-5 py-2 text-xs font-bold">{editingId ? 'Save' : 'Add Partner'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
