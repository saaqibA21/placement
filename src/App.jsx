import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import Tracker from './pages/Tracker';
import Notice from './pages/Notice';
import Companies from './pages/Companies';
import Chat from './pages/Chat';
import Survey from './pages/Survey';
import Requests from './pages/Requests';
import Calendar from './pages/Calendar';
import Policy from './pages/Policy';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminResumes from './pages/admin/AdminResumes';
import AdminStudents from './pages/admin/AdminStudents';
import AdminNotices from './pages/admin/AdminNotices';
import AdminCompanies from './pages/admin/AdminCompanies';

function AppRoutes() {
  const { role } = useApp();

  if (!role) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (role === 'student') {
    return (
      <Routes>
        <Route element={<StudentLayout />}>
          <Route path="/student/home" element={<Home />} />
          <Route path="/student/jobs" element={<Jobs />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/tracker" element={<Tracker />} />
          <Route path="/student/notice" element={<Notice />} />
          <Route path="/student/companies" element={<Companies />} />
          <Route path="/student/chat" element={<Chat />} />
          <Route path="/student/survey" element={<Survey />} />
          <Route path="/student/requests" element={<Requests />} />
          <Route path="/student/calendar" element={<Calendar />} />
          <Route path="/student/policy" element={<Policy />} />
        </Route>
        <Route path="*" element={<Navigate to="/student/home" replace />} />
      </Routes>
    );
  }

  // Admin routes
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/resumes" element={<AdminResumes />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/notices" element={<AdminNotices />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
