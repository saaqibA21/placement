import { useState } from 'react';
import { Plus, X, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

export default function Requests() {
  const { requests, setRequests } = useApp();
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ type: 'Profile Update', description: '' });

  const submit = () => {
    if (!form.description.trim()) return;
    setRequests((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: form.type,
        description: form.description,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      },
    ]);
    setForm({ type: 'Profile Update', description: '' });
    setShowForm(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:'0.03em' }}>
            Placement Cell Requests
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Submit appeals for profile amendments, documents, and exemptions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-solid-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus size={15} /> Raise New Request
        </button>
      </div>

      <div className="grid gap-3">
        {(requests || []).map((r) => (
          <div key={r.id} className="card-solid p-5 bg-white border" style={{ borderColor: '#D9E3E0' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full mb-2 inline-block"
                      style={{ background: '#FBEEE2', color: '#D9642F', border: '1px solid #EFC7A8' }}>
                  {r.type}
                </span>
                <h3 className="text-sm font-semibold text-gray-900 mt-1">{r.description}</h3>
                <p className="text-[11px] text-gray-400 mt-2">
                  Filed on {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border shadow-2xl" style={{ borderColor: '#D9E3E0' }}>
            <div className="flex items-center justify-between pb-4 mb-5 border-b" style={{ borderColor: '#D9E3E0' }}>
              <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:'0.03em' }}>Raise Formal Request</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">
                  Category Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="input-solid text-xs py-2"
                >
                  {['Profile Update', 'Document Request', 'Freeze Request', 'Special Exemption'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">
                  Explanation & Justification
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail reason for this placement request..."
                  className="input-solid h-28 text-xs py-2 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t mt-4" style={{ borderColor: '#D9E3E0' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-solid-secondary px-4 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="btn-solid-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <Send size={13} /> Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
