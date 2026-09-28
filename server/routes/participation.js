import { Router } from 'express';
import { readDb, writeDb } from '../database.js';

const router = Router();

const CONFIRM_CUTOFF_MINUTES = 15;
const CHECKIN_WINDOW_BEFORE_MINUTES = 30;
const CHECKIN_WINDOW_AFTER_HOURS = 3;

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function findRound(db, applicationId) {
  const entry = (db.trackerData || []).find((t) => t.applicationId === applicationId);
  if (!entry) return { entry: null, round: null, index: -1 };
  const app = (db.applications || []).find((a) => a.id === applicationId);
  const index = app?.stageIndex ?? 0;
  return { entry, round: entry.rounds[index], index };
}

// GET all of a student's rounds that have a scheduled date, across every
// application they've made — this is what the Participation page shows.
router.get('/upcoming', (req, res) => {
  const db = readDb();
  const studentId = parseInt(req.query.studentId, 10);
  const entries = (db.trackerData || []).filter((t) => t.studentId === studentId);

  const upcoming = [];
  entries.forEach((t) => {
    t.rounds.forEach((r, i) => {
      if (r.scheduledAt) {
        upcoming.push({
          applicationId: t.applicationId,
          company: t.company,
          initial: t.initial,
          color: t.color,
          roundName: r.name,
          roundIndex: i,
          scheduledAt: r.scheduledAt,
          venue: r.venue,
          confirmation: r.confirmation,
          attendance: r.attendance,
          status: r.status,
        });
      }
    });
  });
  upcoming.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  res.json({ success: true, data: upcoming });
});

// PATCH admin schedules the candidate's current round with a date/time +
// venue, and issues a fresh venue check-in code for it.
router.patch('/schedule', (req, res) => {
  const db = readDb();
  const { applicationId, scheduledAt, venue } = req.body;
  const { entry, round, index } = findRound(db, parseInt(applicationId, 10));

  if (!entry || !round) {
    return res.status(404).json({ success: false, message: 'No matching round found for this application.' });
  }

  const code = generateCode();
  entry.rounds[index] = { ...round, scheduledAt, venue: venue || null, confirmation: 'none', attendance: 'not_marked', checkInCode: code };
  writeDb(db);

  res.json({ success: true, data: entry.rounds[index], message: 'Round scheduled and venue code generated.' });
});

// PATCH student confirms or declines their scheduled round, up to a cutoff
// before it starts.
router.patch('/confirm', (req, res) => {
  const db = readDb();
  const { applicationId, response } = req.body;
  if (!['confirmed', 'declined'].includes(response)) {
    return res.status(400).json({ success: false, message: 'Response must be confirmed or declined.' });
  }

  const { entry, round, index } = findRound(db, parseInt(applicationId, 10));
  if (!entry || !round || !round.scheduledAt) {
    return res.status(404).json({ success: false, message: 'No scheduled round found for this application.' });
  }

  const cutoff = new Date(round.scheduledAt).getTime() - CONFIRM_CUTOFF_MINUTES * 60 * 1000;
  if (Date.now() > cutoff) {
    return res.status(400).json({ success: false, message: `Too late to respond — confirmation closes ${CONFIRM_CUTOFF_MINUTES} minutes before the round starts.` });
  }

  entry.rounds[index] = { ...round, confirmation: response };
  writeDb(db);
  res.json({ success: true, data: entry.rounds[index], message: `Response recorded: ${response}.` });
});

// POST self check-in by venue code (typed in, or arrived at via scanning the
// admin's displayed QR, which links to /checkin/:code in the app).
router.post('/checkin', (req, res) => {
  const db = readDb();
  const { studentId, code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Enter the venue check-in code.' });

  const parsedStudentId = parseInt(studentId, 10);
  let found = null;
  (db.trackerData || []).forEach((t) => {
    if (t.studentId !== parsedStudentId) return;
    t.rounds.forEach((r, i) => {
      if (r.checkInCode && r.checkInCode.toUpperCase() === code.toUpperCase().trim()) {
        found = { entry: t, round: r, index: i };
      }
    });
  });

  if (!found) {
    return res.status(404).json({ success: false, message: 'That code doesn’t match any of your scheduled rounds.' });
  }

  const { entry, round, index } = found;
  if (!round.scheduledAt) {
    return res.status(400).json({ success: false, message: 'This round has no scheduled time.' });
  }
  const scheduled = new Date(round.scheduledAt).getTime();
  const windowStart = scheduled - CHECKIN_WINDOW_BEFORE_MINUTES * 60 * 1000;
  const windowEnd = scheduled + CHECKIN_WINDOW_AFTER_HOURS * 60 * 60 * 1000;
  const now = Date.now();
  if (now < windowStart || now > windowEnd) {
    return res.status(400).json({ success: false, message: 'Check-in is only open shortly before and during the round.' });
  }

  entry.rounds[index] = { ...round, attendance: 'present' };
  writeDb(db);
  res.json({ success: true, data: entry.rounds[index], message: `Checked in for ${round.name} at ${entry.company}.` });
});

// PATCH admin manually marks attendance (fallback for no camera/scanner at
// the venue).
router.patch('/mark-attendance', (req, res) => {
  const db = readDb();
  const { applicationId, attendance } = req.body;
  if (!['present', 'absent', 'not_marked'].includes(attendance)) {
    return res.status(400).json({ success: false, message: 'Invalid attendance value.' });
  }

  const { entry, round, index } = findRound(db, parseInt(applicationId, 10));
  if (!entry || !round) {
    return res.status(404).json({ success: false, message: 'No matching round found for this application.' });
  }

  entry.rounds[index] = { ...round, attendance };
  writeDb(db);
  res.json({ success: true, data: entry.rounds[index], message: `Marked ${attendance}.` });
});

export default router;
