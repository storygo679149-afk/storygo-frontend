import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      const enrichedUser = {
        ...storedUser,
        is_creator: storedUser.role === 'creator' || storedUser.role === 'admin',
      };
      setUser(enrichedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Helper to enrich user object
  const enrichUser = (userData) => ({
    ...userData,
    is_creator: userData.role === 'creator' || userData.role === 'admin',
  });

  // ✅ SIGNUP – with proper error extraction
  const signup = useCallback(async (formData) => {
    try {
      const response = await authService.register(formData);
      if (response.data.success) {
        toast.success(response.data.message);
        return { success: true, email: formData.email, user: response.data.user };
      }
      // In case backend returns success: false (shouldn't happen with 201, but handle)
      toast.error(response.data.message);
      return { success: false, message: response.data.message };
    } catch (error) {
      // Extract the exact error message from backend response
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Verify OTP after signup
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

  // Resend OTP
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

  // Login
  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.data.success) {
        const loggedInUser = enrichUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return { success: true };
      }
      return { success: false };
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
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  // Logout
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

  // Placeholder methods
  const updateProfile = useCallback(async () => {
    toast.info('Update profile not yet implemented');
    return { success: false };
  }, []);
  const changePassword = useCallback(async () => {
    toast.info('Change password not yet implemented');
    return { success: false };
  }, []);
  const becomeCreator = useCallback(async () => {
    toast.info('Become creator not yet implemented');
    return { success: false };
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    verifyOTP,
    resendOTP,
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
