import { useAuthContext } from '../context/AuthContext';

const useAuth = () => {
  const auth = useAuthContext();

  // Safe fallbacks for all methods to avoid runtime errors
  const safeFn = (fn) => (fn && typeof fn === 'function' ? fn : () => Promise.resolve({ success: false }));

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login: safeFn(auth.login),
    signup: safeFn(auth.signup),
    verifyOTP: safeFn(auth.verifyOTP),
    verifyLoginOTP: safeFn(auth.verifyLoginOTP),
    resendOTP: safeFn(auth.resendOTP),
    logout: safeFn(auth.logout),
    updateProfile: safeFn(auth.updateProfile),
    changePassword: safeFn(auth.changePassword),
    becomeCreator: safeFn(auth.becomeCreator),
    refreshUser: (auth.refreshUser && typeof auth.refreshUser === 'function') ? auth.refreshUser : () => Promise.resolve(null),
    setUser: auth.setUser || (() => {}),
  };
};

export default useAuth;
