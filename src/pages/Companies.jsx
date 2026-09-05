import { useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

const TYPES = ['All', 'Product', 'Service', 'Consulting', 'Finance', 'Core'];

export default function Companies() {
  const { companies } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = companies.filter((c) => {
    if (filter !== 'All' && c.type !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:'0.03em' }}>
            Visiting Recruitment Partners
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Corporate partners and schedule of campus hiring drives</p>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-solid pl-9 text-xs py-2 w-full sm:w-60"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200 overflow-x-auto gap-0.5">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`tab-light text-xs whitespace-nowrap ${filter === t ? 'active' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="card-solid card-solid-hover p-5 bg-white flex flex-col justify-between" style={{ borderColor: '#D9E3E0' }}>
            <div>
              {/* Logo & Category */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${c.color} text-white font-extrabold text-lg flex items-center justify-center`}>
                  {c.logo}
                </div>
                <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {c.type}
                </span>
              </div>

              <h3 className="text-sm font-bold text-gray-900 mb-2">{c.name}</h3>

              {/* Roles */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {c.roles.map((r) => (
                  <span key={r} className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Visit Date & Status Footer */}
            <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: '#D9E3E0' }}>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={12} />
                {c.visitDate ? new Date(c.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
              </span>
              <StatusBadge status={c.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
