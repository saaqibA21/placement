import { Router } from 'express';
import { readDb, writeDb } from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const db = readDb();
  const { studentId } = req.query;
  let list = db.trackerData || [];
  if (studentId) {
    const id = parseInt(studentId, 10);
    list = list.filter((t) => t.studentId === id);
  }
  res.json({ success: true, data: list });
});

router.put('/', (req, res) => {
  const db = readDb();
  db.trackerData = req.body.trackerData || req.body || [];
  writeDb(db);
  res.json({ success: true, data: db.trackerData, message: 'Tracker updated.' });
});

export default router;
