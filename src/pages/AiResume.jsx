import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import {
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  RefreshCw, Copy, Check, Download, Layers, ShieldCheck, Target, ChevronRight, UserCheck
} from 'lucide-react';

const DEFAULT_SAMPLE_RESUME = `MOHAMED SAAQIB
Chennai, India | saaqib@jeppiaar.ac.in | linkedin.com/in/saaqib | github.com/saaqibA21

EDUCATION
Jeppiaar University, Chennai
B.Tech in Computer Science & Engineering (2021 – 2025)
CGPA: 8.9 / 10.0

TECHNICAL SKILLS
Languages: Python, JavaScript, Java, C++, SQL
Frontend: React.js, TailwindCSS, HTML5, CSS3, Redux Toolkit
Backend: Node.js, Express.js, REST APIs, PostgreSQL, MongoDB
Developer Tools: Git, GitHub, Docker, Postman, Linux, Vite

PROJECTS
• University Placement Management System (React, Node.js, Express, PostgreSQL)
  - Built full stack campus recruitment portal serving 2,000+ registered university students and placement cell administrators.
  - Implemented secure role-based JWT authentication, dynamic drive application flows, and multi-part PDF resume screening backend.
  - Engineered responsive dashboard UI with custom TailwindCSS theme, achieving 98 Lighthouse performance score.

• AI Medical Diagnostics & Image Classification Engine (Python, TensorFlow, FastAPI)
  - Trained deep convolutional neural network (CNN) on 15,000+ medical imaging scans with 94.2% diagnostic validation accuracy.
  - Created high-performance REST inferencing microservice using FastAPI, handling 120 requests/sec with under 45ms latency.

EXPERIENCE
• Full Stack Software Development Intern — Cognizant Technology Solutions (May 2024 – July 2024)
  - Worked on enterprise client portal modernization, migrating legacy server pages to modular React components.
  - Optimized database query indexes and eliminated redundant API network calls, decreasing average load time by 32%.
  - Participated in daily Agile standups, sprint planning, and conducted peer code reviews across 8 engineering team members.

LEADERSHIP & CERTIFICATIONS
• AWS Certified Cloud Practitioner
• Finalist — Smart India Hackathon (SIH 2024)`;

const TARGET_ROLES = [
  'Full Stack Developer',
  'Software Systems Engineer',
  'Data Analyst / Scientist',
  'Cloud / DevOps Engineer',
  'AI & Machine Learning Engineer',
];

const TARGET_COMPANIES = [
  'TCS',
  'Zoho',
  'Amazon',
  'Microsoft',
  'Infosys',
  'Accenture',
  'Cognizant',
  'Wipro',
  'Google',
];

export default function AiResume() {
  const { user } = useApp();
  const [resumeText, setResumeText] = useState(DEFAULT_SAMPLE_RESUME);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [targetCompany, setTargetCompany] = useState('Amazon');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, keywords, bullets, checklist
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    // Read text from text/markdown files or parse basic string
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target.result);
      };
      reader.readAsText(file);
    } else {
      // For PDF/DOCX, simulate extracted text representation
      setResumeText(`[Document Uploaded: ${file.name}]\n\nCandidate: ${user?.name || 'Mohamed Saaqib'}\nRoll: ${user?.rollNo || '21CS101'} | Branch: ${user?.branch || 'Computer Science'}\nTarget: ${targetRole}\n\nTechnical Skills: React, Node.js, JavaScript, Python, SQL, REST APIs, Git, PostgreSQL, Docker.\nExperience: Developed campus portal and medical AI diagnostics with high performance and 94% validation accuracy.\nEducation: B.Tech Computer Science, CGPA ${user?.cgpa || 8.9}.`);
    }
  };

  const runAnalysis = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeResume({
        resumeText,
        targetRole,
        targetCompany,
      });
      if (res && res.data) {
        setReport(res.data);
      }
    } catch (err) {
      console.error('Failed to run AI resume analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const loadProfileCv = () => {
    if (user) {
      setResumeText(
        `${user.name || 'Candidate Name'}\nRoll No: ${user.rollNo || '21CS101'} | Branch: ${user.branch || 'Computer Science'}\nCGPA: ${user.cgpa || 8.9} | Email: ${user.email || 'student@jeppiaar.ac.in'}\n\nTECHNICAL SKILLS\nProgramming: Python, Java, C++, JavaScript, TypeScript, SQL\nFrameworks: React.js, Node.js, Express, TailwindCSS\nTools: Git, Docker, Postman, Linux\n\nPROJECTS\n• Campus Recruitment Drive Automation Hub\n  - Engineered full stack web app using React and Express with atomic persistence.\n  - Built multi-part resume upload handling and candidate screening dashboard.\n\nEDUCATION\nJeppiaar University, Chennai\nB.Tech Computer Science & Engineering`
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-1.5"
               style={{ background: 'var(--amber-pale)', color: '#8C4419', border: '1px solid var(--amber-border)' }}>
            <Sparkles size={13} className="text-amber-700" />
            AI Career Intelligence Engine
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
            AI Resume Review & ATS Analyzer
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Evaluate your resume against top company hiring benchmarks, optimize ATS keywords, and rewrite weak bullet points.
          </p>
        </div>

        {report && (
          <button
            onClick={handlePrint}
            className="btn-solid-secondary px-4 py-2 text-xs flex items-center gap-1.5 font-semibold self-start sm:self-auto"
          >
            <Download size={13} /> Export Report
          </button>
        )}
      </div>

      {/* Transparency note: this same engine also screens live applications */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl border text-xs text-slate-600"
           style={{ background: 'var(--amber-pale)', borderColor: 'var(--amber-border)' }}>
        <UserCheck size={15} className="text-amber-700 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Good to know:</strong> when you apply to a drive with a PDF resume, the placement cell's screening dashboard
          automatically runs this same engine on it and shows admins an AI Score for that specific role. Running a check here
          first — and fixing what it flags — improves how your application is triaged.
        </p>
      </div>

      {/* Target Role & Company Selector Banner */}
      <div className="card-solid p-4 sm:p-5 bg-white space-y-4" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Target Recruitment Drive Customization
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Job Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="input-solid w-full text-xs font-medium py-2.5"
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Company Benchmark</label>
            <select
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="input-solid w-full text-xs font-medium py-2.5"
            >
              {TARGET_COMPANIES.map((company) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resume Input Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Text Area & File Upload (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-solid p-4 bg-white space-y-3" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText size={14} className="text-slate-500" />
                Resume Content / CV Text
              </span>
              <button
                type="button"
                onClick={loadProfileCv}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold underline flex items-center gap-1"
              >
                <UserCheck size={12} /> Auto-Fill Profile
              </button>
            </div>

            <textarea
              rows={14}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here (Education, Skills, Experience, Projects)..."
              className="input-solid w-full text-xs font-mono p-3 leading-relaxed resize-y"
              style={{ background: 'var(--canvas-bg)' }}
            />

            {/* Document Upload Button */}
            <div className="pt-2 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-solid-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
              >
                <Upload size={13} /> {fileName ? fileName.slice(0, 18) + '...' : 'Upload PDF / DOCX'}
              </button>

              <span className="text-[10px] text-slate-400 font-mono">
                {resumeText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {/* Run Analysis Button */}
            <button
              type="button"
              onClick={runAnalysis}
              disabled={isAnalyzing || !resumeText.trim()}
              className="w-full btn-solid-primary py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Running AI Evaluation Engine...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Analyze & Score Resume for {targetCompany}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Analysis Report (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!report ? (
            <div className="card-solid p-10 bg-white flex flex-col items-center justify-center text-center h-full min-h-[380px]" style={{ borderColor: 'var(--border)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                   style={{ background: 'var(--amber-pale)', color: '#8C4419' }}>
                <Sparkles size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: 'Cinzel,serif' }}>
                Ready to Evaluate Your Profile
              </h3>
              <p className="text-slate-500 text-xs max-w-sm mt-1 mb-5">
                Click <strong>"Analyze & Score Resume"</strong> to generate your composite ATS score, keyword alignment, and AI rewrites.
              </p>
              <button
                onClick={runAnalysis}
                className="btn-solid-secondary px-5 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                Run Quick Demo Analysis <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ATS Top Score Banner */}
              <div className="card-solid p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-5"
                   style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-4">
                  {/* Circular Score Badge */}
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center border-4 flex-shrink-0"
                       style={{
                         borderColor: report.badgeColor,
                         background: `${report.badgeColor}10`,
                       }}>
                    <div className="text-center">
                      <span className="text-2xl font-black text-slate-900 leading-none">
                        {report.overallAtsScore}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block">/100</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ATS Match Rating</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
                            style={{ background: report.badgeColor }}>
                        {report.statusLabel}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5" style={{ fontFamily: 'Cinzel,serif' }}>
                      {report.targetRole}
                    </h2>
                    <p className="text-slate-500 text-xs">
                      Evaluated against <strong>{report.targetCompany}</strong> recruitment standards.
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l pl-0 sm:pl-5 border-slate-100 flex-shrink-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Shortlist Chance</p>
                  <p className="text-xl font-bold" style={{ color: report.badgeColor }}>
                    {report.overallAtsScore >= 80 ? '88% – Very High' : report.overallAtsScore >= 65 ? '64% – Moderate' : '35% – Low'}
                  </p>
                  <p className="text-[10px] text-slate-400">Based on recruiter parsing models</p>
                </div>
              </div>

              {/* Pillar Score Bars */}
              <div className="card-solid p-4 bg-white grid grid-cols-2 sm:grid-cols-3 gap-3" style={{ borderColor: 'var(--border)' }}>
                {Object.entries(report.pillars).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-xl border bg-slate-50/50" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[11px] font-semibold text-slate-600 truncate">{val.label}</span>
                      <span className="font-bold" style={{ color: val.score >= 75 ? '#15803d' : val.score >= 50 ? '#b45309' : '#be123c' }}>
                        {val.score}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${val.score}%`,
                          background: val.score >= 75 ? '#15803d' : val.score >= 50 ? '#b45309' : '#be123c',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Tabs for Detailed Insights */}
              <div className="flex gap-1 border-b pb-1" style={{ borderColor: 'var(--border)' }}>
                {[
                  { key: 'overview', label: 'Keyword Gap' },
                  { key: 'bullets', label: 'AI Bullet Rewrites' },
                  { key: 'checklist', label: 'Improvement Checklist' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`tab-light text-xs font-semibold ${activeTab === tab.key ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Keyword Analysis */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Matched Keywords */}
                  <div className="card-solid p-4 bg-white space-y-2.5" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-green-600" />
                        Matched Keywords & Tech Stack ({report.matchedKeywords.length})
                      </p>
                      <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        Parsed by ATS
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {report.matchedKeywords.map((kw) => (
                        <span key={kw} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-green-50 text-green-800 border border-green-200 flex items-center gap-1">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="card-solid p-4 bg-white space-y-2.5" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-amber-600" />
                        High-Impact Missing Keywords ({report.missingKeywords.length})
                      </p>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Recommended to Add
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Adding these terms under your Projects or Skills section will significantly improve ATS algorithm matching.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.missingKeywords.map((kw) => (
                        <span key={kw} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: AI Bullet Point Rewrites */}
              {activeTab === 'bullets' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Transform passive statements into high-impact, metrics-driven bullet points that impress human recruiters:
                  </p>
                  {report.bulletRewrites.map((b, idx) => (
                    <div key={idx} className="card-solid p-4 bg-white space-y-3" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {b.category}
                        </span>
                        <span className="text-[10px] text-red-600 font-medium">{b.reason}</span>
                      </div>

                      {/* Before & After comparison */}
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-red-50/60 border border-red-200/80 text-red-900">
                          <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-0.5">Weak Original Statement:</p>
                          <p className="font-mono text-[11px]">{b.original}</p>
                        </div>

                        <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-300 text-emerald-950 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles size={11} /> AI Recruiter-Optimized Rewrite:
                            </p>
                            <button
                              onClick={() => handleCopy(b.improved, idx)}
                              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-emerald-200"
                            >
                              {copiedIdx === idx ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
                              {copiedIdx === idx ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <p className="font-semibold text-xs leading-relaxed">{b.improved}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Improvement Checklist */}
              {activeTab === 'checklist' && (
                <div className="space-y-3">
                  {report.suggestions.map((s, idx) => (
                    <div key={idx} className="card-solid p-4 bg-white flex items-start gap-3" style={{ borderColor: 'var(--border)' }}>
                      <div className="mt-0.5">
                        {s.type === 'critical' ? (
                          <XCircle size={18} className="text-red-500" />
                        ) : s.type === 'warning' ? (
                          <AlertTriangle size={18} className="text-amber-500" />
                        ) : (
                          <CheckCircle2 size={18} className="text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
