import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarClock, MapPin, CheckCircle2, XCircle, QrCode, ClipboardCheck,
  ThumbsUp, ThumbsDown, Clock, AlertCircle,
} from 'lucide-react';

const CONFIRM_CUTOFF_MINUTES = 15;

function timeUntil(scheduledAt) {
  const diffMs = new Date(scheduledAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Already started';
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `in ${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `in ${Math.round(hrs / 24)} day(s)`;
}

export default function Participation() {
  const { participation, confirmRound, checkIn } = useApp();
  const [toast, setToast] = useState('');
  const [code, setCode] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const handleRespond = async (applicationId, response) => {
    try {
      await confirmRound(applicationId, response);
      showToast(response === 'confirmed' ? 'Confirmed — see you there!' : 'Marked as declined.');
    } catch (err) {
      showToast(err.message || 'Could not record your response.');
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setCheckingIn(true);
    try {
      const res = await checkIn(code.trim());
      showToast(res?.message || 'Checked in!');
      setCode('');
    } catch (err) {
      showToast(err.message || 'Check-in failed.');
    } finally {
      setCheckingIn(false);
    }
  };

  const now = Date.now();
  const needsResponse = participation.filter((p) => {
    if (p.confirmation !== 'none') return false;
    const cutoff = new Date(p.scheduledAt).getTime() - CONFIRM_CUTOFF_MINUTES * 60000;
    return now < cutoff;
  });
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-retro">Participation</h1>
        <p className="text-slate-500 text-xs mt-0.5">Confirm your attendance for scheduled rounds and check in at the venue.</p>
      </div>

      {toast && (
        <div className="p-3 rounded-xl text-xs font-semibold text-white" style={{ background: '#15803d' }}>{toast}</div>
      )}

      {/* Venue Check-In */}
      <div className="card-solid bg-white p-5">
        <div className="flex items-center gap-2 mb-1">
          <QrCode size={16} style={{ color: 'var(--amber-gold)' }} />
          <h2 className="text-sm font-bold text-slate-900 font-retro">Venue Check-In</h2>
        </div>
        <p className="text-xs text-slate-400 mb-3">Scan the QR code shown at the venue with your phone camera, or type the code below.</p>
        <form onSubmit={handleCheckIn} className="flex gap-2">
          <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. 7XQK9M" maxLength={6}
            className="input-solid text-xs py-2 font-mono tracking-widest uppercase" />
          <button type="submit" disabled={checkingIn}
            className="btn-solid-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50">
            <ClipboardCheck size={14} /> Check In
          </button>
        </form>
      </div>

      {/* Round Confirmation */}
      <div className="card-solid bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900 font-retro mb-1">Round Confirmation</h2>
        <p className="text-xs text-slate-400 mb-4">
          Confirm whether you'll attend each scheduled round. You can respond any time until {CONFIRM_CUTOFF_MINUTES} minutes before it starts.
        </p>
        {needsResponse.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">No rounds awaiting your response right now.</p>
        ) : (
          <div className="space-y-3">
            {needsResponse.map((p) => (
              <div key={`${p.applicationId}-${p.roundIndex}`} className="p-4 rounded-xl border" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{p.company}</p>
                    <p className="text-xs text-slate-500">{p.roundName}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><CalendarClock size={11} /> {new Date(p.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      {p.venue && <span className="flex items-center gap-1"><MapPin size={11} /> {p.venue}</span>}
                      <span className="flex items-center gap-1 font-semibold text-amber-700"><Clock size={11} /> {timeUntil(p.scheduledAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleRespond(p.applicationId, 'confirmed')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5" style={{ background: '#15803d' }}>
                      <ThumbsUp size={13} /> Confirm
                    </button>
                    <button onClick={() => handleRespond(p.applicationId, 'declined')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold btn-solid-secondary flex items-center gap-1.5">
                      <ThumbsDown size={13} /> Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Schedule */}
      <div className="card-solid bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900 font-retro mb-4">Your Schedule</h2>
        {participation.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">No rounds have been scheduled for you yet — check back once the placement cell sets a date.</p>
        ) : (
          <div className="space-y-2.5">
            {participation.map((p) => {
              const cutoffPassed = now > new Date(p.scheduledAt).getTime() - CONFIRM_CUTOFF_MINUTES * 60000;
              return (
                <div key={`${p.applicationId}-${p.roundIndex}-row`} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${p.color || 'bg-emerald-700'}`}>
                    {p.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.company} — {p.roundName}</p>
                    <p className="text-[10px] text-slate-400">{new Date(p.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}{p.venue ? ` · ${p.venue}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.confirmation === 'confirmed' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1"><CheckCircle2 size={10} /> Confirmed</span>}
                    {p.confirmation === 'declined' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1"><XCircle size={10} /> Declined</span>}
                    {p.confirmation === 'none' && cutoffPassed && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><AlertCircle size={10} /> Response window closed</span>}
                    {p.confirmation === 'none' && !cutoffPassed && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Awaiting your response</span>}
                    {p.attendance === 'present' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Checked In</span>}
                    {p.attendance === 'absent' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Marked Absent</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
