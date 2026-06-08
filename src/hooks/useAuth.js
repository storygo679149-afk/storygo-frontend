// src/hooks/useAuth.js
import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook to access auth context easily.
 * Returns the same values as AuthContext, plus convenience.
 */
const useAuth = () => {
  const auth = useAuthContext();
  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    // Methods
    login: auth.login,
    signup: auth.signup,
    verifyOTP: auth.verifyOTP,
    verifyLoginOTP: auth.verifyLoginOTP,
    resendOTP: auth.resendOTP,
    logout: auth.logout,
    updateProfile: auth.updateProfile,
    changePassword: auth.changePassword,
    becomeCreator: auth.becomeCreator,
    setUser: auth.setUser,
  };
};

export default useAuth;
