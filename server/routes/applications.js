import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { readDb, writeDb } from '../database.js';

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

// POST submit new application (with optional resume file upload)
router.post('/apply', upload.single('resume'), (req, res) => {
  const db = readDb();
  const { jobId, studentId, studentName, rollNo, branch, cgpa, company, role, resumeName, answers } = req.body;

  const parsedJobId = parseInt(jobId, 10);
  const appliedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const job = (db.jobs || []).find((j) => j.id === parsedJobId);
  let parsedAnswers = [];
  try { parsedAnswers = answers ? JSON.parse(answers) : []; } catch { parsedAnswers = []; }

  // If a physical file was uploaded via Multer
  let uploadedFileUrl = null;
  let finalResumeName = resumeName || (req.file ? req.file.originalname : `Resume_${studentName?.replace(/\s+/g, '_') || 'Student'}.pdf`);

  if (req.file) {
    uploadedFileUrl = `/uploads/resumes/${req.file.filename}`;
    finalResumeName = req.file.originalname;
  }

  const newApp = {
    id: Date.now(),
    jobId: parsedJobId,
    studentId: parseInt(studentId, 10) || 1,
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
    atsScore: null,
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
    company: company || 'Recruitment Partner',
    initial: (company || 'R').charAt(0).toUpperCase(),
    color: 'bg-emerald-700',
    jobType: 'FTE',
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

// PATCH application status (Shortlist / Reject / Advance to next round)
router.patch('/:id/status', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  let found = false;
  db.applications = (db.applications || []).map((a) => {
    if (a.id !== id) return a;
    found = true;
    const job = (db.jobs || []).find((j) => j.id === a.jobId);
    const pipeline = job?.pipeline || [];
    let stageIndex = a.stageIndex ?? 0;
    let round = a.round;

    if (status === 'shortlisted') {
      stageIndex = Math.min(stageIndex + 1, Math.max(pipeline.length - 1, 0));
      round = pipeline[stageIndex] ? `Round ${stageIndex + 1}: ${pipeline[stageIndex].name}` : a.round;
    } else if (status === 'rejected') {
      round = 'Application Rejected';
    }

    return { ...a, status, stageIndex, round };
  });

  if (!found) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  writeDb(db);
  res.json({ success: true, message: `Application ${status} successfully.` });
});

export default router;
