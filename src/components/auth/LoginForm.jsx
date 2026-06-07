import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthContext } from '../../context/AuthContext';
import OTPVerification from './OTPVerification';

const LoginForm = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      navigate('/');
    } else if (result.requiresVerification) {
      setVerificationEmail(result.email || email);
      setNeedsVerification(true);
    }
  };

  const handleBackToLogin = () => {
    setNeedsVerification(false);
    setVerificationEmail('');
  };

  if (needsVerification) return <OTPVerification email={verificationEmail} onBack={handleBackToLogin} />;

  return (
    <motion.div className="login-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="login-header"><div className="login-icon"><FiLogIn /></div><h2>Welcome Back</h2><p>Log in to continue your journey</p></div>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group"><label><FiMail /> Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@storygo.com" required /></div>
        <div className="form-group"><label><FiLock /> Password</label><div className="password-input-wrapper"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div></div>
        <button type="submit" className="login-button" disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="signup-link">Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </motion.div>
  );
};

export default LoginForm;
