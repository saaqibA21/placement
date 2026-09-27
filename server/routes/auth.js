import { Router } from 'express';
import { readDb, comparePassword } from '../database.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }

  const db = readDb();
  const account = db.accounts.find(
    (a) => a.username.toLowerCase() === username.toLowerCase().trim()
  );

  if (!account || !comparePassword(password, account.password)) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  let userObj;
  if (account.role === 'student') {
    const student = db.students.find((s) => s.id === account.studentId) || db.students[0];
    userObj = { ...student, role: 'student' };
  } else {
    const admin = db.admins.find((a) => a.id === account.adminId) || db.admins[0];
    userObj = {
      id: admin?.id,
      name: admin?.name || 'Placement Officer',
      email: admin?.email || 'placements@jeppiaaruniversity.ac.in',
      designation: admin?.designation || 'Placement Officer',
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
