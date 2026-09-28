import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function CheckIn() {
  const { code } = useParams();
  const { user, role, checkIn } = useApp();
  const navigate = useNavigate();
  const [state, setState] = useState('checking'); // checking | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || role !== 'student') return; // route guard below handles redirect to login
    let cancelled = false;
    (async () => {
      try {
        const res = await checkIn(code);
        if (!cancelled) { setState('success'); setMessage(res?.message || 'Checked in successfully.'); }
      } catch (err) {
        if (!cancelled) { setState('error'); setMessage(err.message || 'Check-in failed.'); }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, user, role]);

  if (!user || role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--canvas-bg)' }}>
        <div className="card-solid bg-white p-6 max-w-sm text-center space-y-3">
          <p className="text-sm font-bold text-slate-900">Sign in as a student to check in</p>
          <p className="text-xs text-slate-500">This venue check-in link needs your student login to record your attendance.</p>
          <button onClick={() => navigate('/')} className="btn-solid-primary w-full py-2 text-xs font-bold">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--canvas-bg)' }}>
      <div className="card-solid bg-white p-8 max-w-sm text-center space-y-4">
        {state === 'checking' && (
          <>
            <Loader2 size={36} className="mx-auto animate-spin" style={{ color: 'var(--amber-gold)' }} />
            <p className="text-sm font-bold text-slate-900">Checking you in…</p>
          </>
        )}
        {state === 'success' && (
          <>
            <CheckCircle2 size={40} className="mx-auto text-green-600" />
            <p className="text-sm font-bold text-slate-900">You're checked in!</p>
            <p className="text-xs text-slate-500">{message}</p>
          </>
        )}
        {state === 'error' && (
          <>
            <XCircle size={40} className="mx-auto text-rose-600" />
            <p className="text-sm font-bold text-slate-900">Check-in failed</p>
            <p className="text-xs text-slate-500">{message}</p>
          </>
        )}
        <button onClick={() => navigate('/student/participation')} className="btn-solid-secondary w-full py-2 text-xs font-bold">
          Go to Participation
        </button>
      </div>
    </div>
  );
}
