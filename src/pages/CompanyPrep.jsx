import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Building2, BookOpen, BrainCircuit, CheckCircle2, XCircle, Clock,
  Send, Sparkles, MessageSquare, ChevronRight, Trophy, HelpCircle,
  Layers, Code2, Cpu, UserCheck, ArrowRight, RotateCcw, Award
} from 'lucide-react';

const COMPANIES_LIST = [
  { id: 'tcs', name: 'TCS', tag: 'NQT & Digital', badge: 'Tier 1' },
  { id: 'zoho', name: 'Zoho', tag: 'Problem Solving & OOP', badge: 'Product' },
  { id: 'amazon', name: 'Amazon', tag: 'SDE & Leadership', badge: 'Cloud Giant' },
  { id: 'infosys', name: 'Infosys', tag: 'InfyTQ & SP Track', badge: 'Tier 1' },
  { id: 'microsoft', name: 'Microsoft', tag: 'DSA & System Design', badge: 'Super-Giant' },
  { id: 'accenture', name: 'Accenture', tag: 'Cognitive & ASE/FSE', badge: 'Consulting' },
];

export default function CompanyPrep() {
  const navigate = useNavigate();
  const [selectedCompanyId, setSelectedCompanyId] = useState('tcs');
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, mocktest, questionbank, mentor

  // Mock Test State
  const [userAnswers, setUserAnswers] = useState({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [submittingTest, setSubmittingTest] = useState(false);

  // AI Mentor Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isMentorTyping, setIsMentorTyping] = useState(false);

  useEffect(() => {
    fetchCompanyDetails(selectedCompanyId);
  }, [selectedCompanyId]);

  const fetchCompanyDetails = async (id) => {
    setLoading(true);
    setUserAnswers({});
    setIsTestSubmitted(false);
    setTestResult(null);

    try {
      const res = await api.getCompanyPrepDetails(id);
      if (res && res.data) {
        setCompanyData(res.data);
        // Initialize Mentor Chat with greeting
        setChatMessages([
          {
            sender: 'ai',
            text: `Hello! I am your **${res.data.name}** AI Placement Mentor. Ask me anything about their syllabus, coding questions, Round 1 test tricks, or technical interview preparation!`,
            time: 'Just now',
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching company prep:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    if (isTestSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleMockTestSubmit = async () => {
    setSubmittingTest(true);
    try {
      const res = await api.submitMockTest(selectedCompanyId, userAnswers);
      if (res && res.data) {
        setTestResult(res.data);
        setIsTestSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit mock test:', err);
    } finally {
      setSubmittingTest(false);
    }
  };

  const handleResetTest = () => {
    setUserAnswers({});
    setIsTestSubmitted(false);
    setTestResult(null);
  };

  const handleSendQuery = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || isMentorTyping) return;

    const userMsg = {
      sender: 'user',
      text: inputQuery.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputQuery.trim();
    setInputQuery('');
    setIsMentorTyping(true);

    try {
      const res = await api.askAiMentor(selectedCompanyId, currentQuery);
      if (res && res.data) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.data.reply,
            time: res.data.timestamp || 'Just now',
          },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `For ${companyData?.name || 'this company'}, make sure to revise core Data Structures, OOP principles, and test edge cases.`,
          time: 'Just now',
        },
      ]);
    } finally {
      setIsMentorTyping(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-1.5"
               style={{ background: 'var(--amber-pale)', color: '#8C4419', border: '1px solid var(--amber-border)' }}>
            <BrainCircuit size={13} className="text-amber-700" />
            Campus Hiring Intelligence Hub
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
            AI Company Placement Preparation & Study Assistant
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Master company-specific recruitment patterns, take simulated mock assessments, and practice top coding challenges.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/interview-bank')}
          className="btn-solid-secondary px-4 py-2 text-xs flex items-center gap-1.5 font-bold self-start sm:self-auto flex-shrink-0"
        >
          <BookOpen size={13} /> HR & Speaking Bank
        </button>
      </div>

      {/* Top Company Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {COMPANIES_LIST.map((comp) => {
          const isSelected = selectedCompanyId === comp.id;
          return (
            <button
              key={comp.id}
              onClick={() => setSelectedCompanyId(comp.id)}
              className="p-3.5 rounded-xl border text-left transition-all cursor-pointer card-solid-hover"
              style={{
                borderColor: isSelected ? 'var(--amber-gold)' : 'var(--border)',
                background: isSelected ? 'var(--amber-pale)' : '#fff',
                borderWidth: isSelected ? '2px' : '1px',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold" style={{ color: isSelected ? 'var(--amber-gold)' : 'var(--text-dark)' }}>
                  {comp.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                      style={{
                        background: isSelected ? '#fff' : 'var(--canvas-bg)',
                        color: isSelected ? '#8C4419' : '#64748b',
                      }}>
                  {comp.badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{comp.tag}</p>
            </button>
          );
        })}
      </div>

      {loading || !companyData ? (
        <div className="card-solid p-12 text-center text-slate-400 bg-white" style={{ borderColor: 'var(--border)' }}>
          <Sparkles className="mx-auto mb-3 animate-spin text-amber-600" size={28} />
          <p className="text-xs font-semibold">Loading company placement roadmap...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Company Title & Package Banner */}
          <div className="card-solid p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
               style={{ borderColor: 'var(--border)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {companyData.tier}
                </span>
                <span className="text-xs text-slate-400 font-mono">• {companyData.examPattern?.totalTime} Test</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1" style={{ fontFamily: 'Cinzel,serif' }}>
                {companyData.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{companyData.tagline}</p>
            </div>

            <div className="text-left sm:text-right sm:border-l pl-0 sm:pl-5 border-slate-100 flex-shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400">Package Range</span>
              <p className="text-base font-bold text-emerald-700">{companyData.packageRange}</p>
              <p className="text-[10px] text-slate-400 max-w-xs">{companyData.eligibility}</p>
            </div>
          </div>

          {/* Module Tabs */}
          <div className="flex gap-2 border-b pb-1 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
            {[
              { key: 'overview', label: 'Hiring Rounds & Syllabus', icon: BookOpen },
              { key: 'mocktest', label: 'AI Mock Assessment Test', icon: Trophy },
              { key: 'questionbank', label: 'High-Frequency Questions', icon: Code2 },
              { key: 'mentor', label: 'AI Placement Mentor Chat', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`tab-light text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.key ? 'active' : ''}`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & HIRING ROUNDS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Round by Round Breakdown */}
              <div className="lg:col-span-7 space-y-4">
                <div className="card-solid p-5 bg-white space-y-4" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'Cinzel,serif' }}>
                    <Layers size={16} className="text-amber-700" />
                    Selection Stage Architecture
                  </h3>

                  <div className="space-y-3">
                    {companyData.hiringRounds.map((round) => (
                      <div key={round.round} className="p-3.5 rounded-xl border bg-slate-50/50 flex items-start gap-3" style={{ borderColor: 'var(--border)' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                             style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                          {round.round}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900">{round.name}</p>
                            <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 flex-shrink-0">
                              <Clock size={10} className="inline mr-1" />
                              {round.duration}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            <strong>Topics:</strong> {round.topics}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Exam Pattern & Key Topics */}
              <div className="lg:col-span-5 space-y-4">
                {/* Exam Pattern Table */}
                <div className="card-solid p-5 bg-white space-y-3" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
                    Online Assessment Blueprint
                  </h3>
                  <div className="space-y-2">
                    {companyData.examPattern?.sections.map((sec, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                        <span className="font-semibold text-slate-700">{sec.section}</span>
                        <span className="text-slate-500 font-mono">{sec.questions} Qs · {sec.time}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 italic">
                    {companyData.examPattern?.negativeMarking}
                  </p>
                </div>

                {/* Key Focus Topics */}
                <div className="card-solid p-5 bg-white space-y-3" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
                    Must-Master Focus Topics
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {companyData.keyTopics.map((topic) => (
                      <span key={topic} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI MOCK ASSESSMENT TEST */}
          {activeTab === 'mocktest' && (
            <div className="space-y-5">
              {/* Test Instructions Banner */}
              <div className="card-solid p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
                    {companyData.name} Simulated Screening Assessment
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {companyData.mockTestQuestions?.length} custom questions curated to test {companyData.name} Round 1 competency.
                  </p>
                </div>

                {isTestSubmitted && (
                  <button
                    onClick={handleResetTest}
                    className="btn-solid-secondary px-4 py-2 text-xs flex items-center gap-1.5 font-semibold"
                  >
                    <RotateCcw size={13} /> Retake Assessment
                  </button>
                )}
              </div>

              {/* Test Results Banner when Submitted */}
              {isTestSubmitted && testResult && (
                <div className="card-solid p-5 bg-white border-2 space-y-3"
                     style={{
                       borderColor: testResult.percentage >= 70 ? '#15803d' : '#b45309',
                       background: testResult.percentage >= 70 ? 'rgba(21, 128, 61, 0.04)' : 'rgba(180, 83, 9, 0.04)',
                     }}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                           style={{ background: testResult.percentage >= 70 ? '#15803d' : '#b45309' }}>
                        {testResult.percentage}%
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Performance Diagnosis</span>
                        <h4 className="text-sm font-bold text-slate-900">{testResult.verdict}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Score: <strong>{testResult.score}</strong> / {testResult.totalQuestions} Questions Correct
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 border-t pt-2 mt-2 leading-relaxed" style={{ borderColor: 'var(--border)' }}>
                    <strong>AI Guidance:</strong> {testResult.advice}
                  </p>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {companyData.mockTestQuestions?.map((q, idx) => {
                  const selected = userAnswers[q.id];
                  const hasAnswered = selected !== undefined;
                  const isCorrect = isTestSubmitted && selected === q.correctAnswer;
                  const isWrong = isTestSubmitted && hasAnswered && selected !== q.correctAnswer;

                  return (
                    <div key={q.id} className="card-solid p-5 bg-white space-y-3" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-slate-900">
                          Q{idx + 1}. {q.question}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border flex-shrink-0">
                          {q.category}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          let optionStyle = 'bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-300';
                          if (selected === optIdx && !isTestSubmitted) {
                            optionStyle = 'bg-amber-50/80 border-amber-400 text-amber-900 font-bold';
                          } else if (isTestSubmitted) {
                            if (optIdx === q.correctAnswer) {
                              optionStyle = 'bg-green-50 border-green-400 text-green-900 font-bold';
                            } else if (selected === optIdx && selected !== q.correctAnswer) {
                              optionStyle = 'bg-red-50 border-red-300 text-red-800 line-through';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isTestSubmitted}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${optionStyle}`}
                            >
                              <span>{opt}</span>
                              {isTestSubmitted && optIdx === q.correctAnswer && (
                                <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
                              )}
                              {isTestSubmitted && selected === optIdx && selected !== q.correctAnswer && (
                                <XCircle size={15} className="text-red-500 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box after submit */}
                      {isTestSubmitted && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                          <p className="font-bold text-[11px] text-slate-800 uppercase tracking-wider">
                            Explanation & Concept Note:
                          </p>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isTestSubmitted && (
                <button
                  onClick={handleMockTestSubmit}
                  disabled={submittingTest}
                  className="btn-solid-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Award size={15} />
                  Submit Mock Assessment for AI Evaluation
                </button>
              )}
            </div>
          )}

          {/* TAB 3: HIGH FREQUENCY QUESTION BANK */}
          {activeTab === 'questionbank' && (
            <div className="space-y-5">
              {/* Coding Questions */}
              <div className="card-solid p-5 bg-white space-y-4" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'Cinzel,serif' }}>
                  <Code2 size={16} className="text-amber-700" />
                  Top Coding Questions Asked at {companyData.name}
                </h3>

                <div className="space-y-3">
                  {companyData.questionBank?.coding?.map((cQ, idx) => (
                    <div key={idx} className="p-4 rounded-xl border bg-slate-50/50 space-y-2" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{cQ.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {cQ.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{cQ.description}</p>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-mono">
                        <strong className="text-amber-700">Recommended Approach:</strong> {cQ.approach}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Core CS Questions */}
              <div className="card-solid p-5 bg-white space-y-4" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'Cinzel,serif' }}>
                  <Cpu size={16} className="text-amber-700" />
                  Technical Interview Core Questions
                </h3>

                <div className="space-y-3">
                  {companyData.questionBank?.technical?.map((tQ, idx) => (
                    <div key={idx} className="p-4 rounded-xl border bg-slate-50/50 space-y-1.5" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs font-bold text-slate-900">Q: {tQ.question}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-800">Key Answer Points:</strong> {tQ.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioral HR STAR Format Questions */}
              <div className="card-solid p-5 bg-white space-y-4" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'Cinzel,serif' }}>
                  <UserCheck size={16} className="text-amber-700" />
                  HR & Behavioral STAR Responses
                </h3>

                <div className="space-y-3">
                  {companyData.questionBank?.behavioral?.map((bQ, idx) => (
                    <div key={idx} className="p-4 rounded-xl border bg-slate-50/50 space-y-1.5" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs font-bold text-slate-900">Q: {bQ.question}</p>
                      <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-950">
                        <strong>STAR Framework:</strong> {bQ.starTip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI PLACEMENT MENTOR CHAT */}
          {activeTab === 'mentor' && (
            <div className="card-solid bg-white overflow-hidden flex flex-col h-[520px]" style={{ borderColor: 'var(--border)' }}>
              {/* Mentor Chat Header */}
              <div className="p-4 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                       style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{companyData.name} AI Placement Mentor</h3>
                    <p className="text-[10px] text-green-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Active 24/7 Study Guide
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  {[
                    'Coding Tips',
                    'Round 1 Cutoff',
                    'HR STAR Tips',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => { setInputQuery(`Give me ${preset.toLowerCase()} for ${companyData.name}`); }}
                      className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-slate-600 hidden sm:block"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ background: 'var(--canvas-bg)' }}>
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-emerald-800 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border rounded-tl-none'
                      }`}
                      style={{
                        borderColor: msg.sender === 'ai' ? 'var(--border)' : undefined,
                      }}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {isMentorTyping && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs p-2 bg-white rounded-xl border w-24">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendQuery} className="p-3 border-t bg-white flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={`Ask anything about ${companyData.name} recruitment, coding rounds, or HR questions...`}
                  className="input-solid flex-1 text-xs py-2.5 px-3"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isMentorTyping}
                  className="btn-solid-primary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Send size={13} /> Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
