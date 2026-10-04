import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Briefcase, AlertTriangle, Info, RefreshCw, Search, X, ChevronLeft, User } from 'lucide-react';

const CATEGORIES = [
  { key: 'all',          label: 'All',          icon: Bell          },
  { key: 'job',          label: 'Job Notices',  icon: Briefcase     },
  { key: 'reminder',     label: 'Reminders',    icon: AlertTriangle },
  { key: 'general',      label: 'General',      icon: Info          },
  { key: 'announcement', label: 'Announcements',icon: RefreshCw     },
];

const CAT_COLORS = {
  job: 'text-blue-600 bg-blue-50 border-blue-200',
  reminder: 'text-amber-700 bg-amber-50 border-amber-200',
  general: 'text-gray-600 bg-gray-50 border-gray-200',
  announcement: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

export default function Notice() {
  const { notices } = useApp();
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
  const activeNotice = active ? notices.find((n) => n.id === active.id) || active : null;

  return (
    <div className="flex h-full overflow-hidden flex-col md:flex-row">
      {/* Category Rail (Desktop: sidebar, Mobile: horizontal pill bar) */}
      <div className="hidden md:flex w-[150px] lg:w-[170px] flex-shrink-0 border-r flex-col bg-white" style={{ borderColor: 'var(--border)' }}>
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Categories</p>
          {unreadCount > 0 && <p className="text-xs font-bold mt-1" style={{ color: 'var(--amber-gold)' }}>{unreadCount} unread</p>}
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {CATEGORIES.map(({ key, label, icon: Icon }) => {
            const count = key === 'all' ? notices.length : notices.filter((n) => n.category === key).length;
            return (
              <button key={key} onClick={() => setCat(key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                  cat === key ? 'text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
                style={cat === key ? { background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' } : {}}>
                <Icon size={13} className="flex-shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cat === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Top Category Scroll Bar */}
      <div className="md:hidden flex items-center gap-1.5 p-2.5 bg-white border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {CATEGORIES.map(({ key, label, icon: Icon }) => {
          const count = key === 'all' ? notices.length : notices.filter((n) => n.category === key).length;
          const isSelected = cat === key;
          return (
            <button
              key={key}
              onClick={() => setCat(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-medium transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon size={12} />
              <span>{label}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Notice List Panel */}
      <div className={`w-full md:w-[280px] lg:w-[320px] flex-shrink-0 border-r flex flex-col bg-white ${activeNotice ? 'hidden md:flex' : 'flex'}`} style={{ borderColor: 'var(--border)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search notices..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-solid pl-8 py-2 text-xs w-full" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={13} /></button>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y" style={{ divideColor: 'var(--border)' }}>
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No notices found</div>
          ) : filtered.map((n) => {
            const isUnread = !readIds.has(n.id);
            const isSelected = activeNotice?.id === n.id;
            return (
              <button key={n.id} onClick={() => { setActive(n); markRead(n.id); }}
                className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer ${
                  isSelected ? 'bg-amber-50/70 border-l-4' : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                }`}
                style={isSelected ? { borderLeftColor: 'var(--amber-gold)' } : {}}>
                <div className="flex items-start gap-2">
                  {isUnread && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 dot-live-gold" style={{ background: 'var(--amber-bright)' }} />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug line-clamp-2 ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {n.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {n.tags?.map((tag) => (
                        <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${CAT_COLORS[n.category] || CAT_COLORS.general}`}>{tag}</span>
                      ))}
                      <span className="text-[9px] text-slate-400">{n.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reader Pane */}
      <div className={`flex-1 overflow-y-auto ${activeNotice ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`} style={{ background: 'var(--canvas-bg)' }}>
        {activeNotice ? (
          <div>
            {/* Mobile Header Bar with Back Button */}
            <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border-b" style={{ borderColor: 'var(--border)' }}>
              <button 
                onClick={() => setActive(null)} 
                className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
              >
                <ChevronLeft size={15} /> Back to Notices
              </button>
            </div>

            <div className="p-4 sm:p-8 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeNotice.tags?.map((tag) => (
                  <span key={tag} className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${CAT_COLORS[activeNotice.category] || CAT_COLORS.general}`}>{tag}</span>
                ))}
                <span className="text-[10px] text-slate-400">{activeNotice.timeAgo}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 leading-snug" style={{ fontFamily: 'Cinzel,serif' }}>{activeNotice.title}</h2>
              <div className="flex items-center gap-2 mb-5 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className={`w-8 h-8 rounded-xl ${activeNotice.authorColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                  {activeNotice.authorInitial}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{activeNotice.author}</p>
                  <p className="text-[10px] text-slate-400">Department of Placement & Corporate Relations · Jeppiaar University</p>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                {activeNotice.body}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 p-8">
            <div className="text-center">
              <Bell size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Select a circular to read</p>
              <p className="text-xs mt-1">Updates from the placement directorate appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
