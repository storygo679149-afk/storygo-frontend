import api from './api';

const seriesService = {
  // Get all series with pagination and filters
  getAllSeries: (params = {}) => {
    return api.get('/series', params);
  },

  // Get series by ID
  getSeriesById: (id) => {
    return api.get(`/series/${id}`);
  },

  // Get episodes for a series
  getSeriesEpisodes: (seriesId, params = {}) => {
    return api.get(`/series/${seriesId}/episodes`, params);
  },

  // Create new series (creator)
  createSeries: (seriesData) => {
    if (seriesData instanceof FormData) {
      return api.post('/series', seriesData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/series', seriesData);
  },

  // Update series (creator)
  updateSeries: (id, seriesData) => {
    return api.put(`/series/${id}`, seriesData);
  },

  // Delete series (creator)
  deleteSeries: (id) => {
    return api.delete(`/series/${id}`);
  },

  // Get my series (creator)
  getMySeries: (params = {}) => {
    return api.get('/series', { ...params, my_series: true });
  },

  // Search series
  search: (query, params = {}) => {
    return api.get('/search', { q: query, ...params });
  },

  // Search my series (creator)
  searchMySeries: (query) => {
    return api.get('/series', { search: query, my_series: true });
  },

  // Get search suggestions
  getSuggestions: (query, limit = 10) => {
    return api.get('/search/suggestions', { q: query, limit });
  },

  // Get popular searches
  getPopularSearches: () => {
    return api.get('/search/popular');
  },

  // Get trending series
  getTrending: (params = {}) => {
    return api.get('/trending', params);
  },

  // Get daily trending
  getDailyTrending: () => {
    return api.get('/trending/daily');
  },

  // Get weekly trending
  getWeeklyTrending: () => {
    return api.get('/trending/weekly');
  },

  // Get all categories
  getCategories: () => {
    return api.get('/categories');
  },

  // Get category by slug
  getCategoryBySlug: (slug) => {
    return api.get(`/categories/${slug}`);
  },

  // Get series by category
  getCategorySeries: (slug, params = {}) => {
    return api.get(`/categories/${slug}/series`, params);
  },

  // Toggle like on series
  toggleLike: (seriesId) => {
    return api.post('/activity/log', {
      activity_type: 'like',
      series_id: seriesId
    });
  },

  // Toggle bookmark on series
  toggleBookmark: (seriesId) => {
    return api.post('/activity/log', {
      activity_type: 'bookmark',
      series_id: seriesId
    });
  },

  // Follow creator
  followCreator: (creatorId) => {
    return api.post(`/users/follow/${creatorId}`);
  },

  // Unfollow creator
  unfollowCreator: (creatorId) => {
    return api.delete(`/users/unfollow/${creatorId}`);
  },

  // Upload series thumbnail
  uploadThumbnail: (seriesId, file, onProgress) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return api.upload(`/series/${seriesId}`, formData, onProgress);
  },

  // Create category
  createCategory: (categoryData) => {
    return api.post('/categories', categoryData);
  },

  // Rate a series
  rateSeries: (seriesId, rating) => {
    return api.post(`/series/${seriesId}/rate`, { rating });
  },

  // Get the weekly featured series (editorial spotlight)
  getFeaturedSeries: () => {
    return api.get('/series/featured');
  },
};

export default seriesService;