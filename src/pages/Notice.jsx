import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Briefcase, AlertTriangle, Info, RefreshCw, Search, X } from 'lucide-react';

const CATEGORIES = [
  { key: 'all',          label: 'All',          icon: Bell          },
  { key: 'job',          label: 'Job Notices',  icon: Briefcase     },
  { key: 'reminder',     label: 'Reminders',    icon: AlertTriangle },
  { key: 'general',      label: 'General',      icon: Info          },
  { key: 'announcement', label: 'Announcements',icon: RefreshCw     },
];

const CAT_COLORS = {
  job: 'text-blue-600 bg-blue-50 border-blue-200',
  reminder: 'text-amber-600 bg-amber-50 border-amber-200',
  general: 'text-gray-600 bg-gray-50 border-gray-200',
  announcement: 'text-green-600 bg-green-50 border-green-200',
};

export default function Notice() {
  const { notices } = useApp();    // ← reads from shared global state (admin writes sync here)
  const [readIds, setReadIds] = useState(new Set());
  const [cat, setCat]     = useState('all');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);

  const markRead = (id) => setReadIds((prev) => new Set([...prev, id]));

  const filtered = notices.filter((n) => {
    if (cat !== 'all' && n.category !== cat) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notices.filter((n) => !readIds.has(n.id)).length;

  const activeNotice = active ? notices.find((n) => n.id === active.id) || active : (notices.length > 0 ? notices[0] : null);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Category Rail */}
      <div className="w-[140px] sm:w-[160px] flex-shrink-0 border-r flex flex-col bg-white" style={{ borderColor: '#D9E3E0' }}>
        <div className="px-4 py-4 border-b" style={{ borderColor: '#D9E3E0' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Categories</p>
          {unreadCount > 0 && <p className="text-xs font-bold mt-1" style={{ color: '#D9642F' }}>{unreadCount} unread</p>}
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {CATEGORIES.map(({ key, label, icon: Icon }) => {
            const count = key === 'all' ? notices.length : notices.filter((n) => n.category === key).length;
            return (
              <button key={key} onClick={() => setCat(key)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  cat === key ? 'text-white' : 'text-gray-500 hover:bg-amber-50'
                }`}
                style={cat === key ? { background: '#D9642F' } : {}}>
                <Icon size={13} className="flex-shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cat === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Notice List */}
      <div className="w-[260px] sm:w-[300px] flex-shrink-0 border-r flex flex-col bg-white" style={{ borderColor: '#D9E3E0' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: '#D9E3E0' }}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search notices..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-solid pl-8 py-2 text-xs" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={13} /></button>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y" style={{ divideColor: '#D9E3E0' }}>
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">No notices found</div>
          ) : filtered.map((n) => {
            const isUnread = !readIds.has(n.id);
            return (
              <button key={n.id} onClick={() => { setActive(n); markRead(n.id); }}
                className={`w-full text-left px-4 py-3.5 transition-colors ${
                  activeNotice?.id === n.id ? 'bg-red-50 border-l-4' : 'hover:bg-amber-50/50'
                }`}
                style={activeNotice?.id === n.id ? { borderLeftColor: '#D9642F' } : {}}>
                <div className="flex items-start gap-2">
                  {isUnread && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#D9642F' }} />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug line-clamp-2 ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                      {n.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {n.tags?.map((tag) => (
                        <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${CAT_COLORS[n.category] || CAT_COLORS.general}`}>{tag}</span>
                      ))}
                      <span className="text-[9px] text-gray-400">{n.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reader Pane */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#EFF5F3' }}>
        {activeNotice ? (
          <div className="p-6 sm:p-8 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {activeNotice.tags?.map((tag) => (
                <span key={tag} className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${CAT_COLORS[activeNotice.category] || CAT_COLORS.general}`}>{tag}</span>
              ))}
              <span className="text-[10px] text-gray-400">{activeNotice.timeAgo}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-3 leading-snug" style={{fontFamily:"'Bebas Neue',sans-serif", letterSpacing:'0.03em'}}>{activeNotice.title}</h2>
            <div className="flex items-center gap-2 mb-5 pb-5 border-b" style={{ borderColor: '#D9E3E0' }}>
              <div className={`w-8 h-8 rounded-xl ${activeNotice.authorColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                {activeNotice.authorInitial}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">{activeNotice.author}</p>
                <p className="text-[10px] text-gray-400">Placement Cell, Jeppiaar College</p>
              </div>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{activeNotice.body}</div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Bell size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No notices yet</p>
              <p className="text-xs mt-1">Admin will publish notices here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
