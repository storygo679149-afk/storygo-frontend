import { useState, useEffect } from 'react';
import authService from '../services/authService';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const signup = async (formData) => {
    try {
      const response = await authService.register(formData);
      if (response.data.success) {
        // Do NOT set token or user here – they must verify OTP first
        return { 
          success: true, 
          message: response.data.message, 
          user: response.data.user 
        };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await authService.verifyOTP(email, otp);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed',
      };
    }
  };

  const resendOTP = async (email) => {
    try {
      const response = await authService.resendOTP(email);
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend code',
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      // Check if the error is due to unverified account
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        return {
          success: false,
          message: error.response.data.message,
          requiresVerification: true,
          email: error.response.data.email,
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return { user, loading, signup, verifyOTP, resendOTP, login, logout };
};

export default useAuth;
