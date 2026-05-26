import React from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { FiHeadphones } from 'react-icons/fi';
import './Auth.css';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div
          className="auth-brand"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="brand-content">
            <div className="brand-logo">
              <FiHeadphones size={40} />
              <span>Story Go</span>
            </div>
            <h1 className="brand-title">
              {mode === 'login' ? 'Welcome Back' : 'Join the Community'}
            </h1>
            <p className="brand-description">
              {mode === 'login'
                ? 'Pick up right where you left off. Continue your audio journey.'
                : 'Discover thousands of audio stories. Start listening today.'}
            </p>
            <div className="brand-features">
              <div className="feature-item"><span>🎧</span><span>HD Audio Streaming</span></div>
              <div className="feature-item"><span>📚</span><span>Thousands of Series</span></div>
              <div className="feature-item"><span>⚡</span><span>Resume Anywhere</span></div>
              <div className="feature-item"><span>🌍</span><span>Multiple Languages</span></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="auth-form-side"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {mode === 'signup' ? <SignupForm /> : <LoginForm />}
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;