import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Clock, ArrowRight, X } from 'lucide-react';

export default function Survey() {
  const { surveys, setSurveys } = useApp();
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleComplete = () => {
    if (!activeSurvey) return;
    setSurveys((prev) =>
      prev.map((s) => (s.id === activeSurvey.id ? { ...s, status: 'completed' } : s))
    );
    setActiveSurvey(null);
    setAnswers({});
    showToast('Survey submitted successfully! Thank you.');
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg z-50"
             style={{ background: '#15803d' }}>
          ✓ {toast}
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:'0.03em' }}>
          Placement Assessment Surveys
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">Please provide timely feedback to complete your placement compliance</p>
      </div>

      <div className="grid gap-3">
        {(surveys || []).map((s) => (
          <div key={s.id} className="card-solid p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: '#D9E3E0' }}>
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  s.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {s.status === 'completed' ? <CheckCircle2 size={22} /> : <Clock size={22} />}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">{s.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {s.questions} Questions · Due: {new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 w-full sm:w-auto">
              {s.status === 'completed' ? (
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 size={13} /> Completed
                </span>
              ) : (
                <button
                  onClick={() => setActiveSurvey(s)}
                  className="btn-solid-primary w-full sm:w-auto px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  Begin Survey <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Survey Modal */}
      {activeSurvey && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg border shadow-2xl space-y-4" style={{ borderColor: '#D9E3E0' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#D9E3E0' }}>
              <div>
                <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:'0.03em' }}>
                  {activeSurvey.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Feedback Questionnaire</p>
              </div>
              <button onClick={() => setActiveSurvey(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl border space-y-2" style={{ background: '#EFF5F3', borderColor: '#D9E3E0' }}>
                <p className="font-semibold text-gray-800">1. How prepared do you feel for upcoming technical campus rounds?</p>
                <div className="flex gap-2">
                  {['Very Prepared', 'Somewhat', 'Needs Work'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, q1: opt })}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        answers.q1 === opt ? 'bg-red-50 text-red-800 border-red-300 font-bold' : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border space-y-2" style={{ background: '#EFF5F3', borderColor: '#D9E3E0' }}>
                <p className="font-semibold text-gray-800">2. Any topics or companies you would like mock interview training for?</p>
                <textarea
                  className="input-solid h-20 text-xs py-2 resize-none"
                  placeholder="e.g. System Design, DSA Graphs, Core ECE MCQs..."
                  value={answers.q2 || ''}
                  onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: '#D9E3E0' }}>
              <button onClick={() => setActiveSurvey(null)} className="btn-solid-secondary px-4 py-2 text-xs">
                Cancel
              </button>
              <button onClick={handleComplete} className="btn-solid-primary px-5 py-2 text-xs font-bold">
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
