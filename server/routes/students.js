import { Router } from 'express';
import { readDb, writeDb } from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.students || [] });
});

router.patch('/:id/freeze', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);

  let newStatus = 'active';
  db.students = (db.students || []).map((s) => {
    if (s.id === id) {
      newStatus = s.status === 'active' ? 'frozen' : 'active';
      return { ...s, status: newStatus };
    }
    return s;
  });

  writeDb(db);
  res.json({ success: true, status: newStatus, message: `Student eligibility ${newStatus}.` });
});

export default router;
