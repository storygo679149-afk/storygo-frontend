import axios from 'axios';

// ---------- PERMANENT BASE URL DETECTION ----------
const getBaseURL = () => {
  // 1. Environment variable (set in Vercel / .env)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Localhost development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }

  // 3. Production – hardcoded fallback (should be overridden by env var)
  return 'https://storygo-backend-jabl.onrender.com/api';
};

const baseURL = getBaseURL();
console.log('🔌 API Base URL:', baseURL);

// Create axios instance
const api = axios.create({
  baseURL,
  timeout: 120000,
  withCredentials: true,
});

// ---------- Request Interceptor (adds auth token) ----------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData (remove Content-Type so browser sets it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Response Interceptor (global error handling) ----------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      console.log('Request cancelled:', error.message);
      return Promise.reject(error);
    }

    if (!error.response) {
      console.error('🌐 Network error: No response received. Check your connection or backend URL.');
      return Promise.reject(new Error('Network error – unable to reach the server.'));
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error || 'Request failed';

    switch (status) {
      case 400:
        console.error(`Bad Request (400): ${message}`);
        break;
      case 401:
        // Unauthorized – clear session and redirect to login
        console.warn('Unauthorized (401) – clearing session and redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        break;
      case 403:
        console.error(`Forbidden (403): ${message}`);
        break;
      case 404:
        console.error(`Not Found (404): ${message}`);
        break;
      case 422:
        console.error(`Validation Error (422):`, data.errors || message);
        break;
      case 429:
        console.error(`Rate Limit (429): ${message}`);
        break;
      case 500:
        console.error(`Server Error (500): ${message}`);
        break;
      default:
        console.error(`Error ${status}: ${message}`);
    }

    return Promise.reject(error);
  }
);

// ---------- API Service Methods ----------
const apiService = {
  // Standard HTTP methods
  get: (url, params = {}, config = {}) => api.get(url, { params, ...config }),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

  // File upload with progress
  upload: (url, formData, onProgress) => {
    return api.post(url, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  // Cancel token helper
  createCancelToken: () => axios.CancelToken.source(),
};

export default apiService;
