import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import noticeRoutes from './routes/notices.js';
import studentRoutes from './routes/students.js';
import companyRoutes from './routes/companies.js';
import trackerRoutes from './routes/tracker.js';
import surveyRoutes from './routes/surveys.js';
import requestRoutes from './routes/requests.js';
import calendarRoutes from './routes/calendar.js';

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder for resumes and documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/calendar', calendarRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Jeppiaar University Placement Portal API', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
