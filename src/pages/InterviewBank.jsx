import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  MessageSquare, Mic, Volume2, CheckCircle2, Bookmark, BookmarkCheck,
  Sparkles, Search, Clock, Award, ShieldCheck, ChevronDown, ChevronUp,
  RotateCcw, Play, Square, AlertTriangle, BookOpen, BrainCircuit,
  HelpCircle, UserCheck, Layers, ArrowRight, Check, Copy, SlidersHorizontal
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'All',
  'Self Introduction & Foundation',
  'Strengths & Self-Awareness',
  'Situational & Conflict Resolution',
  'Company Fit & Motivation',
  'Career Goals & Commitment',
  'Workplace Adaptability & Relocation',
  'Failure & Resilience',
];

const DEFAULT_SPEAKING_TYPES = [
  'All',
  'Read-Aloud & Sentence Mastery',
  'Extempore (JAM - Just A Minute)',
  'Story Retelling & Scenario Explanation',
];

export default function InterviewBank() {
  const [activeMode, setActiveMode] = useState('hr'); // 'hr' | 'speaking' | 'studio'
  const [hrQuestions, setHrQuestions] = useState([]);
  const [speakingAssessments, setSpeakingAssessments] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [speakingTypes, setSpeakingTypes] = useState(DEFAULT_SPEAKING_TYPES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSpkType, setSelectedSpkType] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Expanded accordion items
  const [expandedHr, setExpandedHr] = useState({});
  const [expandedSpk, setExpandedSpk] = useState({});

  // Mastered & Bookmarked tracking (persisted locally)
  const [masteredIds, setMasteredIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ju_mastered_questions') || '[]');
    } catch {
      return [];
    }
  });

  // Practice Studio & AI Speech Evaluation
  const [studioQuestion, setStudioQuestion] = useState(null);
  const [practiceText, setPracticeText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Speaking timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef(null);

  // Audio Speech Synthesis (TTS)
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    fetchBankData();
  }, [selectedCategory, selectedSpkType, search]);

  useEffect(() => {
    localStorage.setItem('ju_mastered_questions', JSON.stringify(masteredIds));
  }, [masteredIds]);

  const fetchBankData = async () => {
    setLoading(true);
    try {
      const res = await api.getInterviewBank({
        category: selectedCategory,
        type: selectedSpkType,
        search,
      });
      if (res && res.data) {
        setHrQuestions(res.data.hrQuestions || []);
        setSpeakingAssessments(res.data.speakingAssessments || []);
        setCategories(res.data.categories || []);
        setSpeakingTypes(res.data.speakingTypes || []);
      }
    } catch (err) {
      console.error('Failed to load interview bank:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandHr = (id) => {
    setExpandedHr((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandSpk = (id) => {
    setExpandedSpk((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMastered = (id) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSpeakText = (id, textToSpeak) => {
    if (!('speechSynthesis' in window)) return;

    if (playingId === id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95; // Natural corporate cadence
    utterance.pitch = 1.0;
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    setPlayingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const startTimer = (seconds = 60) => {
    clearInterval(timerRef.current);
    setTimeLeft(seconds);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
  };

  const openPracticeStudio = (question, type = 'hr') => {
    setStudioQuestion({ ...question, studioType: type });
    setPracticeText('');
    setEvalResult(null);
    setActiveMode('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const runAiEvaluation = async () => {
    if (!practiceText.trim() || evaluating) return;
    setEvaluating(true);
    setEvalResult(null);

    try {
      const res = await api.evaluateSpeech({
        practiceText,
        questionId: studioQuestion?.id || 'custom',
        targetType: studioQuestion?.studioType || 'hr',
      });
      if (res && res.data) {
        setEvalResult(res.data);
      }
    } catch (err) {
      console.error('Speech evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalMasteredCount = hrQuestions.concat(speakingAssessments).filter((q) =>
    masteredIds.includes(q.id)
  ).length;
  const totalQuestions = hrQuestions.length + speakingAssessments.length;
  const masteryPercentage = totalQuestions > 0 ? Math.round((totalMasteredCount / totalQuestions) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Directorate Header */}
      <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-1.5"
               style={{ background: 'var(--amber-pale)', color: '#8C4419', border: '1px solid var(--amber-border)' }}>
            <BookOpen size={13} className="text-amber-700" />
            Jeppiaar Career Directorate · Interview Bank
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
            HR & Speaking Interview Question Bank
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Master behavioral STAR frameworks, Versant-style spoken English assessments, extempore JAM drills, and AI speech pacing.
          </p>
        </div>

        {/* Readiness Progress Widget */}
        <div className="card-solid p-3.5 bg-white flex items-center gap-4 min-w-[240px] shadow-2xs" style={{ borderColor: 'var(--border)' }}>
          <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-amber-50 border-2 border-amber-600 flex-shrink-0">
            <span className="text-xs font-black text-amber-800">{masteryPercentage}%</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mastery Progress</p>
            <p className="text-xs font-bold text-slate-800">
              {totalMasteredCount} of {totalQuestions} Topics Mastered
            </p>
            <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-300"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex gap-2 border-b pb-1 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {[
          { key: 'hr',       label: 'HR & Behavioral Questions (STAR Method)', icon: UserCheck, count: hrQuestions.length },
          { key: 'speaking', label: 'Speaking & Communication Assessment',      icon: Volume2,   count: speakingAssessments.length },
          { key: 'studio',   label: 'AI Speech & Pacing Practice Studio',       icon: Mic,       count: 'Live' },
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveMode(key)}
            className={`tab-light text-xs font-semibold whitespace-nowrap flex items-center gap-2 py-2 px-3.5 ${
              activeMode === key ? 'active' : ''
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH AND FILTER CONTROLS */}
      {activeMode !== 'studio' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeMode === 'hr' ? 'Search behavioral questions, company fit, strengths...' : 'Search read-aloud, extempore topics, phonetics...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-solid pl-9 py-2 text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            {activeMode === 'hr' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-solid text-xs py-2 w-full sm:w-auto font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {activeMode === 'speaking' && (
              <select
                value={selectedSpkType}
                onChange={(e) => setSelectedSpkType(e.target.value)}
                className="input-solid text-xs py-2 w-full sm:w-auto font-medium"
              >
                {speakingTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: HR & BEHAVIORAL QUESTIONS */}
      {/* ========================================================================= */}
      {activeMode === 'hr' && (
        <div className="space-y-4">
          {loading ? (
            <div className="card-solid p-10 text-center text-slate-400 bg-white" style={{ borderColor: 'var(--border)' }}>
              <Sparkles className="mx-auto mb-2 animate-spin text-amber-600" size={24} />
              <p className="text-xs font-semibold">Loading HR question bank...</p>
            </div>
          ) : hrQuestions.length === 0 ? (
            <div className="card-solid p-12 text-center text-slate-400 bg-white" style={{ borderColor: 'var(--border)' }}>
              <HelpCircle className="mx-auto mb-2 opacity-30" size={36} />
              <p className="text-sm font-semibold">No questions match your current search.</p>
              <p className="text-xs mt-1">Try resetting the category filter or searching for another keyword.</p>
            </div>
          ) : (
            hrQuestions.map((q, idx) => {
              const isExpanded = expandedHr[q.id] ?? (idx === 0);
              const isMastered = masteredIds.includes(q.id);
              const isAudioPlaying = playingId === q.id;

              return (
                <div
                  key={q.id}
                  className="card-solid bg-white overflow-hidden transition-all duration-200 border"
                  style={{
                    borderColor: isMastered ? '#15803d' : isExpanded ? 'var(--amber-gold)' : 'var(--border)',
                    boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.03)' : undefined,
                  }}
                >
                  {/* Card Header (Accordion Trigger) */}
                  <div
                    className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50 transition-colors"
                    onClick={() => toggleExpandHr(q.id)}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 text-white"
                           style={{ background: isMastered ? '#15803d' : 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                        {isMastered ? <Check size={14} /> : idx + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {q.category}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                            {q.frequency}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Target: {q.targetTime}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {q.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleMastered(q.id)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                          isMastered
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
                        }`}
                        title={isMastered ? 'Marked as Mastered' : 'Mark as Mastered'}
                      >
                        {isMastered ? <BookmarkCheck size={14} className="text-green-700" /> : <Bookmark size={14} />}
                        <span className="hidden sm:inline text-[11px]">{isMastered ? 'Mastered' : 'Mark Done'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpandHr(q.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Accordion Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t space-y-5 bg-white" style={{ borderColor: 'var(--border)' }}>
                      {/* Recruiter Intent & Framework */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl border bg-slate-50/60" style={{ borderColor: 'var(--border)' }}>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                            <BrainCircuit size={12} className="text-amber-700" />
                            Recruiter's True Intent
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed">{q.intent}</p>
                        </div>

                        <div className="p-3.5 rounded-xl border bg-slate-50/60" style={{ borderColor: 'var(--border)' }}>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                            <Layers size={12} className="text-teal-800" />
                            Recommended Answer Framework
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed">{q.framework}</p>
                        </div>
                      </div>

                      {/* STAR Method Blueprint */}
                      {q.starBreakdown && (
                        <div className="p-4 rounded-xl border bg-amber-50/40 space-y-2.5" style={{ borderColor: 'var(--amber-border)' }}>
                          <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Award size={13} className="text-amber-700" />
                            STAR Framework Structured Blueprint
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                            <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                              <span className="text-[10px] font-bold text-amber-800 block">S – Situation</span>
                              <p className="text-slate-600 text-[11px] mt-0.5">{q.starBreakdown.situation}</p>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                              <span className="text-[10px] font-bold text-amber-800 block">T – Task</span>
                              <p className="text-slate-600 text-[11px] mt-0.5">{q.starBreakdown.task}</p>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                              <span className="text-[10px] font-bold text-amber-800 block">A – Action</span>
                              <p className="text-slate-600 text-[11px] mt-0.5">{q.starBreakdown.action}</p>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                              <span className="text-[10px] font-bold text-amber-800 block">R – Result</span>
                              <p className="text-slate-600 text-[11px] mt-0.5">{q.starBreakdown.result}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Exemplar Model Answer */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-green-600" />
                            Exemplar Campus Model Answer
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSpeakText(q.id, q.sampleAnswer)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                isAudioPlaying
                                  ? 'bg-amber-600 text-white animate-pulse'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isAudioPlaying ? <Square size={11} /> : <Volume2 size={12} />}
                              <span>{isAudioPlaying ? 'Stop Audio' : 'Listen Narration'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(q.id, q.sampleAnswer)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1"
                            >
                              {copiedId === q.id ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedId === q.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line bg-slate-50/70"
                             style={{ borderColor: 'var(--border)' }}>
                          {q.sampleAnswer}
                        </div>
                      </div>

                      {/* Common Mistakes & Pro Tip */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl border bg-rose-50/40 space-y-1.5" style={{ borderColor: '#fecdd3' }}>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                            <AlertTriangle size={12} className="text-rose-600" />
                            Common Mistakes & Red Flags
                          </span>
                          <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                            {q.mistakesToAvoid?.map((m, mIdx) => (
                              <li key={mIdx} className="text-[11px] leading-relaxed">{m}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded-xl border bg-emerald-50/40 flex flex-col justify-between" style={{ borderColor: '#a7f3d0' }}>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-1">
                              <ShieldCheck size={12} className="text-emerald-700" />
                              Directorate Placement Pro-Tip
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed">{q.proTip}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => openPracticeStudio(q, 'hr')}
                            className="mt-3 btn-solid-primary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Mic size={13} /> Practice Answer in AI Studio
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SPEAKING & COMMUNICATION ASSESSMENTS (Versant / Extempore / JAM) */}
      {/* ========================================================================= */}
      {activeMode === 'speaking' && (
        <div className="space-y-4">
          {loading ? (
            <div className="card-solid p-10 text-center text-slate-400 bg-white" style={{ borderColor: 'var(--border)' }}>
              <Sparkles className="mx-auto mb-2 animate-spin text-amber-600" size={24} />
              <p className="text-xs font-semibold">Loading speaking assessment modules...</p>
            </div>
          ) : speakingAssessments.length === 0 ? (
            <div className="card-solid p-12 text-center text-slate-400 bg-white" style={{ borderColor: 'var(--border)' }}>
              <Volume2 className="mx-auto mb-2 opacity-30" size={36} />
              <p className="text-sm font-semibold">No assessment modules found.</p>
            </div>
          ) : (
            speakingAssessments.map((spk, idx) => {
              const isExpanded = expandedSpk[spk.id] ?? (idx === 0);
              const isMastered = masteredIds.includes(spk.id);
              const isAudioPlaying = playingId === spk.id;

              return (
                <div
                  key={spk.id}
                  className="card-solid bg-white overflow-hidden transition-all duration-200 border"
                  style={{
                    borderColor: isMastered ? '#15803d' : isExpanded ? 'var(--amber-gold)' : 'var(--border)',
                  }}
                >
                  {/* Speaking Card Header */}
                  <div
                    className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50 transition-colors"
                    onClick={() => toggleExpandSpk(spk.id)}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 text-white bg-slate-800">
                        <Volume2 size={15} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {spk.type}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                            {spk.category}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {spk.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleMastered(spk.id)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                          isMastered
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
                        }`}
                      >
                        {isMastered ? <BookmarkCheck size={14} className="text-green-700" /> : <Bookmark size={14} />}
                        <span className="hidden sm:inline text-[11px]">{isMastered ? 'Mastered' : 'Mark Done'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpandSpk(spk.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Speaking Card Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t space-y-5 bg-white" style={{ borderColor: 'var(--border)' }}>
                      {/* Read-Aloud Specifics */}
                      {spk.audioText && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <BookOpen size={14} className="text-amber-700" />
                              Passage for Read-Aloud & Pacing Practice
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSpeakText(spk.id, spk.audioText)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                isAudioPlaying ? 'bg-amber-600 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isAudioPlaying ? <Square size={11} /> : <Volume2 size={12} />}
                              <span>{isAudioPlaying ? 'Stop Audio' : 'Listen Pronunciation'}</span>
                            </button>
                          </div>

                          <div className="p-4 rounded-xl border bg-slate-50 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans"
                               style={{ borderColor: 'var(--border)' }}>
                            {spk.audioText}
                          </div>

                          {/* Phonetics & Syllable Stress */}
                          {spk.phoneticFocus && (
                            <div className="p-3.5 rounded-xl border bg-amber-50/40 space-y-2" style={{ borderColor: 'var(--amber-border)' }}>
                              <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                                Phonetic Stress & Articulation Highlights
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {spk.phoneticFocus.map((p, pIdx) => (
                                  <div key={pIdx} className="p-2 bg-white rounded-lg border border-amber-200 flex items-center justify-between">
                                    <div>
                                      <span className="font-bold text-slate-800">{p.word}</span>
                                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">{p.phonetic}</span>
                                    </div>
                                    <span className="text-[10px] text-amber-800 font-semibold">{p.tip}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Extempore / JAM Blueprint */}
                      {spk.bulletStructure && (
                        <div className="space-y-3">
                          <div className="p-3.5 rounded-xl border bg-slate-50/80 space-y-2" style={{ borderColor: 'var(--border)' }}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Spontaneous Speech Thought-Structuring Blueprint
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {spk.bulletStructure.map((b, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-2">
                                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {bIdx + 1}
                                  </span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Ideal Delivery Script */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">Ideal 60-Second Extempore Script</span>
                              <button
                                type="button"
                                onClick={() => handleSpeakText(spk.id, spk.idealScript)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                                  isAudioPlaying ? 'bg-amber-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {isAudioPlaying ? <Square size={11} /> : <Volume2 size={12} />}
                                <span>{isAudioPlaying ? 'Stop' : 'Listen Cadence'}</span>
                              </button>
                            </div>
                            <div className="p-4 rounded-xl border bg-slate-50 text-xs text-slate-700 leading-relaxed whitespace-pre-line"
                                 style={{ borderColor: 'var(--border)' }}>
                              {spk.idealScript}
                            </div>
                          </div>

                          {/* Filler words watchlist */}
                          {spk.fillerWordWatchlist && (
                            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                              <span className="text-[10px] font-bold uppercase text-rose-700">Avoid Filler Crutches:</span>
                              {spk.fillerWordWatchlist.map((fw) => (
                                <span key={fw} className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-medium">
                                  ✕ {fw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t" style={{ borderColor: 'var(--border)' }}>
                        {/* Countdown practice timer */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Clock size={13} className="text-slate-400" />
                            {timerRunning ? `${timeLeft}s Remaining` : '60s Extempore Timer'}
                          </span>
                          {timerRunning ? (
                            <button
                              type="button"
                              onClick={stopTimer}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Stop Timer
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startTimer(60)}
                              className="btn-solid-secondary px-3 py-1 text-xs font-bold flex items-center gap-1"
                            >
                              <Play size={11} /> Start 60s Drill
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => openPracticeStudio(spk, 'speaking')}
                          className="btn-solid-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Mic size={13} /> Test Delivery in AI Studio
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: LIVE AI SPEECH & PACING PRACTICE STUDIO */}
      {/* ========================================================================= */}
      {activeMode === 'studio' && (
        <div className="space-y-5">
          <div className="card-solid p-5 bg-white space-y-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Target Interview Simulation
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {studioQuestion ? studioQuestion.title : 'General HR / Speaking Assessment Practice'}
                </h3>
              </div>

              {studioQuestion && (
                <button
                  type="button"
                  onClick={() => setStudioQuestion(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline self-start sm:self-auto"
                >
                  Switch to Custom Topic
                </button>
              )}
            </div>

            {/* Input area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mic size={14} className="text-amber-700" />
                  Type or Dictate Your Live Response
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {practiceText.split(/\s+/).filter(Boolean).length} words (Sweet spot: 70–150 words)
                </span>
              </div>

              <textarea
                rows={7}
                value={practiceText}
                onChange={(e) => setPracticeText(e.target.value)}
                placeholder="Speak or write your answer here as you would in a real interview (e.g. Good morning, my name is Saaqib and over the past 4 years at Jeppiaar University...)..."
                className="input-solid w-full text-xs font-sans p-3.5 leading-relaxed resize-y"
                style={{ background: 'var(--canvas-bg)' }}
              />
            </div>

            {/* Evaluation Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-400">
                The AI engine diagnoses filler words, articulation clarity, pace estimate, and STAR structure.
              </p>

              <button
                type="button"
                onClick={runAiEvaluation}
                disabled={evaluating || practiceText.trim().length < 20}
                className="w-full sm:w-auto btn-solid-primary py-2.5 px-6 text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {evaluating ? (
                  <>
                    <Sparkles size={14} className="animate-spin" />
                    Analyzing Speech & Content...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Evaluate My Response with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI DIAGNOSIS RESULTS */}
          {evalResult && (
            <div className="card-solid p-5 bg-white space-y-5 border-2 animate-fade-in"
                 style={{ borderColor: evalResult.overallScore >= 75 ? '#15803d' : '#b45309' }}>
              {/* Header Score Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-sm flex-shrink-0"
                       style={{ background: evalResult.overallScore >= 75 ? '#15803d' : '#b45309' }}>
                    {evalResult.overallScore}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Readiness Score</span>
                    <h4 className="text-base font-bold text-slate-900">{evalResult.verdict}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Analyzed <strong>{evalResult.wordCount}</strong> words with <strong>{evalResult.fillerCount}</strong> filler word(s).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center px-3 py-1.5 rounded-xl border bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Clarity</p>
                    <p className="text-sm font-black text-slate-800">{evalResult.clarityScore}%</p>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-xl border bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pacing</p>
                    <p className="text-sm font-black text-slate-800">{evalResult.paceScore}%</p>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-xl border bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">STAR Depth</p>
                    <p className="text-sm font-black text-slate-800">{evalResult.starScore}%</p>
                  </div>
                </div>
              </div>

              {/* Strengths and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-green-50/50 space-y-2" style={{ borderColor: '#bbf7d0' }}>
                  <span className="text-xs font-bold text-green-900 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-700" />
                    Key Strengths Observed
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {evalResult.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-green-700 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border bg-amber-50/50 space-y-2" style={{ borderColor: '#fde68a' }}>
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-700" />
                    Actionable Improvement Areas
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {evalResult.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
