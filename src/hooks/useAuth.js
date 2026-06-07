import { useAuthContext } from '../context/AuthContext';

const useAuth = () => {
  const auth = useAuthContext();
  // Add is_creator derived from role (if not already present)
  const userWithCreator = auth.user ? {
    ...auth.user,
    is_creator: auth.user.role === 'creator' || auth.user.role === 'admin' || auth.user.is_creator === true
  } : null;

  return {
    user: userWithCreator,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login: auth.login,
    signup: auth.signup,
    verifyOTP: auth.verifyOTP,
    resendOTP: auth.resendOTP,
    logout: auth.logout,
    updateProfile: auth.updateProfile,
    changePassword: auth.changePassword,
    becomeCreator: auth.becomeCreator,
  };
};

export default useAuth;
