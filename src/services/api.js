import axios from 'axios';

// ---------- PERMANENT BASE URL DETECTION ----------
const getBaseURL = () => {
  // 1. If the environment variable is explicitly set (highest priority)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Running on localhost (development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }

  // 3. Production – your live backend URL (Netlify, Vercel, etc.)
  //    Replace with your actual Render backend URL
  return 'https://storygo-backend-79u9.onrender.com/api';
};

const baseURL = getBaseURL();
console.log('🔌 API Base URL:', baseURL); // optional – helps debug

const api = axios.create({
  baseURL: baseURL,
  timeout: 120000,
  withCredentials: true,
});

// Request interceptor (unchanged)
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (unchanged)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      console.log('Request cancelled:', error.message);
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || data?.error || 'Request failed';

      switch (status) {
        case 400:
          console.error(`Bad Request (400): ${message}`);
          break;
       case 401:
  break;
        case 403:
          console.error('Access forbidden:', message);
          break;
        case 404:
          console.error('Resource not found:', message);
          break;
        case 422:
          console.error('Validation error:', data.errors || message);
          break;
        case 429:
          console.error('Rate limit exceeded:', message);
          break;
        case 500:
          console.error('Server error:', message);
          break;
        default:
          console.error(`Error ${status}:`, message);
      }
    } else if (error.request) {
      console.error('Network error: No response received');
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

const apiService = {
  get: (url, params = {}, config = {}) => api.get(url, { params, ...config }),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

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

  createCancelToken: () => axios.CancelToken.source(),
};

export default apiService;
