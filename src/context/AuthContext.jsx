import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response && response.data) {
          const userData = response.data.user || response.data.data?.user;
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.data && response.data.status === 'success') {
        const userData = response.data.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }
      return { success: false, message: response.data?.message || 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      const response = await authService.signup(userData);
      if (response.data && response.data.status === 'success') {
        const userInfo = response.data.data.user;
        setUser(userInfo);
        setIsAuthenticated(true);
        return { success: true, user: userInfo };
      }
      return { success: false, message: response.data?.message || 'Signup failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out');
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await userService.updateProfile(profileData);
      if (response.data && response.data.status === 'success') {
        const updatedUser = response.data.data.user;
        setUser(prev => ({ ...prev, ...updatedUser }));
        toast.success('Profile updated');
        return { success: true, user: updatedUser };
      }
      return { success: false, message: response.data?.message || 'Update failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await userService.changePassword(currentPassword, newPassword);
      if (response.data && response.data.status === 'success') {
        toast.success('Password changed');
        return { success: true };
      }
      return { success: false, message: response.data?.message || 'Password change failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // ✅ Become Creator
  const becomeCreator = useCallback(async () => {
    try {
      const response = await userService.becomeCreator();
      if (response.data && response.data.status === 'success') {
        const updatedUser = response.data.data.user;
        setUser(prev => ({ ...prev, ...updatedUser }));
        toast.success('You are now a creator!');
        return { success: true, user: updatedUser };
      }
      return { success: false, message: response.data?.message || 'Failed to become creator' };
    } catch (error) {
      console.error('Become creator error:', error);
      const message = error.response?.data?.message || 'Failed to become creator';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    becomeCreator,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};

export default AuthContext;