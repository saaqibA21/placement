import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
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

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ── Auth (rehydrated from localStorage so refresh never logs out) ────────────
  const [user, setUser] = useState(() => getStorageItem('jeppiaar_user', null));
  const [role, setRole] = useState(() => getStorageItem('jeppiaar_role', null));
  const [loginError, setLoginError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ── Shared Global Data (synced from backend API + persisted in localStorage) ───
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

  // ── Load live data from backend on startup ──────────────────────────────────
  const refreshAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [
        jobsRes,
        noticesRes,
        studentsRes,
        companiesRes,
        appsRes,
        trackerRes,
        surveysRes,
        requestsRes,
        calendarRes,
      ] = await Promise.allSettled([
        api.getJobs(),
        api.getNotices(),
        api.getStudents(),
        api.getCompanies(),
        api.getApplications(),
        api.getTracker(),
        api.getSurveys(),
        api.getRequests(),
        api.getCalendarEvents(),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data) setJobs(jobsRes.value.data);
      if (noticesRes.status === 'fulfilled' && noticesRes.value?.data) setNotices(noticesRes.value.data);
      if (studentsRes.status === 'fulfilled' && studentsRes.value?.data) setStudents(studentsRes.value.data);
      if (companiesRes.status === 'fulfilled' && companiesRes.value?.data) setCompanies(companiesRes.value.data);
      if (appsRes.status === 'fulfilled' && appsRes.value?.data) setApplications(appsRes.value.data);
      if (trackerRes.status === 'fulfilled' && trackerRes.value?.data) setTrackerData(trackerRes.value.data);
      if (surveysRes.status === 'fulfilled' && surveysRes.value?.data) setSurveys(surveysRes.value.data);
      if (requestsRes.status === 'fulfilled' && requestsRes.value?.data) setRequests(requestsRes.value.data);
      if (calendarRes.status === 'fulfilled' && calendarRes.value?.data) setCalendarEvents(calendarRes.value.data);
    } catch (err) {
      console.warn('Backend sync failed, using persistent client cache:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

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
  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);
      if (response && response.success) {
        setLoginError('');
        setRole(response.user.role);
        setUser(response.user);
        return true;
      }
    } catch (err) {
      console.warn('Backend auth call failed, checking local credentials:', err);
    }

    // Local fallback for offline/direct access
    const ACCOUNTS = [
      { username: 'saaqib', password: 'student123', role: 'student', studentId: 1 },
      { username: 'priya',  password: 'student123', role: 'student', studentId: 2 },
      { username: 'sneha',  password: 'student123', role: 'student', studentId: 4 },
      { username: 'ananya', password: 'student123', role: 'student', studentId: 8 },
      { username: 'admin',  password: 'admin123',   role: 'admin' },
    ];

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

  // ── Job Actions (Admin → Students see instantly across backend) ────────────
  const addJob = async (job) => {
    const tempId = Date.now();
    const newJobPayload = {
      ...job,
      id: tempId,
      status: 'open',
      jobPosted: new Date().toISOString().split('T')[0],
      eligible: true,
      applied: false,
      batch: null,
    };

    // Optimistic local state update
    setJobs((prev) => [newJobPayload, ...prev]);

    try {
      const res = await api.createJob(job);
      if (res && res.data) {
        setJobs((prev) => prev.map((j) => (j.id === tempId ? res.data : j)));
        return res.data;
      }
    } catch (err) {
      console.error('Failed to create job on backend:', err);
    }
    return newJobPayload;
  };

  const updateJob = async (id, updates) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    try {
      await api.updateJob(id, updates);
    } catch (err) {
      console.error(`Failed to update job ${id} on backend:`, err);
    }
  };

  const deleteJob = async (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setApplications((prev) => prev.filter((a) => a.jobId !== id));
    try {
      await api.deleteJob(id);
    } catch (err) {
      console.error(`Failed to delete job ${id} on backend:`, err);
    }
  };

  // ── Student Apply Flow (Student applies with resume → Admin receives live) ──
  const applyJob = async (jobId, customResume = null) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    // 1. Mark job as applied in jobs list
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j)));

    // 2. Prepare candidate details
    const activeStudent = user || students[0];
    const resumeFileName = customResume?.name || (activeStudent?.name ? `Resume_${activeStudent.name.replace(/\s+/g, '_')}.pdf` : 'Candidate_Resume.pdf');
    const appliedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const localApp = {
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

    setApplications((prev) => [localApp, ...prev]);

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

    // 4. Send to Backend API with FormData
    try {
      const formData = new FormData();
      formData.append('jobId', job.id);
      formData.append('studentId', activeStudent.id || 1);
      formData.append('studentName', activeStudent.name || 'Candidate');
      formData.append('rollNo', activeStudent.rollNo || '21CS001');
      formData.append('branch', activeStudent.branch || 'Computer Science');
      formData.append('cgpa', activeStudent.cgpa || 8.5);
      formData.append('company', job.company);
      formData.append('role', job.role);
      formData.append('resumeName', resumeFileName);

      if (customResume?.file) {
        formData.append('resume', customResume.file);
      }

      const res = await api.submitApplication(formData);
      if (res && res.data) {
        // Update local application with server response (e.g. static uploaded resume URL)
        setApplications((prev) => prev.map((a) => (a.id === localApp.id ? res.data : a)));
        return res.data;
      }
    } catch (err) {
      console.error('Failed to submit application to backend:', err);
    }

    return localApp;
  };

  // ── Notice Actions ────────────────────────────────────────────────────────
  const addNotice = async (notice) => {
    const tempId = Date.now();
    const newNotice = { ...notice, id: tempId, timeAgo: 'Just now' };
    setNotices((prev) => [newNotice, ...prev]);
    try {
      const res = await api.createNotice(notice);
      if (res?.data) {
        setNotices((prev) => prev.map((n) => (n.id === tempId ? res.data : n)));
      }
    } catch (err) {
      console.error('Failed to post notice to backend:', err);
    }
  };

  const updateNotice = (id, updates) =>
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));

  const deleteNotice = async (id) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.deleteNotice(id);
    } catch (err) {
      console.error(`Failed to delete notice ${id}:`, err);
    }
  };

  // ── Application Actions (Admin updates → status syncs live) ────────────────
  const updateApplicationStatus = async (id, status) => {
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
    try {
      await api.updateApplicationStatus(id, status);
    } catch (err) {
      console.error(`Failed to update application status ${id}:`, err);
    }
  };

  // ── Student Actions ────────────────────────────────────────────────────────
  const toggleStudentFreeze = async (id) => {
    const target = students.find((s) => s.id === id);
    const newFreezeStatus = target?.status === 'active';
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newFreezeStatus ? 'frozen' : 'active' } : s))
    );
    try {
      await api.toggleFreeze(id, newFreezeStatus);
    } catch (err) {
      console.error(`Failed to toggle freeze for student ${id}:`, err);
    }
  };

  // ── Company Actions ────────────────────────────────────────────────────────
  const addCompany = async (company) => {
    const tempId = Date.now();
    const newComp = { ...company, id: tempId, logo: company.name.charAt(0).toUpperCase() };
    setCompanies((prev) => [...prev, newComp]);
    try {
      const res = await api.createCompany(company);
      if (res?.data) {
        setCompanies((prev) => prev.map((c) => (c.id === tempId ? res.data : c)));
      }
    } catch (err) {
      console.error('Failed to create company on backend:', err);
    }
  };

  const updateCompany = async (id, updates) => {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    try {
      await api.updateCompany(id, updates);
    } catch (err) {
      console.error(`Failed to update company ${id}:`, err);
    }
  };

  const deleteCompany = (id) =>
    setCompanies((prev) => prev.filter((c) => c.id !== id));

  return (
    <AppContext.Provider
      value={{
        // Auth
        user, role, login, logout, loginError, setLoginError, isLoadingData, refreshAllData,
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
