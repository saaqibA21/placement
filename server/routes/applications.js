import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { readDb, writeDb } from '../database.js';
import { extractResumeText } from '../utils/extractResumeText.js';
import { evaluateResumeText, mapJobToRole } from '../utils/resumeScoring.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = Router();

// Configure Multer storage for candidate resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .doc, and .docx formats are allowed.'));
    }
  },
});

// GET all applications (Admin screening)
router.get('/', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.applications || [] });
});

// Keeps a student's Tracker entry in lockstep with their application's real
// pipeline position, so admin decisions (advance / reject) show up in the
// student's round-by-round view instead of the two collections drifting apart.
function syncTrackerForApplication(db, app, job) {
  const entry = (db.trackerData || []).find((t) => t.applicationId === app.id);
  if (!entry) return;

  const pipeline = (job?.pipeline && job.pipeline.length > 0) ? job.pipeline : entry.rounds.map((r) => ({ name: r.name }));
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const fullyCleared = app.status === 'shortlisted' && app.stageIndex >= pipeline.length - 1;

  entry.rounds = pipeline.map((stage, i) => {
    const existingDate = entry.rounds[i]?.date;
    if (fullyCleared) {
      return { name: stage.name, status: 'cleared', date: existingDate || today };
    }
    if (app.status === 'rejected' && i === app.stageIndex) {
      return { name: stage.name, status: 'rejected', date: existingDate || today };
    }
    if (i < app.stageIndex) {
      return { name: stage.name, status: 'cleared', date: existingDate || today };
    }
    if (i === app.stageIndex && app.status !== 'rejected') {
      return { name: stage.name, status: 'pending', date: existingDate || today };
    }
    return { name: stage.name, status: 'upcoming', date: null };
  });
}

// Runs the shared ATS engine against whichever resume file backs this
// application (a freshly uploaded file, or a previously saved one picked
// by resumeId). Never fabricates a score for a file we couldn't read.
async function scoreApplication(job, filePath) {
  if (!filePath) {
    return { atsScore: null, atsReport: { note: 'No resume file was attached — automatic screening needs a PDF resume to score.' } };
  }
  const text = await extractResumeText(filePath);
  if (!text) {
    return { atsScore: null, atsReport: { note: 'Automatic ATS scoring only supports PDF resumes right now — this file could not be scored.' } };
  }
  const report = evaluateResumeText(text, mapJobToRole(job), job?.company);
  return { atsScore: report.overallAtsScore, atsReport: report };
}

// POST submit new application (with optional resume file upload, or a
// previously saved resume selected by resumeId)
router.post('/apply', upload.single('resume'), async (req, res) => {
  const db = readDb();
  const { jobId, studentId, studentName, rollNo, branch, cgpa, company, role, resumeName, resumeId, answers } = req.body;

  const parsedJobId = parseInt(jobId, 10);
  const parsedStudentId = parseInt(studentId, 10) || 1;
  const appliedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const job = (db.jobs || []).find((j) => j.id === parsedJobId);
  let parsedAnswers = [];
  try { parsedAnswers = answers ? JSON.parse(answers) : []; } catch { parsedAnswers = []; }

  let uploadedFileUrl = null;
  let finalResumeName = resumeName || (req.file ? req.file.originalname : `Resume_${studentName?.replace(/\s+/g, '_') || 'Student'}.pdf`);
  let scoringFilePath = null;
  let finalResumeId = resumeId ? parseInt(resumeId, 10) : null;

  if (req.file) {
    // A fresh file was uploaded at apply-time — save it to the student's
    // resume library too, so it's available for future applications.
    uploadedFileUrl = `/uploads/resumes/${req.file.filename}`;
    finalResumeName = req.file.originalname;
    scoringFilePath = req.file.path;

    const savedResume = {
      id: Date.now() + 1,
      studentId: parsedStudentId,
      label: req.file.originalname,
      fileName: req.file.originalname,
      url: uploadedFileUrl,
      filePath: req.file.path,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
    };
    db.resumes = [savedResume, ...(db.resumes || [])];
    finalResumeId = savedResume.id;
  } else if (finalResumeId) {
    const saved = (db.resumes || []).find((r) => r.id === finalResumeId);
    if (saved) {
      scoringFilePath = saved.filePath;
      uploadedFileUrl = saved.url;
      finalResumeName = saved.fileName;
    }
  }

  const { atsScore, atsReport } = await scoreApplication(job, scoringFilePath);

  const newApp = {
    id: Date.now(),
    jobId: parsedJobId,
    studentId: parsedStudentId,
    studentName: studentName || 'Candidate',
    rollNo: rollNo || '21CS001',
    branch: branch || 'Computer Science',
    cgpa: parseFloat(cgpa) || 8.5,
    company: company || 'Recruitment Partner',
    role: role || 'Candidate',
    appliedOn: appliedDate,
    round: `Round 1: ${job?.pipeline?.[0]?.name || 'Screening'}`,
    stageIndex: 0,
    status: 'pending',
    resumeName: finalResumeName,
    resumeUrl: uploadedFileUrl,
    resumeId: finalResumeId,
    atsScore,
    atsReport,
    answers: parsedAnswers,
  };

  db.applications = [newApp, ...(db.applications || [])];

  // Update job applied flag
  db.jobs = (db.jobs || []).map((j) => (j.id === parsedJobId ? { ...j, applied: true } : j));

  // Add to trackerData, mirroring the job's actual hiring pipeline
  const pipelineStages = (job?.pipeline && job.pipeline.length > 0) ? job.pipeline : [
    { name: 'Application & Resume Screening' },
    { name: 'Online Assessment / Aptitude' },
    { name: 'Technical Interview Round' },
    { name: 'HR & Final Offer Rollout' },
  ];
  const newTrackerEntry = {
    id: Date.now(),
    applicationId: newApp.id,
    studentId: parsedStudentId,
    company: company || 'Recruitment Partner',
    initial: (company || 'R').charAt(0).toUpperCase(),
    color: 'bg-emerald-700',
    jobType: job?.jobType || 'FTE',
    date: `Applied ${appliedDate}`,
    rounds: pipelineStages.map((stage, i) => ({
      name: stage.name,
      status: i === 0 ? 'pending' : 'upcoming',
      date: i === 0 ? appliedDate : null,
    })),
  };
  db.trackerData = [newTrackerEntry, ...(db.trackerData || [])];

  writeDb(db);

  res.status(201).json({
    success: true,
    data: newApp,
    message: 'Application submitted and sent to placement cell.',
  });
});

// Shared decision logic used by the single-candidate routes below AND the
// bulk-update route, so a round-trip Excel import behaves identically to
// clicking through candidates one at a time in the admin UI.
function applyAdvance(db, app) {
  const job = (db.jobs || []).find((j) => j.id === app.jobId);
  const pipeline = job?.pipeline || [];
  const lastIndex = Math.max(pipeline.length - 1, 0);
  let stageIndex = app.stageIndex ?? 0;
  let status = 'pending';

  if (stageIndex >= lastIndex) {
    status = 'shortlisted'; // cleared the final stage -- fully selected
  } else {
    stageIndex += 1;
  }

  const round = pipeline[stageIndex] ? `Round ${stageIndex + 1}: ${pipeline[stageIndex].name}` : app.round;
  const updated = { ...app, status, stageIndex, round };
  syncTrackerForApplication(db, updated, job);
  return updated;
}

function applyReject(db, app) {
  const job = (db.jobs || []).find((j) => j.id === app.jobId);
  const pipeline = job?.pipeline || [];
  const stageIndex = app.stageIndex ?? 0;
  const round = pipeline[stageIndex] ? `Rejected at Round ${stageIndex + 1}: ${pipeline[stageIndex].name}` : 'Application Rejected';
  const updated = { ...app, status: 'rejected', round };
  syncTrackerForApplication(db, updated, job);
  return updated;
}

// PATCH application status (Reject / manually set a bucket status)
router.patch('/:id/status', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  const idx = (db.applications || []).findIndex((a) => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  const current = db.applications[idx];
  const resultApp = status === 'shortlisted' ? applyAdvance(db, current)
    : status === 'rejected' ? applyReject(db, current)
    : { ...current, status };
  db.applications[idx] = resultApp;

  writeDb(db);
  res.json({ success: true, data: resultApp, message: `Application ${status} successfully.` });
});

// PATCH advance a candidate to the next stage of the job's real hiring
// pipeline. Advancing past the final stage marks them fully selected.
router.patch('/:id/advance', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);

  const idx = (db.applications || []).findIndex((a) => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  const resultApp = applyAdvance(db, db.applications[idx]);
  db.applications[idx] = resultApp;

  writeDb(db);
  res.json({
    success: true,
    data: resultApp,
    message: resultApp.status === 'shortlisted' ? 'Candidate marked as selected!' : 'Advanced to the next round.',
  });
});

// POST bulk-update many applications at once -- the "excel round-trip"
// workflow: admin exports the candidates at a round, sends the sheet to the
// company, gets it back with a Decision column filled in, and imports it
// here. Each row becomes one entry: { applicationId, decision: 'advance' |
// 'reject' }. Unrecognized/blank decisions should be filtered out
// client-side before calling this, but anything else is safely skipped.
router.post('/bulk-update', (req, res) => {
  const db = readDb();
  const updates = Array.isArray(req.body.updates) ? req.body.updates : [];
  const summary = { advanced: 0, selected: 0, rejected: 0, skipped: 0, notFound: [] };

  updates.forEach(({ applicationId, decision }) => {
    const id = parseInt(applicationId, 10);
    const idx = (db.applications || []).findIndex((a) => a.id === id);
    if (idx === -1) { summary.notFound.push(id); return; }

    if (decision === 'advance') {
      const before = db.applications[idx];
      const updated = applyAdvance(db, before);
      db.applications[idx] = updated;
      if (updated.status === 'shortlisted' && before.status !== 'shortlisted') summary.selected += 1;
      else summary.advanced += 1;
    } else if (decision === 'reject') {
      db.applications[idx] = applyReject(db, db.applications[idx]);
      summary.rejected += 1;
    } else {
      summary.skipped += 1;
    }
  });

  writeDb(db);
  res.json({ success: true, data: summary, message: 'Bulk update applied.' });
});

export default router;
