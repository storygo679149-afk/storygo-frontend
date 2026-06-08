// src/services/userService.js
import api from './api'; // your axios instance with baseURL and interceptors

const userService = {
  // ========== Public routes ==========
  getGlobalStats: () => api.get('/users/stats/global'),
  getTopCreators: () => api.get('/users/top-creators'),

  // ========== Authenticated user routes ==========
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),

  becomeCreator: () => api.put('/users/become-creator'),

  getListeningHistory: (params = {}) => api.get('/users/listening-history', { params }),
  getBookmarks: (params = {}) => api.get('/users/bookmarks', { params }),
  getBookmarkedSeries: () => api.get('/users/bookmarked-series'),
  getFollowing: () => api.get('/users/following'),
  followCreator: (creatorId) => api.post(`/users/follow/${creatorId}`),
  unfollowCreator: (creatorId) => api.delete(`/users/unfollow/${creatorId}`),
  getUserStats: () => api.get('/users/stats'),
  getFollowers: () => api.get('/users/followers'),
  getCreatorAnalytics: () => api.get('/users/creator-analytics'),
  getCreatorStats: () => api.get('/users/creator-stats'),

  // Avatar endpoints
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  removeAvatar: () => api.delete('/users/avatar'),

  // Password change
  changePassword: (passwordData) => api.post('/users/change-password', passwordData),

  // Delete account (if you have it)
  deleteAccount: () => api.delete('/users/profile'),

  // Additional convenience methods (from your earlier code)
  getLikedSeries: (params = {}) =>
    api.get('/activity/recent', {
      params: { activity_type: 'like', ...params }
    }),
  getActivity: (params = {}) => api.get('/activity/recent', { params }),
  getActivityStats: () => api.get('/activity/stats'),
  logActivity: (activityData) => api.post('/activity/log', activityData),

  // Recommendation and search
  getRecommendations: (params = {}) => api.get('/series/recommended', { params }),
  searchUsers: (query, params = {}) =>
    api.get('/search', { params: { q: query, type: 'users', ...params } }),
  updateLanguage: (language) => api.put('/users/profile', { preferred_language: language }),
};

export default userService;
