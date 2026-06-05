import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── On mount: check if user is already logged in ──────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await authService.getCurrentUser();
        const userData = response?.data?.user;
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Token invalid or expired — clear it
        localStorage.removeItem('token');
        console.log('Not authenticated');
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // ── Step 1: Login → sends OTP, returns tempToken ──────────────────────────
  // Returns { success: true, tempToken, maskedEmail } on success
  // The Login page should store tempToken and redirect to OTP screen
  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const data = response?.data;

      if (data?.success) {
        // Store tempToken for OTP verification step
        localStorage.setItem('tempToken', data.tempToken);
        return {
          success: true,
          tempToken: data.tempToken,
          maskedEmail: data.maskedEmail,
          message: data.message,
        };
      }

      const msg = data?.message || 'Login failed. Dobara try karo.';
      toast.error(msg);
      return { success: false, message: msg };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Dobara try karo.';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // ── Step 2: Verify OTP → returns final token + user ───────────────────────
  const verifyOTP = useCallback(async (otp) => {
    try {
      const tempToken = localStorage.getItem('tempToken');
      if (!tempToken) {
        toast.error('Session expire ho gayi. Dobara login karo.');
        return { success: false, message: 'No temp token found' };
      }

      const response = await authService.verifyOTP(otp, tempToken);
      const data = response?.data;

      if (data?.success) {
        // Save final token, clear temp token
        localStorage.setItem('token', data.token);
        localStorage.removeItem('tempToken');

        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Login successful! Welcome back 🎉');
        return { success: true, user: data.user };
      }

      const msg = data?.message || 'OTP verification failed';
      toast.error(msg);
      return { success: false, message: msg };
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // ── Signup ─────────────────────────────────────────────────────────────────
  const signup = useCallback(async (userData) => {
    try {
      const response = await authService.signup(userData);
      const data = response?.data;

      if (data?.success) {
        toast.success('Account bana diya! Ab login karo.');
        return { success: true, user: data.user };
      }

      const msg = data?.message || 'Signup failed';
      toast.error(msg);
      return { success: false, message: msg };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('tempToken');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out');
    }
  }, []);

  // ── Update Profile ─────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await userService.updateProfile(profileData);
      const data = response?.data;

      if (data?.success) {
        const updatedUser = data.user || data.data?.user;
        setUser(prev => ({ ...prev, ...updatedUser }));
        toast.success('Profile updated');
        return { success: true, user: updatedUser };
      }

      const msg = data?.message || 'Update failed';
      return { success: false, message: msg };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // ── Change Password ────────────────────────────────────────────────────────
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      const data = response?.data;

      if (data?.success) {
        toast.success('Password changed');
        return { success: true };
      }

      const msg = data?.message || 'Password change failed';
      return { success: false, message: msg };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // ── Become Creator ─────────────────────────────────────────────────────────
  const becomeCreator = useCallback(async () => {
    try {
      const response = await userService.becomeCreator();
      const data = response?.data;

      if (data?.success) {
        const updatedUser = data.user || data.data?.user;
        setUser(prev => ({ ...prev, ...updatedUser }));
        toast.success('You are now a creator!');
        return { success: true, user: updatedUser };
      }

      const msg = data?.message || 'Failed to become creator';
      return { success: false, message: msg };
    } catch (error) {
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
    verifyOTP,
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