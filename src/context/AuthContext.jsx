import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const enrichUser = (userData) => ({
    ...userData,
    is_creator: userData.role === 'creator' || userData.role === 'admin',
  });

  // Refresh user from API
  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const response = await userService.getProfile();
      if (response.data.status === 'success' && response.data.data?.user) {
        const freshUser = enrichUser(response.data.data.user);
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        setIsAuthenticated(true);
        return freshUser;
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    return null;
  }, []);

  // Load initial user
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setUser(enrichUser(storedUser));
        setIsAuthenticated(true);
      }
      await refreshUser();
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  // ---------- Authentication Methods ----------
  const signup = useCallback(async (formData) => {
    try {
      const response = await authService.register(formData);
      if (response.data.success) {
        toast.success(response.data.message);
        return { success: true, email: formData.email, user: response.data.user };
      }
      toast.error(response.data.message);
      return { success: false, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    try {
      const response = await authService.verifyOTP(email, otp);
      if (response.data.success) {
        const finalUser = enrichUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(finalUser));
        setUser(finalUser);
        setIsAuthenticated(true);
        toast.success('Account verified! You are now logged in.');
        return { success: true };
      }
      toast.error(response.data.message);
      return { success: false };
    } catch (error) {
      const msg = error.response?.data?.message || 'Verification failed';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  const resendOTP = useCallback(async (email) => {
    try {
      const response = await authService.resendOTP(email);
      if (response.data.success) {
        toast.success(response.data.message);
        return { success: true };
      }
      toast.error(response.data.message);
      return { success: false };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to resend code';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.data.success && response.data.tempToken) {
        toast.success(response.data.message);
        return {
          success: true,
          tempToken: response.data.tempToken,
          email: response.data.email,
          requiresVerification: true,
        };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        toast.error(error.response.data.message);
        return {
          success: false,
          requiresVerification: true,
          email: error.response.data.email,
          message: error.response.data.message,
        };
      }
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  const verifyLoginOTP = useCallback(async (email, otp, tempToken) => {
    try {
      const response = await authService.verifyLoginOTP(email, otp, tempToken);
      if (response.data.success) {
        const loggedInUser = enrichUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return { success: true };
      }
      toast.error(response.data.message);
      return { success: false };
    } catch (error) {
      const msg = error.response?.data?.message || 'OTP verification failed';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await userService.updateProfile(profileData);
      if (response.data.status === 'success') {
        await refreshUser();
        toast.success('Profile updated');
        return { success: true };
      }
      toast.error(response.data.message || 'Update failed');
      return { success: false };
    } catch (error) {
      const msg = error.response?.data?.message || 'Update failed';
      toast.error(msg);
      return { success: false };
    }
  }, [refreshUser]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await userService.changePassword({ currentPassword, newPassword });
      if (response.data.status === 'success') {
        toast.success('Password changed');
        return { success: true };
      }
      toast.error(response.data.message || 'Change failed');
      return { success: false };
    } catch (error) {
      const msg = error.response?.data?.message || 'Change failed';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  const becomeCreator = useCallback(async () => {
    try {
      const response = await userService.becomeCreator();
      if (response.data.status === 'success') {
        const freshUser = await refreshUser();
        if (freshUser) {
          toast.success(response.data.message || 'You are now a creator!');
          return { success: true, user: freshUser };
        }
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already a creator')) {
        const freshUser = await refreshUser();
        if (freshUser && (freshUser.is_creator || freshUser.role === 'creator')) {
          toast.info('You are already a creator.');
          return { success: true, user: freshUser };
        }
      }
      const msg = error.response?.data?.message || 'Something went wrong';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out');
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    verifyOTP,
    verifyLoginOTP,
    resendOTP,
    logout,
    updateProfile,
    changePassword,
    becomeCreator,
    refreshUser,
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
