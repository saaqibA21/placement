import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { readDb, writeDb } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only .pdf, .doc, and .docx formats are allowed.'));
  },
});

// GET all resumes belonging to a student
router.get('/', (req, res) => {
  const db = readDb();
  const studentId = parseInt(req.query.studentId, 10);
  const list = (db.resumes || [])
    .filter((r) => r.studentId === studentId)
    .map(({ filePath, ...pub }) => pub);
  res.json({ success: true, data: list });
});

// POST upload a new saved resume
router.post('/upload', upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No resume file received.' });
  }
  const db = readDb();
  const studentId = parseInt(req.body.studentId, 10);
  const label = req.body.label || req.file.originalname;

  const newResume = {
    id: Date.now(),
    studentId,
    label,
    fileName: req.file.originalname,
    url: `/uploads/resumes/${req.file.filename}`,
    filePath: req.file.path,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
  };

  db.resumes = [newResume, ...(db.resumes || [])];
  writeDb(db);

  const { filePath, ...publicResume } = newResume;
  res.status(201).json({ success: true, data: publicResume, message: 'Resume saved to your profile.' });
});

// DELETE a saved resume
router.delete('/:id', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);
  const target = (db.resumes || []).find((r) => r.id === id);

  db.resumes = (db.resumes || []).filter((r) => r.id !== id);
  writeDb(db);

  if (target?.filePath) {
    fs.unlink(target.filePath, () => {}); // best-effort cleanup, ignore errors
  }

  res.json({ success: true, message: 'Resume removed.' });
});

export default router;
