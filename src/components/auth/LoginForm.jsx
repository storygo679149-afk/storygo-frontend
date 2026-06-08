import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuthContext } from '../../context/AuthContext';
import OTPVerification from './OTPVerification';
import './LoginForm.css';

const LoginForm = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success && result.requiresVerification) {
      setTempToken(result.tempToken);
      setVerificationEmail(result.email);
      setNeedsVerification(true);
    } else if (result.requiresVerification) {
      // Should not happen for login, but handle gracefully
      setVerificationEmail(result.email);
      setNeedsVerification(true);
    } else {
      setErrorMessage(result.message || 'Login failed. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    setNeedsVerification(false);
    setTempToken('');
    setVerificationEmail('');
    setErrorMessage('');
  };

  if (needsVerification) {
    return (
      <OTPVerification
        email={verificationEmail}
        tempToken={tempToken}
        isLoginFlow={true}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="login-header">
          <div className="login-icon"><FiLogIn /></div>
          <h2>Welcome Back</h2>
          <p>Log in to continue your journey</p>
        </div>

        {errorMessage && (
          <div className="alert-message error">
            <FiAlertCircle />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label><FiMail /> Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@storygo.com"
              required
            />
          </div>
          <div className="form-group">
            <label><FiLock /> Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Login'}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginForm;
