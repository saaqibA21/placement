import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Pencil, Trash2, X, Send, Bell } from 'lucide-react';

const TAG_OPTIONS = ['Job', 'Announcement', 'General', 'Reminder'];

const EMPTY_FORM = {
  title: '', body: '', tags: ['Announcement'],
  author: 'Jeppier Placement Cell', authorInitial: 'J',
  authorColor: 'bg-red-800', timeAgo: 'Just now', category: 'announcement',
};

export default function AdminNotices() {
  const { notices, addNotice, updateNotice, deleteNotice } = useApp();  // ← shared context
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [selected, setSelected]   = useState(notices[0] || null);
  const [toast, setToast]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openNew  = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (n) => { setForm({ ...n }); setEditingId(n.id); setShowForm(true); };

  const save = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      updateNotice(editingId, form);           // ← updates shared context
      showToast('Notice updated! Students see the change.');
    } else {
      addNotice(form);                         // ← adds to shared context
      showToast('Notice published! Students can see it now.');
    }
    setShowForm(false);
  };

  const remove = (id) => {
    deleteNotice(id);                          // ← removes from shared context
    if (selected?.id === id) setSelected(notices.filter((n) => n.id !== id)[0] || null);
    showToast('Notice deleted.');
  };

  const toggleTag = (tag) =>
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg z-50"
             style={{ background: '#15803d' }}>✓ {toast}</div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{fontFamily:'Cinzel,serif'}}>Broadcast Circulars</h1>
          <p className="text-gray-500 text-xs mt-0.5">{notices.length} circulars · published notices appear instantly for students</p>
        </div>
        <button onClick={openNew} className="btn-solid-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5">
          <Plus size={15} /> Publish New Notice
        </button>
      </div>

      <div className="card-solid bg-white overflow-hidden flex flex-col md:flex-row" style={{ minHeight: '520px', borderColor: '#EDE0D0' }}>
        {/* Notice List */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r flex flex-col" style={{ borderColor: '#EDE0D0', background: '#FFFDF7' }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#EDE0D0' }}>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">All Notices</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF0F0', color: '#8B1A1A' }}>
              {notices.length}
            </span>
          </div>
          <div className="overflow-y-auto flex-1 divide-y" style={{ divideColor: '#EDE0D0' }}>
            {notices.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">No notices yet. Publish one!</div>
            ) : notices.map((n) => (
              <div key={n.id} onClick={() => setSelected(n)}
                className={`p-4 cursor-pointer transition-all flex items-start justify-between gap-2 ${
                  selected?.id === n.id ? 'border-l-4 bg-red-50' : 'hover:bg-amber-50/50 border-l-4 border-l-transparent'
                }`}
                style={selected?.id === n.id ? { borderLeftColor: '#8B1A1A' } : {}}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{ background: '#FFF0F0', color: '#8B1A1A' }}>
                      {n.tags[0] || 'Notice'}
                    </span>
                    <span className="text-[10px] text-gray-400">{n.timeAgo}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">{n.title}</h4>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(n); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Pencil size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Pane */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          {selected ? (
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b" style={{ borderColor: '#EDE0D0' }}>
                <div className={`w-10 h-10 rounded-xl ${selected.authorColor} text-white font-bold text-sm flex items-center justify-center flex-shrink-0`}>
                  {selected.authorInitial}
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-gray-800">{selected.author}</h3>
                  <p className="text-[10px] text-gray-400">Official Circular · {selected.timeAgo}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {selected.tags.map((t) => (
                    <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: '#FFF0F0', color: '#8B1A1A', border: '1px solid #F5CCCC' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 leading-snug" style={{fontFamily:'Cinzel,serif'}}>{selected.title}</h2>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.body}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Select a notice to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto border shadow-2xl" style={{ borderColor: '#EDE0D0' }}>
            <div className="flex items-center justify-between pb-4 mb-5 border-b" style={{ borderColor: '#EDE0D0' }}>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2" style={{fontFamily:'Cinzel,serif'}}>
                <Bell size={16} style={{ color: '#8B1A1A' }} />
                {editingId ? 'Edit Circular' : 'Broadcast New Circular'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Notice Title *</label>
                <input className="input-solid text-xs py-2" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. STELLANTIS Shortlist & PPT Round Schedule..." />
              </div>
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider block mb-2">Category Tags</label>
                <div className="flex gap-2 flex-wrap">
                  {TAG_OPTIONS.map((tag) => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                        form.tags.includes(tag)
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Content *</label>
                <textarea className="input-solid h-36 text-xs py-2 resize-none leading-relaxed" value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Provide instructions, registration links, venue details, deadlines..." />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-5 border-t mt-5" style={{ borderColor: '#EDE0D0' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-solid-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="button" onClick={save} className="btn-solid-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5">
                <Send size={13} /> {editingId ? 'Save Changes' : 'Broadcast Notice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
