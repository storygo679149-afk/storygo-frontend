import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService'; // ✅ import userService
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const enrichUser = (userData) => ({
    ...userData,
    is_creator: userData.role === 'creator' || userData.role === 'admin',
  });

  // SIGNUP
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

  // VERIFY OTP (for signup)
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

  // RESEND OTP
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

  // LOGIN (sends OTP, returns tempToken)
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

  // VERIFY LOGIN OTP
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

  // LOGOUT
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

  // ✅ BECOME CREATOR – real implementation
  const becomeCreator = useCallback(async () => {
    try {
      const response = await userService.becomeCreator();
      // Backend returns { status: 'success', data: { user } }
      // Also handle if backend returns { success: true, user }
      const isSuccess = response.data.status === 'success' || response.data.success === true;
      if (isSuccess) {
        const updatedUser = response.data.data?.user || response.data.user;
        if (updatedUser) {
          const enriched = enrichUser(updatedUser);
          setUser(prev => ({ ...prev, ...enriched }));
          localStorage.setItem('user', JSON.stringify(enriched));
          toast.success(response.data.message || 'You are now a creator!');
          return { success: true, user: enriched };
        } else {
          // Fallback: refresh profile
          const profileRes = await userService.getProfile();
          if (profileRes.data.status === 'success' && profileRes.data.data?.user) {
            const refreshed = enrichUser(profileRes.data.data.user);
            setUser(refreshed);
            localStorage.setItem('user', JSON.stringify(refreshed));
            toast.success('You are now a creator!');
            return { success: true, user: refreshed };
          }
        }
      } else {
        const msg = response.data.message || 'Failed to become creator';
        toast.error(msg);
        return { success: false, message: msg };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
      console.error('Become creator error:', error);
      return { success: false, message: msg };
    }
  }, []);

  // Placeholders
  const updateProfile = useCallback(async () => {
    toast.info('Update profile not yet implemented');
    return { success: false };
  }, []);
  const changePassword = useCallback(async () => {
    toast.info('Change password not yet implemented');
    return { success: false };
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
