// src/components/auth/OTPVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import './OTPVerification.css';

const OTPVerification = ({ email, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    const result = await verifyOTP(email, otpCode);
    setIsLoading(false);

    if (result.success) {
      toast.success('Account verified! Redirecting...');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    const result = await resendOTP(email);
    setIsLoading(false);

    if (result.success) {
      toast.success('New verification code sent to your email');
      setTimeLeft(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <motion.div
      className="otp-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <button className="back-button" onClick={onBack}>
        <FiArrowLeft /> Back
      </button>

      <div className="otp-header">
        <div className="otp-icon">
          <FiMail />
        </div>
        <h2>Verify Your Email</h2>
        <p>We've sent a 6-digit verification code to</p>
        <strong>{email}</strong>
      </div>

      <form onSubmit={handleSubmit} className="otp-form">
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-input"
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button type="submit" className="verify-button" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Account'}
        </button>

        <div className="resend-section">
          {canResend ? (
            <button type="button" onClick={handleResend} className="resend-button">
              Resend verification code
            </button>
          ) : (
            <p className="timer">Code expires in {formatTime(timeLeft)}</p>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default OTPVerification;
