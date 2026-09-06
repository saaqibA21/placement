import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Snowflake, UserCheck, Trophy, Layers, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function AdminStudents() {
  const { students, toggleStudentFreeze } = useApp();
  const [search, setSearch]       = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [cgpaFilter, setCgpaFilter]     = useState('All');

  const branches = ['All', 'CS', 'CS-AI&ML', 'IT', 'ECE', 'EEE', 'MECH'];

  const totalStudents = students.length;
  const placedCount   = students.filter((s) => (s.offers || 0) > 0).length;
  const frozenCount   = students.filter((s) => s.status === 'frozen').length;
  const activeCount   = students.filter((s) => s.status === 'active').length;

  const filtered = students.filter((s) => {
    if (branchFilter !== 'All' && s.branch !== branchFilter) return false;
    if (cgpaFilter === '>9.0' && s.cgpa < 9.0) return false;
    if (cgpaFilter === '8.0–9.0' && (s.cgpa < 8.0 || s.cgpa >= 9.0)) return false;
    if (cgpaFilter === '<8.0' && s.cgpa >= 8.0) return false;
    if (search) {
      const t = search.toLowerCase();
      return s.name.toLowerCase().includes(t) || s.rollNo.toLowerCase().includes(t) || s.email.toLowerCase().includes(t);
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
              Student Placement Directory
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">{totalStudents} enrolled university candidates</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Enrolled',      value: totalStudents, color: '#162E34', icon: Layers       },
            { label: 'Offers Extended',     value: placedCount,   color: '#15803d', icon: Trophy       },
            { label: 'Active Candidates',   value: activeCount,   color: '#0369a1', icon: CheckCircle2 },
            { label: 'Frozen Eligibility',  value: frozenCount,   color: '#b45309', icon: Snowflake    },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="p-3.5 bg-white rounded-xl border flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{s.label}</span>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
                <div className="p-2.5 rounded-xl" style={{ background: `${s.color}15` }}>
                  <Icon size={17} style={{ color: s.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="card-solid p-4 bg-white space-y-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name, roll number, email..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-solid pl-9 text-xs py-2" />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold flex-wrap">
            <span className="px-2 text-slate-400">CGPA:</span>
            {['All', '>9.0', '8.0–9.0', '<8.0'].map((cg) => (
              <button key={cg} onClick={() => setCgpaFilter(cg)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  cgpaFilter === cg ? 'bg-white font-bold shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
                style={cgpaFilter === cg ? { color: 'var(--amber-gold)' } : {}}>
                {cg}
              </button>
            ))}
          </div>
        </div>
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto gap-0.5">
          {branches.map((b) => (
            <button key={b} onClick={() => setBranchFilter(b)}
              className={`tab-light text-xs whitespace-nowrap ${branchFilter === b ? 'active' : ''}`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-solid bg-white overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead className="bg-slate-50 border-b text-slate-400 font-bold text-[10px] uppercase tracking-wider"
                   style={{ borderColor: 'var(--border)' }}>
              <tr>
                {['Student', 'Roll Number', 'Branch', 'CGPA', 'Applied', 'Offers', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-slate-400 py-16">No students match current filters.</td></tr>
              ) : filtered.map((student) => (
                <tr key={student.id} className="table-row-light">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                           style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{student.name}</p>
                        <p className="text-slate-400 text-[10px] font-mono">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600 font-mono whitespace-nowrap">{student.rollNo}</td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">{student.branch}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold" style={{ color: student.cgpa >= 9.0 ? '#15803d' : student.cgpa >= 8.0 ? '#0284c7' : 'var(--amber-gold)' }}>
                      {student.cgpa}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap">{student.applied}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {(student.offers || 0) > 0 ? (
                      <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        <Trophy size={11} /> {student.offers}
                      </span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={student.status} /></td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button onClick={() => toggleStudentFreeze(student.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        student.status === 'active'
                          ? 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                          : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                      }`}>
                      {student.status === 'active'
                        ? <><Snowflake size={11} className="text-blue-500" /> Freeze</>
                        : <><UserCheck size={11} /> Unfreeze</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
