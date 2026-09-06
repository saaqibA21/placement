import { Router } from 'express';
import { readDb, writeDb } from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.companies || [] });
});

router.post('/', (req, res) => {
  const db = readDb();
  const company = req.body;

  const newCompany = {
    ...company,
    id: Date.now(),
    logo: company.name ? company.name.charAt(0).toUpperCase() : 'C',
    color: company.color || 'bg-emerald-700',
    roles: company.roles || ['Software Engineer'],
    status: company.status || 'open',
  };

  db.companies = [...(db.companies || []), newCompany];
  writeDb(db);

  res.status(201).json({ success: true, data: newCompany, message: 'Partner company registered.' });
});

router.put('/:id', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);
  const updates = req.body;

  db.companies = (db.companies || []).map((c) => (c.id === id ? { ...c, ...updates } : c));
  writeDb(db);
  res.json({ success: true, message: 'Company updated.' });
});

router.delete('/:id', (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id, 10);

  db.companies = (db.companies || []).filter((c) => c.id !== id);
  writeDb(db);
  res.json({ success: true, message: 'Company removed.' });
});

export default router;
