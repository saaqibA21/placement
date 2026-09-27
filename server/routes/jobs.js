import { Router } from 'express';
import { readDb, writeDb, DEFAULT_PIPELINE } from '../database.js';

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

  const actor = db.admins.find((a) => a.id === jobData.actorId) || db.admins[0];
  const now = new Date().toISOString();

  const newJob = {
    ...jobData,
    id: Date.now(),
    status: jobData.status || 'open',
    jobPosted: new Date().toISOString().split('T')[0],
    eligible: true,
    applied: false,
    batch: null,
    eligibility: jobData.eligibility || {},
    pipeline: (jobData.pipeline && jobData.pipeline.length > 0) ? jobData.pipeline : DEFAULT_PIPELINE,
    questions: jobData.questions || [],
    createdBy: actor?.id, createdByName: actor?.name || 'Placement Officer', createdAt: now,
    updatedBy: actor?.id, updatedByName: actor?.name || 'Placement Officer', updatedAt: now,
  };
  delete newJob.actorId;

  db.jobs = [newJob, ...(db.jobs || [])];
  writeDb(db);

  res.status(201).json({ success: true, data: newJob, message: 'Recruitment drive created successfully.' });
});

// POST duplicate an existing job as a starting template for a new one
router.post('/:id/duplicate', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);
  const source = (db.jobs || []).find((j) => j.id === id);

  if (!source) {
    return res.status(404).json({ success: false, message: 'Drive not found.' });
  }

  const actor = db.admins.find((a) => a.id === req.body?.actorId) || db.admins[0];
  const now = new Date().toISOString();

  const copy = {
    ...source,
    id: Date.now(),
    status: 'open',
    applied: false,
    jobPosted: new Date().toISOString().split('T')[0],
    applyBefore: '',
    dateOfVisit: '',
    createdBy: actor?.id, createdByName: actor?.name || 'Placement Officer', createdAt: now,
    updatedBy: actor?.id, updatedByName: actor?.name || 'Placement Officer', updatedAt: now,
  };

  db.jobs = [copy, ...(db.jobs || [])];
  writeDb(db);

  res.status(201).json({ success: true, data: copy, message: 'Drive duplicated as a new draft.' });
});

// PUT update job
router.put('/:id', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);
  const { actorId, ...updates } = req.body;
  const actor = db.admins.find((a) => a.id === actorId) || db.admins[0];

  let found = false;
  db.jobs = (db.jobs || []).map((j) => {
    if (j.id === id) {
      found = true;
      return { ...j, ...updates, updatedBy: actor?.id, updatedByName: actor?.name || 'Placement Officer', updatedAt: new Date().toISOString() };
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
