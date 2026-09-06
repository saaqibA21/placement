import { Router } from 'express';
import { readDb, writeDb } from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.surveys || [] });
});

router.post('/:id/submit', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);

  db.surveys = (db.surveys || []).map((s) => (s.id === id ? { ...s, status: 'completed' } : s));
  writeDb(db);

  res.json({ success: true, message: 'Survey feedback submitted.' });
});

export default router;
