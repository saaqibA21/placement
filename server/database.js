import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'resumes');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial Seed Data
const SEED_DATA = {
  accounts: [
    { username: 'saaqib',  password: 'student123', role: 'student', studentId: 1 },
    { username: 'priya',   password: 'student123', role: 'student', studentId: 2 },
    { username: 'sneha',   password: 'student123', role: 'student', studentId: 4 },
    { username: 'ananya',  password: 'student123', role: 'student', studentId: 8 },
    { username: 'admin',   password: 'admin123',   role: 'admin'                 },
  ],
  students: [
    { id: 1, name: 'Saaqib Ahmed',   rollNo: '21CS101', branch: 'CS-AI&ML', cgpa: 8.9, applied: 5, offers: 1, status: 'active', email: 'saaqib@jeppiaaruniversity.ac.in', phone: '+91 98401 23456', degree: 'B.Tech', batch: '2027' },
    { id: 2, name: 'Priya Sharma',   rollNo: '21CS102', branch: 'CS',       cgpa: 9.2, applied: 6, offers: 2, status: 'active', email: 'priya.s@jeppiaaruniversity.ac.in', phone: '+91 98401 23457', degree: 'B.Tech', batch: '2027' },
    { id: 3, name: 'Rahul Verma',    rollNo: '21IT103', branch: 'IT',       cgpa: 7.8, applied: 3, offers: 0, status: 'active', email: 'rahul.v@jeppiaaruniversity.ac.in', phone: '+91 98401 23458', degree: 'B.Tech', batch: '2027' },
    { id: 4, name: 'Sneha Patel',    rollNo: '21EC104', branch: 'ECE',      cgpa: 8.5, applied: 4, offers: 1, status: 'active', email: 'sneha.p@jeppiaaruniversity.ac.in', phone: '+91 98401 23459', degree: 'B.Tech', batch: '2027' },
    { id: 5, name: 'Karthik Raja',   rollNo: '21EE105', branch: 'EEE',      cgpa: 7.4, applied: 2, offers: 0, status: 'frozen', email: 'karthik.r@jeppiaaruniversity.ac.in', phone: '+91 98401 23460', degree: 'B.Tech', batch: '2027' },
    { id: 6, name: 'Deepa Lakshmi',  rollNo: '21CS106', branch: 'CS',       cgpa: 9.0, applied: 5, offers: 1, status: 'active', email: 'deepa.l@jeppiaaruniversity.ac.in', phone: '+91 98401 23461', degree: 'B.Tech', batch: '2027' },
    { id: 7, name: 'Vikram Sundar',  rollNo: '21ME107', branch: 'MECH',     cgpa: 7.9, applied: 3, offers: 0, status: 'active', email: 'vikram.s@jeppiaaruniversity.ac.in', phone: '+91 98401 23462', degree: 'B.Tech', batch: '2027' },
    { id: 8, name: 'Ananya Roy',     rollNo: '21CS108', branch: 'CS-AI&ML', cgpa: 9.4, applied: 7, offers: 2, status: 'active', email: 'ananya.r@jeppiaaruniversity.ac.in', phone: '+91 98401 23463', degree: 'B.Tech', batch: '2027' },
  ],
  jobs: [
    {
      id: 1,
      company: 'Microsoft',
      role: 'Software Engineer Intern',
      salary: '16.5 LPA',
      stipend: '₹50,000 / mo',
      stipendType: 'Per Month',
      applyBefore: '2026-09-15',
      dateOfVisit: '2026-09-22',
      jobType: 'Intern',
      status: 'open',
      eligible: true,
      applied: false,
      minCGPA: 8.0,
      branches: ['CS', 'CS-AI&ML', 'IT', 'ECE'],
      description: 'Looking for enthusiastic software engineering interns with strong problem-solving skills in DSA, algorithms, and web/cloud technologies.',
      jobPosted: '2026-08-25',
    },
    {
      id: 2,
      company: 'Amazon',
      role: 'Cloud Support Associate',
      salary: '14.0 LPA',
      stipend: '₹40,000 / mo',
      stipendType: 'Per Month',
      applyBefore: '2026-09-18',
      dateOfVisit: '2026-09-25',
      jobType: 'FTE',
      status: 'open',
      eligible: true,
      applied: false,
      minCGPA: 7.5,
      branches: ['CS', 'CS-AI&ML', 'IT', 'ECE', 'EEE'],
      description: 'AWS infrastructure support, network fundamentals, troubleshooting distributed cloud systems, and customer engineering solutions.',
      jobPosted: '2026-08-26',
    },
    {
      id: 3,
      company: 'Tata Consultancy Services',
      role: 'Digital Innovator',
      salary: '7.5 LPA',
      stipend: '₹25,000 / mo',
      stipendType: 'Per Month',
      applyBefore: '2026-09-10',
      dateOfVisit: '2026-09-16',
      jobType: 'GET',
      status: 'open',
      eligible: true,
      applied: false,
      minCGPA: 6.5,
      branches: ['CS', 'CS-AI&ML', 'IT', 'ECE', 'EEE', 'MECH'],
      description: 'Entry-level engineering track in emerging technologies: cloud, full-stack enterprise development, and data engineering.',
      jobPosted: '2026-08-20',
    },
    {
      id: 4,
      company: 'Zoho Corporation',
      role: 'Member Technical Staff',
      salary: '8.4 LPA',
      stipend: '₹30,000 / mo',
      stipendType: 'Per Month',
      applyBefore: '2026-09-20',
      dateOfVisit: '2026-09-28',
      jobType: 'FTE',
      status: 'open',
      eligible: true,
      applied: false,
      minCGPA: 7.0,
      branches: ['CS', 'CS-AI&ML', 'IT', 'ECE'],
      description: 'Product-first engineering role designing high-performance SaaS applications, proprietary database engines, and web architectures.',
      jobPosted: '2026-08-27',
    },
  ],
  applications: [
    {
      id: 101,
      jobId: 1,
      studentId: 1,
      studentName: 'Saaqib Ahmed',
      rollNo: '21CS101',
      branch: 'CS-AI&ML',
      cgpa: 8.9,
      company: 'Microsoft',
      role: 'Software Engineer Intern',
      appliedOn: '28 Aug 2026',
      round: 'Round 1: Screening',
      status: 'pending',
      resumeName: 'Resume_Saaqib_Ahmed.pdf',
      resumeUrl: null,
    },
    {
      id: 102,
      jobId: 2,
      studentId: 2,
      studentName: 'Priya Sharma',
      rollNo: '21CS102',
      branch: 'CS',
      cgpa: 9.2,
      company: 'Amazon',
      role: 'Cloud Support Associate',
      appliedOn: '27 Aug 2026',
      round: 'Round 2: Online Assessment',
      status: 'shortlisted',
      resumeName: 'Resume_Priya_Sharma.pdf',
      resumeUrl: null,
    },
    {
      id: 103,
      jobId: 3,
      studentId: 4,
      studentName: 'Sneha Patel',
      rollNo: '21EC104',
      branch: 'ECE',
      cgpa: 8.5,
      company: 'Tata Consultancy Services',
      role: 'Digital Innovator',
      appliedOn: '26 Aug 2026',
      round: 'Round 3: Technical Interview',
      status: 'shortlisted',
      resumeName: 'Resume_Sneha_Patel.pdf',
      resumeUrl: null,
    },
  ],
  notices: [
    {
      id: 1,
      title: 'Microsoft 2026 Campus Drive Shortlist & Online Test Link',
      author: 'Placement Directorate',
      authorColor: 'bg-emerald-700',
      authorInitial: 'P',
      timeAgo: '2 hours ago',
      category: 'job',
      tags: ['Drive Notice', 'Microsoft', 'Important'],
      body: 'All students with CGPA >= 8.0 who registered for Microsoft Software Engineer Intern are requested to check their university email for the HackerRank assessment link. Assessment window closes on 12th Sept at 11:59 PM.',
    },
    {
      id: 2,
      title: 'Mandatory Resume Format & Profile Verification Deadline',
      author: 'Placement Cell',
      authorColor: 'bg-amber-700',
      authorInitial: 'J',
      timeAgo: '1 day ago',
      category: 'reminder',
      tags: ['Compliance', 'Resume'],
      body: 'Students must verify that their uploaded resume matches the single-page standard format. Ensure your CGPA and contact info are accurate before applying to upcoming tier-1 drives.',
    },
    {
      id: 3,
      title: 'Pre-Placement Talk (PPT) by Amazon Leadership Team',
      author: 'Corporate Relations',
      authorColor: 'bg-blue-700',
      authorInitial: 'A',
      timeAgo: '3 days ago',
      category: 'announcement',
      tags: ['Amazon', 'PPT', 'Seminar'],
      body: 'Amazon recruitment team will conduct an in-person Pre-Placement Talk on 15th September at the Main Auditorium at 2:00 PM. Formal college attire is mandatory.',
    },
  ],
  companies: [
    { id: 1, name: 'Microsoft', logo: 'M', color: 'bg-emerald-700', type: 'Product', roles: ['SDE Intern', 'Full Stack'], visitDate: '2026-09-22', status: 'open' },
    { id: 2, name: 'Amazon', logo: 'A', color: 'bg-amber-700', type: 'Product', roles: ['Cloud Support', 'SDE-1'], visitDate: '2026-09-25', status: 'open' },
    { id: 3, name: 'Zoho', logo: 'Z', color: 'bg-red-700', type: 'Product', roles: ['MTS', 'Technical Consultant'], visitDate: '2026-09-28', status: 'open' },
    { id: 4, name: 'TCS', logo: 'T', color: 'bg-blue-700', type: 'Service', roles: ['Digital Innovator', 'Ninja'], visitDate: '2026-09-16', status: 'open' },
    { id: 5, name: 'Cognizant', logo: 'C', color: 'bg-indigo-700', type: 'Service', roles: ['GenC Next', 'Programmer Analyst'], visitDate: '2026-10-05', status: 'closed' },
  ],
  trackerData: [
    {
      id: 1,
      company: 'Microsoft',
      initial: 'M',
      color: 'bg-emerald-700',
      jobType: 'Intern',
      date: 'Applied 28 Aug 2026',
      rounds: [
        { name: 'Application & Resume Screening', status: 'cleared', date: '29 Aug' },
        { name: 'Online Assessment / Aptitude', status: 'pending', date: '02 Sep' },
        { name: 'Technical Interview Round', status: 'upcoming', date: null },
        { name: 'HR & Final Offer Rollout', status: 'upcoming', date: null },
      ],
    },
  ],
  surveys: [
    { id: 1, title: 'Technical Interview Readiness & Mock Test Feedback', questions: 5, deadline: '2026-09-15', status: 'pending' },
    { id: 2, title: 'Placement Policy Acknowledgment & Consent Form', questions: 3, deadline: '2026-09-30', status: 'completed' },
  ],
  requests: [
    { id: 1, type: 'Profile Update', description: 'Updated semester 6 aggregate CGPA from 8.7 to 8.9 after revaluation.', status: 'approved', date: '2026-08-25' },
    { id: 2, type: 'Document Request', description: 'Requesting verified academic bona fide certificate for dream tier application.', status: 'pending', date: '2026-08-28' },
  ],
  calendarEvents: [
    { id: 1, title: 'TCS Campus Drive PPT', date: '2026-09-16', type: 'visit' },
    { id: 2, title: 'Amazon Application Closes', date: '2026-09-18', type: 'deadline' },
    { id: 3, title: 'Microsoft Selection Day', date: '2026-09-22', type: 'visit' },
  ],
};

// Read Database
export const readDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
      return SEED_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Database read error:', err);
    return SEED_DATA;
  }
};

// Write Database
export const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Database write error:', err);
    return false;
  }
};
