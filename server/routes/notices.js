import { Router } from 'express';
import { readDb, writeDb } from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.notices || [] });
});

router.post('/', (req, res) => {
  const db = readDb();
  const noticeData = req.body;

  const newNotice = {
    ...noticeData,
    id: Date.now(),
    timeAgo: 'Just now',
  };

  db.notices = [newNotice, ...(db.notices || [])];
  writeDb(db);

  res.status(201).json({ success: true, data: newNotice, message: 'Notice published successfully.' });
});

router.put('/:id', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);
  const updates = req.body;

  db.notices = (db.notices || []).map((n) => (n.id === id ? { ...n, ...updates } : n));
  writeDb(db);
  res.json({ success: true, message: 'Notice updated.' });
});

router.delete('/:id', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);

  db.notices = (db.notices || []).filter((n) => n.id !== id);
  writeDb(db);
  res.json({ success: true, message: 'Notice deleted.' });
});

export default router;
