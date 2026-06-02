import api from './api';

const episodeService = {
  getEpisodeById: async (id) => {
    const response = await api.get(`/episodes/${id}`);
    // Backend returns { status: 'success', data: { episode } }
    return response.data.data.episode;
  },

   getComments: (episodeId, params = {}) => api.get(`/episodes/${episodeId}/comments`, params),
createComment: (episodeId, data) => api.post(`/episodes/${episodeId}/comments`, data),
deleteComment: (commentId) => api.delete(`/episodes/comments/${commentId}`),
saveChapters: (episodeId, data) => api.post(`/episodes/${episodeId}/chapters`, data),
getChapters: (episodeId) => api.get(`/episodes/${episodeId}/chapters`),

  createEpisode: (episodeData) => {
    if (episodeData.audio_file) {
      const formData = new FormData();
      formData.append('audio', episodeData.audio_file);
      formData.append('series_id', episodeData.series_id);
      formData.append('title', episodeData.title);
      formData.append('episode_number', episodeData.episode_number);
      if (episodeData.description) formData.append('description', episodeData.description);
      if (episodeData.season_number) formData.append('season_number', episodeData.season_number);
      return api.post('/episodes', formData);
    }
    return api.post('/episodes', episodeData);
  },

  createEpisodeWithFile: (formData, onProgress) => {
    return api.post('/episodes', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
  },

  updateEpisode: (id, episodeData) => {
    if (episodeData.audio_file) {
      const formData = new FormData();
      formData.append('audio', episodeData.audio_file);
      if (episodeData.title) formData.append('title', episodeData.title);
      if (episodeData.description) formData.append('description', episodeData.description);
      if (episodeData.thumbnail_file) formData.append('thumbnail', episodeData.thumbnail_file);
      return api.put(`/episodes/${id}`, formData);
    }
    return api.put(`/episodes/${id}`, episodeData);
  },

  deleteEpisode: (id) => api.delete(`/episodes/${id}`),

  updateProgress: (episodeId, progressSeconds, playbackSpeed = 1.0, isCompleted = false) => {
    return api.post(`/episodes/${episodeId}/progress`, {
      progress_seconds: Math.floor(progressSeconds),
      playback_speed: playbackSpeed,
      is_completed: isCompleted
    });
  },

  toggleBookmark: (episodeId, timestampSeconds = null, note = null) => {
    return api.post(`/episodes/${episodeId}/bookmark`, { timestamp_seconds: timestampSeconds, note });
  },

  checkBookmark: (episodeId) => api.get(`/episodes/${episodeId}/bookmark`),

  getBookmarks: (params = {}) => api.get('/users/bookmarks', params),

  uploadThumbnail: (episodeId, file) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return api.post(`/episodes/${episodeId}/thumbnail`, formData);
  },

  toggleLike: (seriesId) => api.post('/activity/log', { activity_type: 'like', series_id: seriesId }),

  logShare: (episodeId, seriesId) => api.post('/activity/log', { activity_type: 'share', episode_id: episodeId, series_id: seriesId })
};

export default episodeService;
