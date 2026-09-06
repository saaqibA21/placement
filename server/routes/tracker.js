import { Router } from 'express';
import { readDb, writeDb } from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.trackerData || [] });
});

router.put('/', (req, res) => {
  const db = readDb();
  db.trackerData = req.body.trackerData || req.body || [];
  writeDb(db);
  res.json({ success: true, data: db.trackerData, message: 'Tracker updated.' });
});

export default router;
