import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Upload, FileText, Trash2, Eye, CheckCircle2, Camera, Pencil, X, Save,
  Linkedin, Github, Phone, Mail, BookOpen, Code2, Cloud, Cpu,
} from 'lucide-react';

const SKILL_CATEGORIES = [
  {
    label: 'Programming Languages',
    icon: Code2,
    color: '#D9822B',
    skills: ['Python', 'C++', 'Java', 'JavaScript', 'TypeScript', 'SQL'],
  },
  {
    label: 'AI & Machine Learning',
    icon: Cpu,
    color: '#15803d',
    skills: ['TensorFlow', 'PyTorch', 'Scikit-Learn', 'OpenCV', 'NLP', 'Computer Vision'],
  },
  {
    label: 'Web & Frameworks',
    icon: Code2,
    color: '#0284c7',
    skills: ['React', 'Node.js', 'FastAPI', 'Django', 'HTML/CSS', 'REST APIs'],
  },
  {
    label: 'Cloud & DevOps',
    icon: Cloud,
    color: '#b45309',
    skills: ['AWS', 'Git', 'Docker', 'Linux', 'PostgreSQL', 'MongoDB'],
  },
];

const GPA_DATA = [
  { sem: 'Sem 1', gpa: 8.1 }, { sem: 'Sem 2', gpa: 8.4 },
  { sem: 'Sem 3', gpa: 8.7 }, { sem: 'Sem 4', gpa: 8.6 },
  { sem: 'Sem 5', gpa: 8.9 }, { sem: 'Sem 6', gpa: 8.3 },
];

export default function Profile() {
  const { user } = useApp();

  const [editing, setEditing]     = useState(false);
  const [profile, setProfile]     = useState({
    linkedin: '',
    github: '',
    phone: user?.phone || '',
  });
  const [draft, setDraft]         = useState({ ...profile });
  const [photo, setPhoto]         = useState(null);
  const [resume, setResume]       = useState(null);
  const [replaceModal, setReplaceModal] = useState(false);
  const [toast, setToast]         = useState('');

  const photoRef  = useRef();
  const resumeRef = useRef();
  const newResumeRef = useRef();

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleResumeUpload = (file) => {
    if (!file) return;
    if (!['application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      showToast('Please upload a PDF or Word document.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File must be under 5 MB.');
      return;
    }
    setResume({
      name: file.name,
      size: (file.size / 1024).toFixed(0) + ' KB',
      uploadedOn: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
      url: URL.createObjectURL(file),
    });
    setReplaceModal(false);
    showToast('Resume uploaded successfully!');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleResumeUpload(file);
  };

  const saveProfile = () => {
    setProfile({ ...draft });
    setEditing(false);
    showToast('Profile updated!');
  };

  const completionFields = [
    !!user?.name, !!user?.email, !!user?.rollNo, !!user?.branch,
    !!photo, !!resume, !!draft.linkedin, !!draft.phone,
  ];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg z-50"
             style={{ background: '#15803d' }}>
          ✓ {toast}
        </div>
      )}

      {/* ── Top: Photo + Core Info ──────────────────────────────────── */}
      <div className="card-solid bg-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Photo Upload */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 shadow-sm"
                 style={{ borderColor: 'var(--amber-gold)' }}>
              {photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                     style={{ background: 'linear-gradient(135deg, #162E34 0%, #1F4047 100%)' }}>
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <button onClick={() => photoRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md hover:brightness-110 transition-all"
              style={{ background: 'var(--amber-gold)' }} title="Change photo">
              <Camera size={13} />
            </button>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Identity Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
                    {user?.name}
                  </h1>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: 'var(--amber-pale)', color: '#8C4419', border: '1px solid var(--amber-border)' }}>
                    <CheckCircle2 size={10} /> Verified Student
                  </span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">{user?.branch} · Jeppiaar University</p>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">{user?.rollNo}</p>
              </div>

              <button onClick={() => { setDraft({ ...profile }); setEditing(!editing); }}
                className="btn-solid-secondary px-3 py-1.5 text-xs flex items-center gap-1.5">
                {editing ? <X size={13} /> : <Pencil size={13} />}
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Stats Chips */}
            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { label: 'Degree',  value: user?.degree || 'B.Tech' },
                { label: 'Batch',   value: user?.batch || '2027'    },
                { label: 'CGPA',    value: user?.cgpa || '—'        },
              ].map((s) => (
                <div key={s.label} className="px-3 py-1.5 rounded-xl border text-xs"
                     style={{ borderColor: 'var(--border)', background: 'var(--canvas-bg)' }}>
                  <span className="text-slate-400">{s.label}:</span>{' '}
                  <span className="font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Completion Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Completion</span>
                <span className="text-xs font-bold" style={{ color: completion >= 80 ? '#15803d' : 'var(--amber-gold)' }}>
                  {completion}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                     style={{ width: `${completion}%`, background: completion >= 80 ? '#15803d' : 'linear-gradient(90deg, #162E34, #D9822B)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Editable Contact Fields */}
        {editing && (
          <div className="mt-5 pt-5 border-t grid grid-cols-1 sm:grid-cols-3 gap-3"
               style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'Phone Number', key: 'phone',    placeholder: '+91 98765 43210', icon: Phone    },
              { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'linkedin.com/in/…', icon: Linkedin },
              { label: 'GitHub URL',   key: 'github',   placeholder: 'github.com/…',    icon: Github   },
            ].map(({ label, key, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                  <Icon size={11} /> {label}
                </label>
                <input type="text" className="input-solid text-xs py-2"
                  value={draft[key]} placeholder={placeholder}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
              </div>
            ))}
            <div className="sm:col-span-3 flex justify-end">
              <button onClick={saveProfile} className="btn-solid-primary px-5 py-2 text-xs flex items-center gap-1.5">
                <Save size={13} /> Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Contact Display */}
        {!editing && (
          <div className="mt-4 flex flex-wrap gap-4">
            <a href={`mailto:${user?.email}`}
               className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors">
              <Mail size={13} className="text-slate-400" /> {user?.email}
            </a>
            {profile.phone && (
              <span className="flex items-center gap-1.5 text-xs text-slate-600">
                <Phone size={13} className="text-slate-400" /> {profile.phone}
              </span>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                 target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                <Linkedin size={13} /> LinkedIn
              </a>
            )}
            {profile.github && (
              <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                 target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 text-xs text-slate-700 hover:underline">
                <Github size={13} /> GitHub
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Resume Upload Section ────────────────────────────────────── */}
      <div className="card-solid bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>
              Resume / Curriculum Vitae
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Upload your updated resume for recruitment screenings</p>
          </div>
        </div>

        {resume ? (
          /* Uploaded Resume Card */
          <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'var(--amber-pale)', border: '1px solid var(--amber-border)' }}>
              <FileText size={22} style={{ color: 'var(--amber-gold)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{resume.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{resume.size} · Uploaded {resume.uploadedOn}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a href={resume.url} target="_blank" rel="noopener noreferrer"
                 className="btn-solid-secondary px-3 py-1.5 text-xs flex items-center gap-1.5">
                <Eye size={13} /> View
              </a>
              <button onClick={() => setReplaceModal(true)}
                className="btn-solid-primary px-3 py-1.5 text-xs flex items-center gap-1.5">
                <Upload size={13} /> Replace
              </button>
              <button onClick={() => { setResume(null); showToast('Resume removed.'); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ) : (
          /* Upload Drop Zone */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => resumeRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-amber-50/40"
            style={{ borderColor: 'var(--amber-gold)', background: 'var(--amber-pale)' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                 style={{ background: 'rgba(217,130,43,0.15)' }}>
              <Upload size={26} style={{ color: 'var(--amber-gold)' }} />
            </div>
            <p className="font-bold text-slate-800 text-sm">Drop your resume here or click to browse</p>
            <p className="text-xs text-slate-500 mt-1">Supported: PDF, DOC, DOCX · Max size: 5 MB</p>
          </div>
        )}
        <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
          onChange={(e) => handleResumeUpload(e.target.files[0])} />

        {/* Replace Confirmation Modal */}
        {replaceModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: 'Cinzel,serif' }}>Replace Resume?</h3>
              <p className="text-xs text-slate-500 mb-4">
                Your current resume will be replaced. Make sure your new resume is up to date before uploading.
              </p>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => newResumeRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer mb-4"
                style={{ borderColor: 'var(--amber-gold)', background: 'var(--amber-pale)' }}>
                <Upload size={20} style={{ color: 'var(--amber-gold)' }} />
                <p className="text-xs font-semibold text-slate-700 mt-1">Click or drop new resume file</p>
              </div>
              <input ref={newResumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={(e) => handleResumeUpload(e.target.files[0])} />
              <button onClick={() => setReplaceModal(false)} className="btn-solid-secondary w-full py-2 text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Two-Column: GPA + Skills ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* GPA Trend */}
        <div className="card-solid bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={15} style={{ color: 'var(--amber-gold)' }} />
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Cinzel,serif' }}>Semester GPA Trend</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {GPA_DATA.map((g) => (
              <div key={g.sem} className="p-3 rounded-xl text-center border"
                   style={{ background: 'var(--canvas-bg)', borderColor: 'var(--border)' }}>
                <p className="text-lg font-bold" style={{ color: g.gpa >= 8.5 ? '#15803d' : 'var(--amber-gold)' }}>{g.gpa}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{g.sem}</p>
                <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${((g.gpa - 7) / 3) * 100}%`,
                    background: g.gpa >= 8.5 ? '#15803d' : 'var(--amber-gold)'
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs"
               style={{ borderColor: 'var(--border)' }}>
            <span className="text-slate-400">Overall CGPA</span>
            <span className="font-bold text-lg" style={{ color: 'var(--amber-gold)' }}>{user?.cgpa || '8.5'}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="card-solid bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4" style={{ fontFamily: 'Cinzel,serif' }}>Technical Skills</h2>
          <div className="space-y-4">
            {SKILL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.label}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon size={12} style={{ color: cat.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cat.color }}>
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((s) => (
                      <span key={s} className="text-[11px] px-2.5 py-1 rounded-full font-medium border"
                            style={{ background: 'var(--canvas-bg)', color: 'var(--text-dark)', borderColor: 'var(--border)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
