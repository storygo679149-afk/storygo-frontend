import api from './api';

const authService = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/update-profile', profileData),
  changePassword: (currentPassword, newPassword) => api.put('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword
  })
};

export default authService;