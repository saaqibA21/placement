import React, { createContext, useContext, useState } from 'react';
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
  adminStats as initAdminStats,
} from '../data/mockData';

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
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser]           = useState(null);
  const [role, setRole]           = useState(null);
  const [loginError, setLoginError] = useState('');

  // ── Shared Global Data (admin writes → students read instantly) ────────────
  const [jobs, setJobs]               = useState(initJobs);
  const [notices, setNotices]         = useState(initNotices);
  const [students, setStudents]       = useState(initStudents);
  const [companies, setCompanies]     = useState(initCompanies);
  const [applications, setApplications] = useState(initApplications);
  const [trackerData, setTrackerData] = useState(initTracker);
  const [surveys, setSurveys]         = useState(initSurveys);
  const [requests, setRequests]       = useState(initRequests);
  const [calendarEvents, setCalendarEvents] = useState(initCalendarEvents);

  // Derived admin stats (always computed from real data)
  const adminStats = {
    totalStudents:    students.length,
    totalJobs:        jobs.length,
    totalApplications: applications.length,
    offersExtended:   students.reduce((acc, s) => acc + s.offers, 0),
    placementRate:    Math.round((students.filter((s) => s.offers > 0).length / students.length) * 100),
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
      setUser({ name: 'Placement Admin', email: 'admin@jeppier.edu.in', role: 'admin' });
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setLoginError('');
  };

  // ── Job Actions (Admin → Students see instantly) ──────────────────────────
  const addJob = (job) =>
    setJobs((prev) => [{ ...job, id: Date.now(), status: 'open', jobPosted: new Date().toISOString().split('T')[0], eligible: true, applied: false, batch: null }, ...prev]);

  const updateJob = (id, updates) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));

  const deleteJob = (id) =>
    setJobs((prev) => prev.filter((j) => j.id !== id));

  const applyJob = (jobId) =>
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j)));

  // ── Notice Actions ────────────────────────────────────────────────────────
  const addNotice = (notice) =>
    setNotices((prev) => [{ ...notice, id: Date.now(), timeAgo: 'Just now' }, ...prev]);

  const updateNotice = (id, updates) =>
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));

  const deleteNotice = (id) =>
    setNotices((prev) => prev.filter((n) => n.id !== id));

  // ── Application Actions ────────────────────────────────────────────────────
  const updateApplicationStatus = (id, status) =>
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

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
        // Setters (for pages that need full control like Tracker)
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
