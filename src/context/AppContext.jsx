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

// ─── Rock-Solid LocalStorage Persistence Helpers ──────────────────────────────
const getStorageItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    try {
      const parsed = JSON.parse(item);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch {
      // Handles unquoted raw strings like "student" or "admin"
      return item;
    }
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

const setStorageItem = (key, val) => {
  try {
    if (val === null || val === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ── Auth (rehydrated instantly from localStorage on refresh) ─────────────────
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
  const [resumes, setResumes] = useState(() => getStorageItem('jeppiaar_resumes', []));
  const [participation, setParticipation] = useState([]);

  // Sync to localStorage safely
  useEffect(() => { if (user) setStorageItem('jeppiaar_user', user); }, [user]);
  useEffect(() => { if (role) setStorageItem('jeppiaar_role', role); }, [role]);
  useEffect(() => { setStorageItem('jeppiaar_jobs', jobs); }, [jobs]);
  useEffect(() => { setStorageItem('jeppiaar_notices', notices); }, [notices]);
  useEffect(() => { setStorageItem('jeppiaar_students', students); }, [students]);
  useEffect(() => { setStorageItem('jeppiaar_companies', companies); }, [companies]);
  useEffect(() => { setStorageItem('jeppiaar_applications', applications); }, [applications]);
  useEffect(() => { setStorageItem('jeppiaar_tracker', trackerData); }, [trackerData]);
  useEffect(() => { setStorageItem('jeppiaar_surveys', surveys); }, [surveys]);
  useEffect(() => { setStorageItem('jeppiaar_requests', requests); }, [requests]);
  useEffect(() => { setStorageItem('jeppiaar_calendar', calendarEvents); }, [calendarEvents]);
  useEffect(() => { setStorageItem('jeppiaar_resumes', resumes); }, [resumes]);

  // ── Resume Library (fetched per-student once logged in) ─────────────────────
  const refreshResumes = useCallback(async (studentId) => {
    if (!studentId) return;
    try {
      const res = await api.getResumes(studentId);
      if (res?.data) setResumes(res.data);
    } catch (err) {
      console.warn('Failed to load resume library:', err);
    }
  }, []);

  useEffect(() => {
    if (role === 'student' && user?.id) refreshResumes(user.id);
  }, [role, user?.id, refreshResumes]);

  const addResume = async (file, label) => {
    if (!user?.id) return;
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('studentId', user.id);
    formData.append('label', label || file.name);
    try {
      const res = await api.uploadResume(formData);
      if (res?.data) {
        setResumes((prev) => [res.data, ...prev]);
        return res.data;
      }
    } catch (err) {
      console.error('Failed to upload resume:', err);
      throw err;
    }
  };

  const removeResume = async (id) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
    try {
      await api.deleteResume(id);
    } catch (err) {
      console.error(`Failed to delete resume ${id}:`, err);
    }
  };

  // ── Round Tracker. Students get it scoped to themselves (tracker entries
  // carry no auth of their own, so an unscoped fetch would return every
  // student's interview rounds mixed together). Admins fetch everything
  // unscoped — they manage scheduling/attendance across all candidates. ────
  const refreshTracker = useCallback(async (studentId) => {
    try {
      const res = await api.getTracker(studentId);
      if (res?.data) setTrackerData(res.data);
    } catch (err) {
      console.warn('Failed to load round tracker:', err);
    }
  }, []);

  useEffect(() => {
    if (role === 'student' && user?.id) refreshTracker(user.id);
    else if (role === 'admin') refreshTracker();
  }, [role, user?.id, refreshTracker]);

  // ── Participation: round confirmation RSVP + venue attendance ──────────────
  const refreshParticipation = useCallback(async (studentId) => {
    if (!studentId) return;
    try {
      const res = await api.getUpcomingParticipation(studentId);
      if (res?.data) setParticipation(res.data);
    } catch (err) {
      console.warn('Failed to load participation schedule:', err);
    }
  }, []);

  useEffect(() => {
    if (role === 'student' && user?.id) refreshParticipation(user.id);
  }, [role, user?.id, refreshParticipation]);

  // Admin schedules a candidate's current round with a date/time + venue,
  // and gets back a fresh venue check-in code for it.
  const scheduleRound = async (applicationId, scheduledAt, venue) => {
    try {
      const res = await api.scheduleRound(applicationId, scheduledAt, venue);
      if (role === 'admin') refreshTracker(); // pick up the new schedule/QR code in the admin's own view
      return res?.data;
    } catch (err) {
      console.error(`Failed to schedule round for application ${applicationId}:`, err);
      throw err;
    }
  };

  // Student confirms/declines a scheduled round; refreshes both their
  // tracker and participation views since the round lives in both.
  const confirmRound = async (applicationId, response) => {
    try {
      const res = await api.confirmRound(applicationId, response);
      if (user?.id) {
        refreshParticipation(user.id);
        refreshTracker(user.id);
      }
      return res?.data;
    } catch (err) {
      console.error(`Failed to record RSVP for application ${applicationId}:`, err);
      throw err;
    }
  };

  // Student self-checks-in with the venue code (typed, or arrived at by
  // scanning the admin's displayed QR).
  const checkIn = async (code) => {
    if (!user?.id) return;
    try {
      const res = await api.checkIn(user.id, code);
      refreshParticipation(user.id);
      refreshTracker(user.id);
      return res?.data;
    } catch (err) {
      console.error('Failed to check in:', err);
      throw err;
    }
  };

  // Admin manual attendance fallback (no scanner at the venue).
  const markAttendance = async (applicationId, attendance) => {
    try {
      const res = await api.markAttendance(applicationId, attendance);
      if (role === 'admin') refreshTracker();
      return res?.data;
    } catch (err) {
      console.error(`Failed to mark attendance for application ${applicationId}:`, err);
      throw err;
    }
  };

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
        surveysRes,
        requestsRes,
        calendarRes,
      ] = await Promise.allSettled([
        api.getJobs(),
        api.getNotices(),
        api.getStudents(),
        api.getCompanies(),
        api.getApplications(),
        api.getSurveys(),
        api.getRequests(),
        api.getCalendarEvents(),
      ]);
      // Tracker data is deliberately NOT fetched here — it must be scoped to
      // a specific student (see refreshTracker above), otherwise every
      // student's interview rounds would be fetched unscoped.

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data) setJobs(jobsRes.value.data);
      if (noticesRes.status === 'fulfilled' && noticesRes.value?.data) setNotices(noticesRes.value.data);
      if (studentsRes.status === 'fulfilled' && studentsRes.value?.data) setStudents(studentsRes.value.data);
      if (companiesRes.status === 'fulfilled' && companiesRes.value?.data) setCompanies(companiesRes.value.data);
      if (appsRes.status === 'fulfilled' && appsRes.value?.data) setApplications(appsRes.value.data);
      if (surveysRes.status === 'fulfilled' && surveysRes.value?.data) setSurveys(surveysRes.value.data);
      if (requestsRes.status === 'fulfilled' && requestsRes.value?.data) setRequests(requestsRes.value.data);
      if (calendarRes.status === 'fulfilled' && calendarRes.value?.data) setCalendarEvents(calendarRes.value.data);
    } catch (err) {
      console.warn('Backend sync fallback to cached data:', err);
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
        setStorageItem('jeppiaar_role', response.user.role);
        setStorageItem('jeppiaar_user', response.user);
        return true;
      }
    } catch (err) {
      console.warn('Backend auth call failed, checking local credentials:', err);
    }

    // Local fallback for offline/direct access (kept in sync with server/database.js seed accounts)
    const ACCOUNTS = [
      { username: 'saaqib', password: 'student123', role: 'student', studentId: 1 },
      { username: 'priya',  password: 'student123', role: 'student', studentId: 2 },
      { username: 'sneha',  password: 'student123', role: 'student', studentId: 4 },
      { username: 'ananya', password: 'student123', role: 'student', studentId: 8 },
      { username: 'admin',      password: 'admin123',     role: 'admin', adminId: 1, name: 'Placement Officer', email: 'placements@jeppiaaruniversity.ac.in', designation: 'Chief Placement Officer' },
      { username: 'k.karthick', password: 'karthick@123', role: 'admin', adminId: 2, name: 'Mr. K. Karthick', email: 'k.karthick@jeppiaaruniversity.ac.in', designation: 'Assistant Placement Officer' },
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
    let activeUser;
    if (account.role === 'student') {
      activeUser = students.find((s) => s.id === account.studentId) || students[0];
    } else {
      activeUser = { id: account.adminId, name: account.name, email: account.email, designation: account.designation, role: 'admin' };
    }
    setUser(activeUser);
    setStorageItem('jeppiaar_role', account.role);
    setStorageItem('jeppiaar_user', activeUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setLoginError('');
    try {
      localStorage.removeItem('jeppiaar_user');
      localStorage.removeItem('jeppiaar_role');
    } catch (e) {
      console.error(e);
    }
  };

  // ── Job Actions (Admin → Students see instantly across backend) ────────────
  const addJob = async (job) => {
    const tempId = Date.now();
    const actorId = role === 'admin' ? user?.id : undefined;
    const actorName = role === 'admin' ? user?.name : undefined;
    const newJobPayload = {
      ...job,
      id: tempId,
      status: 'open',
      jobPosted: new Date().toISOString().split('T')[0],
      eligible: true,
      applied: false,
      batch: null,
      createdBy: actorId, createdByName: actorName, updatedBy: actorId, updatedByName: actorName,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };

    setJobs((prev) => [newJobPayload, ...prev]);

    try {
      const res = await api.createJob({ ...job, actorId });
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
    const actorId = role === 'admin' ? user?.id : undefined;
    const actorName = role === 'admin' ? user?.name : undefined;
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates, updatedBy: actorId, updatedByName: actorName, updatedAt: new Date().toISOString() } : j)));
    try {
      await api.updateJob(id, { ...updates, actorId });
    } catch (err) {
      console.error(`Failed to update job ${id} on backend:`, err);
    }
  };

  const duplicateJob = async (id) => {
    const source = jobs.find((j) => j.id === id);
    if (!source) return;
    const actorId = role === 'admin' ? user?.id : undefined;
    try {
      const res = await api.duplicateJob(id, actorId);
      if (res?.data) {
        setJobs((prev) => [res.data, ...prev]);
        return res.data;
      }
    } catch (err) {
      console.error(`Failed to duplicate job ${id}:`, err);
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
  const applyJob = async (jobId, customResume = null, answers = [], resumeId = null) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j)));

    const activeStudent = user || students[0];
    const selectedSavedResume = resumeId ? resumes.find((r) => r.id === resumeId) : null;
    const resumeFileName = customResume?.name || selectedSavedResume?.fileName || (activeStudent?.name ? `Resume_${activeStudent.name.replace(/\s+/g, '_')}.pdf` : 'Candidate_Resume.pdf');
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
      round: `Round 1: ${(job.pipeline?.[0]?.name) || 'Screening'}`,
      stageIndex: 0,
      status: 'pending',
      resumeName: resumeFileName,
      resumeUrl: customResume?.url || selectedSavedResume?.url || null,
      resumeId: resumeId || null,
      atsScore: null,
      atsReport: null,
      answers,
    };

    setApplications((prev) => [localApp, ...prev]);

    const pipeline = (job.pipeline && job.pipeline.length > 0) ? job.pipeline : [
      { name: 'Application & Resume Screening' },
      { name: 'Online Assessment / Aptitude' },
      { name: 'Technical Interview Round' },
      { name: 'HR & Final Offer Rollout' },
    ];
    const newTrackerEntry = {
      id: Date.now(),
      applicationId: localApp.id,
      studentId: activeStudent.id || 1,
      company: job.company,
      initial: job.company.charAt(0).toUpperCase(),
      color: 'bg-emerald-700',
      jobType: job.jobType || 'FTE',
      date: `Applied ${appliedDate}`,
      rounds: pipeline.map((stage, i) => ({
        name: stage.name,
        status: i === 0 ? 'pending' : 'upcoming',
        date: i === 0 ? appliedDate : null,
      })),
    };
    setTrackerData((prev) => [newTrackerEntry, ...prev]);

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
      formData.append('answers', JSON.stringify(answers));
      if (resumeId) formData.append('resumeId', resumeId);

      if (customResume?.file) {
        formData.append('resume', customResume.file);
      }

      const res = await api.submitApplication(formData);
      if (res && res.data) {
        setApplications((prev) => prev.map((a) => (a.id === localApp.id ? res.data : a)));
        if (customResume?.file) refreshResumes(activeStudent.id); // pick up the newly saved resume
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
        const job = jobs.find((j) => j.id === a.jobId);
        const pipeline = job?.pipeline || [];
        let stageIndex = a.stageIndex ?? 0;
        let round = a.round;
        if (status === 'shortlisted') {
          stageIndex = Math.min(stageIndex + 1, Math.max(pipeline.length - 1, 0));
          round = pipeline[stageIndex] ? `Round ${stageIndex + 1}: ${pipeline[stageIndex].name}` : a.round;
        } else if (status === 'rejected') {
          round = pipeline[stageIndex] ? `Rejected at Round ${stageIndex + 1}: ${pipeline[stageIndex].name}` : 'Application Rejected';
        }
        return { ...a, status, stageIndex, round };
      })
    );
    // Note: this runs in the calling admin's session, which has no tracker
    // data of its own to refresh here — the backend has already synced the
    // affected student's tracker entry, and that student's own session picks
    // it up via refreshTracker on their next visit.
    try {
      await api.updateApplicationStatus(id, status);
    } catch (err) {
      console.error(`Failed to update application status ${id}:`, err);
    }
  };

  // Moves a candidate to the next stage of the job's actual hiring pipeline
  // (or marks them fully selected if they were already at the final stage),
  // and keeps the student's Tracker view in sync with the decision.
  const advanceApplication = async (id) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const job = jobs.find((j) => j.id === a.jobId);
        const pipeline = job?.pipeline || [];
        const lastIndex = Math.max(pipeline.length - 1, 0);
        let stageIndex = a.stageIndex ?? 0;
        let status = 'pending';
        if (stageIndex >= lastIndex) {
          status = 'shortlisted';
        } else {
          stageIndex += 1;
        }
        const round = pipeline[stageIndex] ? `Round ${stageIndex + 1}: ${pipeline[stageIndex].name}` : a.round;
        return { ...a, status, stageIndex, round };
      })
    );
    try {
      const res = await api.advanceApplication(id);
      return res?.data;
    } catch (err) {
      console.error(`Failed to advance application ${id}:`, err);
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
        jobs, notices, students, companies, applications, trackerData, surveys, requests, calendarEvents, resumes, participation, adminStats,
        // Setters
        setTrackerData, setSurveys, setRequests,
        // Actions
        addJob, updateJob, deleteJob, duplicateJob, applyJob,
        addResume, removeResume, refreshResumes, refreshTracker,
        scheduleRound, confirmRound, checkIn, markAttendance, refreshParticipation,
        addNotice, updateNotice, deleteNotice,
        updateApplicationStatus, advanceApplication,
        toggleStudentFreeze,
        addCompany, updateCompany, deleteCompany,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
