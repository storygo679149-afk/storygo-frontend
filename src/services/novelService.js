import api from './api';

const novelService = {
  getAllNovels: (params = {}) => api.get('/novels', { params }),
  getMyNovels: (params = {}) => api.get('/novels', { params: { ...params, my_novels: true } }),
  getNovelById: (id) => api.get(`/novels/${id}`),
  getChapter: (novelId, chapterId) => api.get(`/novels/${novelId}/chapters/${chapterId}`),
  
  createNovel: (formData) => api.post('/novels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  updateNovel: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/novels/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/novels/${id}`, data);
  },
  
  deleteNovel: (id) => api.delete(`/novels/${id}`),
  addChapter: (novelId, data) => api.post(`/novels/${novelId}/chapters`, data),
  toggleLike: (novelId) => api.post(`/novels/${novelId}/like`),
  saveReadingProgress: (chapterId, scrollPosition) => 
    api.post('/novels/reading-progress', { chapterId, scrollPosition }),
  searchNovels: (query, params = {}) => 
    api.get('/search', { params: { q: query, type: 'novels', ...params } })
};

export default novelService;