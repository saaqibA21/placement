export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_HOST_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// Helper for generic JSON API calls
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || `HTTP Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (err) {
    console.error(`API Request error [${endpoint}]:`, err);
    throw err;
  }
}

// Special helper for multipart FormData (e.g. file uploads)
async function requestMultipart(endpoint, formData, method = 'POST') {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method,
      body: formData, // fetch will set multipart/form-data with correct boundary
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || `HTTP Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (err) {
    console.error(`Multipart Request error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Jobs / Drives
  getJobs: () => request('/jobs'),
  createJob: (jobData) =>
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),
  updateJob: (id, jobData) =>
    request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    }),
  deleteJob: (id) =>
    request(`/jobs/${id}`, {
      method: 'DELETE',
    }),

  // Applications
  getApplications: () => request('/applications'),
  submitApplication: (formData) => requestMultipart('/applications/apply', formData, 'POST'),
  updateApplicationStatus: (id, status, notes = '') =>
    request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  // Notices / Circulars
  getNotices: () => request('/notices'),
  createNotice: (noticeData) =>
    request('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    }),
  deleteNotice: (id) =>
    request(`/notices/${id}`, {
      method: 'DELETE',
    }),

  // Students
  getStudents: () => request('/students'),
  toggleFreeze: (id, isFrozen) =>
    request(`/students/${id}/freeze`, {
      method: 'PATCH',
      body: JSON.stringify({ isFrozen }),
    }),

  // Companies
  getCompanies: () => request('/companies'),
  createCompany: (companyData) =>
    request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    }),
  updateCompany: (id, companyData) =>
    request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    }),

  // Tracker
  getTracker: () => request('/tracker'),
  updateTracker: (trackerData) =>
    request('/tracker', {
      method: 'PUT',
      body: JSON.stringify(trackerData),
    }),

  // Surveys
  getSurveys: () => request('/surveys'),
  submitSurvey: (id, responseData) =>
    request(`/surveys/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    }),

  // Requests
  getRequests: () => request('/requests'),
  createRequest: (requestData) =>
    request('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    }),

  // Calendar
  getCalendarEvents: () => request('/calendar'),
};

export default api;
