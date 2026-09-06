import { Router } from 'express';
import { readDb } from '../database.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }

  const db = readDb();
  const account = db.accounts.find(
    (a) =>
      a.username.toLowerCase() === username.toLowerCase().trim() &&
      a.password === password
  );

  if (!account) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  let userObj;
  if (account.role === 'student') {
    const student = db.students.find((s) => s.id === account.studentId) || db.students[0];
    userObj = { ...student, role: 'student' };
  } else {
    userObj = {
      name: 'Placement Officer',
      email: 'placements@jeppiaaruniversity.ac.in',
      role: 'admin',
    };
  }

  return res.json({
    success: true,
    user: userObj,
    role: account.role,
    token: `jwt_session_${account.role}_${Date.now()}`,
  });
});

export default router;
