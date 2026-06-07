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
      // Ensure is_creator is derived from role
      const enrichedUser = {
        ...storedUser,
        is_creator: storedUser.role === 'creator' || storedUser.role === 'admin',
      };
      setUser(enrichedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Helper to enrich user object with is_creator
  const enrichUser = (userData) => ({
    ...userData,
    is_creator: userData.role === 'creator' || userData.role === 'admin',
  });

  // Signup – does NOT log the user in; returns success and email for OTP
  const signup = useCallback(async (formData) => {
    try {
      const response = await authService.register(formData);
      if (response.data.success) {
        toast.success(response.data.message);
        return {
          success: true,
          email: formData.email,
          user: response.data.user,
        };
      }
      toast.error(response.data.message);
      return { success: false };
    } catch (error) {
      const msg = error.response?.data?.message || 'Signup failed';
      toast.error(msg);
      return { success: false };
    }
  }, []);

  // Verify OTP after signup (or after unverified login attempt)
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

  // Login – only for verified users; returns requiresVerification flag if unverified
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

  // Update profile – placeholder (you can implement later)
  const updateProfile = useCallback(async (profileData) => {
    // TODO: call your userService.updateProfile(profileData)
    toast.info('Update profile not yet implemented');
    return { success: false };
  }, []);

  // Change password – placeholder
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    toast.info('Change password not yet implemented');
    return { success: false };
  }, []);

  // Become creator – should update user role
  const becomeCreator = useCallback(async () => {
    // TODO: call API to upgrade user to creator
    toast.info('Become creator not yet implemented');
    // If successful, update local user:
    // const updatedUser = { ...user, role: 'creator', is_creator: true };
    // setUser(updatedUser);
    // localStorage.setItem('user', JSON.stringify(updatedUser));
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
    setUser, // exposed if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
