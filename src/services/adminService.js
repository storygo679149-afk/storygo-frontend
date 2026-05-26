import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 120000,
  withCredentials: true,
});

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (userId, is_active) => api.put(`/admin/users/${userId}/status`, { is_active }),
  getSeries: () => api.get('/admin/series'),
  updateSeriesStatus: (seriesId, is_active) => api.put(`/admin/series/${seriesId}/status`, { is_active }),
  getEpisodes: () => api.get('/admin/episodes'),
  getPayments: () => api.get('/admin/payments'),
  getSubscriptions: () => api.get('/admin/subscriptions'),
  getDatabaseUsers: () => api.get('/admin/database/users'),
};