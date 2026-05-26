import api from './api';

const userService = {
  // Get user profile
  getProfile: () => {
    return api.get('/users/profile');
  },
    getCreatorAnalytics: () => api.get('/users/creator-analytics'),

  // Update user profile
  updateProfile: (profileData) => {
    return api.put('/users/profile', profileData);
  },

  // Become a creator
 becomeCreator: () => api.put('/users/become-creator'),

  // Get personal user stats
  getStats: () => {
    return api.get('/users/stats');
  },

  // Get global platform stats (no auth needed)
  getGlobalStats: () => {
    return api.get('/users/stats/global');
  },

  // Get listening history
  getListeningHistory: (params = {}) => {
    return api.get('/users/listening-history', params);
  },

  // Get bookmarks
  getBookmarks: (params = {}) => {
    return api.get('/users/bookmarks', params);
  },

  // Get liked series
  getLikedSeries: (params = {}) => {
    return api.get('/activity/recent', {
      ...params,
      activity_type: 'like'
    });
  },

  // Get following creators
  getFollowing: () => {
    return api.get('/users/following');
  },

  // Follow a creator
  followCreator: (creatorId) => {
    return api.post(`/users/follow/${creatorId}`);
  },

  // Unfollow a creator
  unfollowCreator: (creatorId) => {
    return api.delete(`/users/unfollow/${creatorId}`);
  },

  // Get user activity
  getActivity: (params = {}) => {
    return api.get('/activity/recent', params);
  },

  // Get activity stats
  getActivityStats: () => {
    return api.get('/activity/stats');
  },

  // Log user activity
  logActivity: (activityData) => {
    return api.post('/activity/log', activityData);
  },

  // Search users
  searchUsers: (query, params = {}) => {
    return api.get('/search', { q: query, type: 'users', ...params });
  },

  // Upload profile picture
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return api.upload('/users/profile/picture', formData);
  },

  // Delete account
  deleteAccount: () => {
    return api.delete('/users/profile');
  },

  // Update language preference
  updateLanguage: (language) => {
    return api.put('/users/profile', { preferred_language: language });
  },

  // Get recommended series for user
  getRecommendations: (params = {}) => {
    return api.get('/series/recommended', params);
  },
  getCreatorStats: () => api.get('/users/creator-stats'),
  // In src/services/userService.js
getBookmarkedSeries: () => {
  return api.get('/users/bookmarked-series');
},

  // ⭐ NEW: Top creators for homepage
  getTopCreators: () => {
    return api.get('/users/top-creators');
  },

    getFollowers: () => api.get('/users/followers'),
};

export default userService;