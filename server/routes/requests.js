import { Router } from 'express';
import { readDb, writeDb } from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.requests || [] });
});

router.post('/', (req, res) => {
  const db = readDb();
  const reqData = req.body;

  const newRequest = {
    id: Date.now(),
    type: reqData.type || 'Profile Update',
    description: reqData.description,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
  };

  db.requests = [newRequest, ...(db.requests || [])];
  writeDb(db);

  res.status(201).json({ success: true, data: newRequest, message: 'Placement request raised.' });
});

export default router;
