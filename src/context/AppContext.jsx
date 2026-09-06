import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  jobs as initJobs,
  notices as initNotices,
  students as initStudents,
  companies as initCompanies,
  applications as initApplications,
  trackerData as initTracker,
  surveys as initSurveys,
  requests as initRequests,
  calendarEvents as initCalendarEvents,
} from '../data/mockData';

// ─── Helpers for LocalStorage Persistence ──────────────────────────────────────
const getStorageItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
};

// ─── Credential Store ──────────────────────────────────────────────────────────
const ACCOUNTS = [
  { username: 'saaqib',  password: 'student123', role: 'student', studentId: 1 },
  { username: 'priya',   password: 'student123', role: 'student', studentId: 2 },
  { username: 'sneha',   password: 'student123', role: 'student', studentId: 4 },
  { username: 'ananya',  password: 'student123', role: 'student', studentId: 8 },
  { username: 'admin',   password: 'admin123',   role: 'admin'                 },
];

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ── Auth (rehydrated from localStorage so refresh never logs out) ────────────
  const [user, setUser] = useState(() => getStorageItem('jeppiaar_user', null));
  const [role, setRole] = useState(() => getStorageItem('jeppiaar_role', null));
  const [loginError, setLoginError] = useState('');

  // ── Shared Global Data (persisted across refresh and tab changes) ───────────
  const [jobs, setJobs] = useState(() => getStorageItem('jeppiaar_jobs', initJobs));
  const [notices, setNotices] = useState(() => getStorageItem('jeppiaar_notices', initNotices));
  const [students, setStudents] = useState(() => getStorageItem('jeppiaar_students', initStudents));
  const [companies, setCompanies] = useState(() => getStorageItem('jeppiaar_companies', initCompanies));
  const [applications, setApplications] = useState(() => getStorageItem('jeppiaar_applications', initApplications));
  const [trackerData, setTrackerData] = useState(() => getStorageItem('jeppiaar_tracker', initTracker));
  const [surveys, setSurveys] = useState(() => getStorageItem('jeppiaar_surveys', initSurveys));
  const [requests, setRequests] = useState(() => getStorageItem('jeppiaar_requests', initRequests));
  const [calendarEvents, setCalendarEvents] = useState(() => getStorageItem('jeppiaar_calendar', initCalendarEvents));

  // Sync to localStorage
  useEffect(() => { setStorageItem('jeppiaar_user', user); }, [user]);
  useEffect(() => { setStorageItem('jeppiaar_role', role); }, [role]);
  useEffect(() => { setStorageItem('jeppiaar_jobs', jobs); }, [jobs]);
  useEffect(() => { setStorageItem('jeppiaar_notices', notices); }, [notices]);
  useEffect(() => { setStorageItem('jeppiaar_students', students); }, [students]);
  useEffect(() => { setStorageItem('jeppiaar_companies', companies); }, [companies]);
  useEffect(() => { setStorageItem('jeppiaar_applications', applications); }, [applications]);
  useEffect(() => { setStorageItem('jeppiaar_tracker', trackerData); }, [trackerData]);
  useEffect(() => { setStorageItem('jeppiaar_surveys', surveys); }, [surveys]);
  useEffect(() => { setStorageItem('jeppiaar_requests', requests); }, [requests]);
  useEffect(() => { setStorageItem('jeppiaar_calendar', calendarEvents); }, [calendarEvents]);

  // Derived admin stats (always computed from real data)
  const adminStats = {
    totalStudents:    students.length,
    totalJobs:        jobs.length,
    totalApplications: applications.length,
    offersExtended:   students.reduce((acc, s) => acc + (s.offers || 0), 0),
    placementRate:    students.length > 0 ? Math.round((students.filter((s) => (s.offers || 0) > 0).length / students.length) * 100) : 0,
    activeJobs:       jobs.filter((j) => j.status === 'open').length,
  };

  // ── Auth Actions ──────────────────────────────────────────────────────────
  const login = (username, password) => {
    const account = ACCOUNTS.find(
      (a) =>
        a.username.toLowerCase() === username.toLowerCase().trim() &&
        a.password === password,
    );
    if (!account) {
      setLoginError('Invalid username or password. Please try again.');
      return false;
    }
    setLoginError('');
    setRole(account.role);
    if (account.role === 'student') {
      const student = students.find((s) => s.id === account.studentId) || students[0];
      setUser(student);
    } else {
      setUser({ name: 'Placement Officer', email: 'placements@jeppiaaruniversity.ac.in', role: 'admin' });
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setLoginError('');
    localStorage.removeItem('jeppiaar_user');
    localStorage.removeItem('jeppiaar_role');
  };

  // ── Job Actions (Admin → Students see instantly) ──────────────────────────
  const addJob = (job) => {
    const newJob = {
      ...job,
      id: Date.now(),
      status: 'open',
      jobPosted: new Date().toISOString().split('T')[0],
      eligible: true,
      applied: false,
      batch: null,
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const updateJob = (id, updates) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));

  const deleteJob = (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setApplications((prev) => prev.filter((a) => a.jobId !== id));
  };

  // ── Student Apply Flow (Student applies → Admin receives application & resume) ──
  const applyJob = (jobId, customResume = null) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    // 1. Mark job as applied in jobs list
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j)));

    // 2. Create official application record for Admin Resume Screening
    const activeStudent = user || students[0];
    const resumeFileName = customResume?.name || (activeStudent?.name ? `Resume_${activeStudent.name.replace(/\s+/g, '_')}.pdf` : 'Candidate_Resume.pdf');
    const appliedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const newApplication = {
      id: Date.now(),
      jobId: job.id,
      studentId: activeStudent.id || 1,
      studentName: activeStudent.name || 'Candidate',
      rollNo: activeStudent.rollNo || '21CS001',
      branch: activeStudent.branch || 'Computer Science',
      cgpa: activeStudent.cgpa || 8.5,
      company: job.company,
      role: job.role,
      appliedOn: appliedDate,
      round: 'Round 1: Screening',
      status: 'pending',
      resumeName: resumeFileName,
      resumeUrl: customResume?.url || null,
    };

    setApplications((prev) => [newApplication, ...prev]);

    // 3. Add to live student trackerData
    const newTrackerEntry = {
      id: Date.now(),
      company: job.company,
      initial: job.company.charAt(0).toUpperCase(),
      color: 'bg-emerald-700',
      jobType: job.jobType || 'FTE',
      date: `Applied ${appliedDate}`,
      rounds: [
        { name: 'Application & Resume Screening', status: 'pending', date: appliedDate },
        { name: 'Online Assessment / Aptitude', status: 'upcoming', date: null },
        { name: 'Technical Interview Round', status: 'upcoming', date: null },
        { name: 'HR & Final Offer Rollout', status: 'upcoming', date: null },
      ],
    };

    setTrackerData((prev) => [newTrackerEntry, ...prev]);
    return newApplication;
  };

  // ── Notice Actions ────────────────────────────────────────────────────────
  const addNotice = (notice) =>
    setNotices((prev) => [{ ...notice, id: Date.now(), timeAgo: 'Just now' }, ...prev]);

  const updateNotice = (id, updates) =>
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));

  const deleteNotice = (id) =>
    setNotices((prev) => prev.filter((n) => n.id !== id));

  // ── Application Actions (Admin updates → status syncs live) ────────────────
  const updateApplicationStatus = (id, status) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          status,
          round: status === 'shortlisted' ? 'Round 2: Online Assessment' : status === 'rejected' ? 'Application Rejected' : a.round,
        };
      })
    );
  };

  // ── Student Actions ────────────────────────────────────────────────────────
  const toggleStudentFreeze = (id) =>
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'active' ? 'frozen' : 'active' } : s))
    );

  // ── Company Actions ────────────────────────────────────────────────────────
  const addCompany = (company) =>
    setCompanies((prev) => [...prev, { ...company, id: Date.now(), logo: company.name.charAt(0).toUpperCase() }]);

  const updateCompany = (id, updates) =>
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));

  const deleteCompany = (id) =>
    setCompanies((prev) => prev.filter((c) => c.id !== id));

  return (
    <AppContext.Provider
      value={{
        // Auth
        user, role, login, logout, loginError, setLoginError,
        // Data
        jobs, notices, students, companies, applications, trackerData, surveys, requests, calendarEvents, adminStats,
        // Setters
        setTrackerData, setSurveys, setRequests,
        // Actions
        addJob, updateJob, deleteJob, applyJob,
        addNotice, updateNotice, deleteNotice,
        updateApplicationStatus,
        toggleStudentFreeze,
        addCompany, updateCompany, deleteCompany,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
