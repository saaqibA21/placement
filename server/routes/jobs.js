import { Router } from 'express';
import { readDb, writeDb } from '../database.js';

const router = Router();

// GET all jobs
router.get('/', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.jobs || [] });
});

// POST new job (Admin creates drive)
router.post('/', (req, res) => {
  const db = readDb();
  const jobData = req.body;

  if (!jobData.company || !jobData.role) {
    return res.status(400).json({ success: false, message: 'Company and Role are required.' });
  }

  const newJob = {
    ...jobData,
    id: Date.now(),
    status: jobData.status || 'open',
    jobPosted: new Date().toISOString().split('T')[0],
    eligible: true,
    applied: false,
    batch: null,
  };

  db.jobs = [newJob, ...(db.jobs || [])];
  writeDb(db);

  res.status(201).json({ success: true, data: newJob, message: 'Recruitment drive created successfully.' });
});

// PUT update job
router.put('/:id', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);
  const updates = req.body;

  let found = false;
  db.jobs = (db.jobs || []).map((j) => {
    if (j.id === id) {
      found = true;
      return { ...j, ...updates };
    }
    return j;
  });

  if (!found) {
    return res.status(404).json({ success: false, message: 'Job drive not found.' });
  }

  writeDb(db);
  res.json({ success: true, message: 'Drive updated successfully.' });
});

// DELETE job
router.delete('/:id', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);

  db.jobs = (db.jobs || []).filter((j) => j.id !== id);
  db.applications = (db.applications || []).filter((a) => a.jobId !== id);
  writeDb(db);

  res.json({ success: true, message: 'Drive deleted successfully.' });
});

export default router;
