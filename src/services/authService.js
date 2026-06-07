// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  // Register a new user
  register: (userData) => api.post('/auth/register', userData),

  // Verify OTP code
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),

  // Resend OTP code
  resendOTP: (email) => api.post('/auth/resend-otp', { email }),

  // Login user
  login: (email, password) => api.post('/auth/login', { email, password }),

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return api.post('/auth/logout').catch(() => {});
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
