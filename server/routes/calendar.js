import { Router } from 'express';
import { readDb } from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.calendarEvents || [] });
});

export default router;
