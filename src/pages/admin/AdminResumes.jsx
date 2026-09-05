import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Download, X, User, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const STATUS_TABS = ['All', 'Pending', 'Shortlisted', 'Rejected'];

export default function AdminResumes() {
  const { applications, updateApplicationStatus } = useApp();  // ← shared context
  const [statusTab, setStatusTab] = useState('All');
  const [search, setSearch]   = useState('');
  const [drawer, setDrawer]   = useState(null);
  const [toast, setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleUpdate = (id, newStatus) => {
    updateApplicationStatus(id, newStatus);           // ← writes to shared context
    if (drawer?.id === id) setDrawer((d) => ({ ...d, status: newStatus }));
    showToast(`Candidate ${newStatus}!`);
  };

  const counts = {
    All: applications.length,
    Pending: applications.filter((a) => a.status === 'pending').length,
    Shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    Rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const filtered = applications.filter((a) => {
    if (statusTab !== 'All' && a.status !== statusTab.toLowerCase()) return false;
    if (search) {
      const t = search.toLowerCase();
      return a.studentName.toLowerCase().includes(t) || a.rollNo.toLowerCase().includes(t) || a.company.toLowerCase().includes(t);
    }
    return true;
  });

  // Keep drawer in sync with context
  const drawerData = drawer ? applications.find((a) => a.id === drawer.id) || drawer : null;

  const exportCSV = () => {
    const header = 'Name,Roll No,Branch,CGPA,Company,Role,Applied On,Status';
    const rows = applications.map((a) =>
      `"${a.studentName}","${a.rollNo}","${a.branch}",${a.cgpa},"${a.company}","${a.role}","${a.appliedOn}","${a.status}"`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = 'applications.csv'; el.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full overflow-hidden flex-col md:flex-row">
      {/* Main Panel */}
      <div className={`flex flex-col overflow-hidden transition-all ${drawerData ? 'md:w-[55%]' : 'w-full'}`}>
        <div className="p-4 sm:p-6 border-b bg-white" style={{ borderColor: '#D9E3E0' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900" style={{fontFamily:"'Bebas Neue',sans-serif", letterSpacing:'0.03em'}}>Resume Screening</h1>
              <p className="text-gray-500 text-xs mt-0.5">Review and screen candidate applications</p>
            </div>
            <button onClick={exportCSV} className="btn-solid-secondary px-4 py-2 text-xs flex items-center gap-1.5">
              <Download size={13} /> Export CSV
            </button>
          </div>

          {/* Status Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATUS_TABS.map((s) => (
              <button key={s} onClick={() => setStatusTab(s)}
                className="p-3 rounded-xl border text-left cursor-pointer transition-all"
                style={{
                  borderColor: statusTab === s ? '#D9642F' : '#D9E3E0',
                  background: statusTab === s ? '#FBEEE2' : '#fff',
                }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{s}</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: statusTab === s ? '#D9642F' : '#171732' }}>{counts[s]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b" style={{ borderColor: '#D9E3E0' }}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, roll number, or company..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-solid pl-8 py-2 text-xs" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={13} /></button>}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#EFF5F3' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[540px]">
              <thead className="sticky top-0 bg-white border-b text-gray-400 font-bold text-[10px] uppercase tracking-wider"
                     style={{ borderColor: '#D9E3E0' }}>
                <tr>
                  {['Candidate', 'Branch / CGPA', 'Company & Role', 'Applied On', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: '#D9E3E0' }}>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-400">No applications match current filters</td></tr>
                ) : filtered.map((app) => (
                  <tr key={app.id} className="table-row-light cursor-pointer" onClick={() => setDrawer(app)}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                             style={{ background: '#D9642F' }}>
                          {app.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{app.studentName}</p>
                          <p className="text-gray-400 font-mono text-[10px]">{app.rollNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-700">{app.branch}</p>
                      <p className="font-bold" style={{ color: app.cgpa >= 9 ? '#15803d' : '#D9642F' }}>{app.cgpa}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900 truncate max-w-[140px]">{app.company}</p>
                      <p className="text-gray-400 truncate max-w-[140px]">{app.role}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 font-mono whitespace-nowrap">{app.appliedOn}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3.5"><ChevronRight size={14} className="text-gray-300" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Candidate Drawer */}
      {drawerData && (
        <div className="flex-1 border-t md:border-t-0 md:border-l overflow-y-auto bg-white flex flex-col" style={{ borderColor: '#D9E3E0' }}>
          <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: '#D9E3E0', background: '#EFF5F3' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: '#D9642F' }}>
                {drawerData.studentName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{drawerData.studentName}</p>
                <p className="text-gray-400 text-xs font-mono">{drawerData.rollNo}</p>
              </div>
            </div>
            <button onClick={() => setDrawer(null)} className="text-gray-400 hover:text-gray-600"><X size={17} /></button>
          </div>

          <div className="flex-1 px-5 py-4 space-y-4">
            <div className="p-4 rounded-xl border" style={{ background: '#EFF5F3', borderColor: '#D9E3E0' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Application Details</p>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Applied For', value: `${drawerData.company} – ${drawerData.role}` },
                  { label: 'Branch',      value: drawerData.branch },
                  { label: 'CGPA',        value: drawerData.cgpa },
                  { label: 'Applied On',  value: drawerData.appliedOn },
                  { label: 'Current Round', value: drawerData.round },
                  { label: 'Status',      value: <StatusBadge status={drawerData.status} /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border" style={{ background: '#EFF5F3', borderColor: '#D9E3E0' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Resume</p>
              <div className="flex items-center gap-2">
                <User size={13} className="text-gray-400" />
                <span className="text-xs text-gray-500 italic">Student's uploaded resume will appear here</span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t space-y-2" style={{ borderColor: '#D9E3E0' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Screening Decision</p>
            <button onClick={() => handleUpdate(drawerData.id, 'shortlisted')}
              disabled={drawerData.status === 'shortlisted'}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#15803d' }}>
              <CheckCircle2 size={14} /> Shortlist Candidate
            </button>
            <button onClick={() => handleUpdate(drawerData.id, 'pending')}
              disabled={drawerData.status === 'pending'}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all btn-solid-secondary disabled:opacity-40 disabled:cursor-not-allowed">
              Move to Next Round
            </button>
            <button onClick={() => handleUpdate(drawerData.id, 'rejected')}
              disabled={drawerData.status === 'rejected'}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#be123c' }}>
              <XCircle size={14} /> Reject Application
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg z-50"
             style={{ background: '#15803d' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
