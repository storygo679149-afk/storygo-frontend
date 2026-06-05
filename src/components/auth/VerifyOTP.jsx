import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiRefreshCw, FiArrowLeft, FiShield } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import './VerifyOTP.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const OTP_LENGTH = 6;

const VerifyOTP = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const tempToken = location.state?.tempToken;
  const maskedEmail = location.state?.maskedEmail || 'your email';

  // Guard: bina login ke direct access block
  useEffect(() => {
    if (!tempToken) {
      navigate('/auth', { replace: true });
    }
  }, [tempToken, navigate]);

  // Auto-focus first input
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 150);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const handleChange = useCallback((index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerify();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }, []);

  const handleVerify = useCallback(async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/verify-otp`,
        { otp: otpStr },
        {
          headers: { Authorization: `Bearer ${tempToken}` },
          timeout: 10000,
        }
      );

      if (res.data.success) {
        // Token + user localStorage mein save karo
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Welcome back! 🎉');
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(msg);
      // Wrong OTP pe boxes reset
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);

      // Session expire pe login redirect
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => navigate('/auth', { replace: true }), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [otp, tempToken, navigate]);

  const handleResend = useCallback(async () => {
    if (!canResend) return;

    try {
      await axios.post(
        `${API_URL}/api/auth/resend-otp`,
        {},
        {
          headers: { Authorization: `Bearer ${tempToken}` },
          timeout: 10000,
        }
      );
      toast.success('New OTP sent! Check your email 📧');
      setOtp(Array(OTP_LENGTH).fill(''));
      setResendTimer(60);
      setCanResend(false);
      setError('');
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not resend OTP.';
      toast.error(msg);
      if (err.response?.status === 401) {
        setTimeout(() => navigate('/auth', { replace: true }), 1500);
      }
    }
  }, [canResend, tempToken, navigate]);

  const otpFilled = otp.join('').length === OTP_LENGTH;

  return (
    <motion.div
      className="otp-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="otp-header">
        <div className="otp-icon-wrap">
          <FiShield className="otp-shield-icon" />
        </div>
        <h1 className="otp-title">Verify Your Identity</h1>
        <p className="otp-subtitle">
          We sent a 6-digit code to{' '}
          <span className="otp-email">{maskedEmail}</span>
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          className="error-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* OTP Inputs */}
      <div className="otp-inputs-row">
        {otp.map((digit, idx) => (
          <motion.input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`otp-input ${digit ? 'otp-input--filled' : ''}`}
            disabled={isLoading}
            aria-label={`OTP digit ${idx + 1}`}
            whileFocus={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        className={`login-btn otp-verify-btn ${!otpFilled || isLoading ? 'login-btn--disabled' : ''}`}
        onClick={handleVerify}
        disabled={isLoading || !otpFilled}
      >
        {isLoading ? (
          <div className="btn-spinner" />
        ) : (
          <>
            <FiShield /> Verify & Sign In
          </>
        )}
      </button>

      {/* Resend Row */}
      <div className="otp-resend-row">
        {canResend ? (
          <button className="otp-resend-btn" onClick={handleResend}>
            <FiRefreshCw className="otp-resend-icon" />
            Resend OTP
          </button>
        ) : (
          <p className="otp-timer-text">
            Resend OTP in{' '}
            <span className="otp-timer-count">{resendTimer}s</span>
          </p>
        )}
      </div>

      <p className="otp-expiry">OTP expires in 10 minutes</p>

      {/* Back to Login */}
      <button
        className="otp-back-btn"
        onClick={() => navigate('/auth', { replace: true })}
      >
        <FiArrowLeft /> Back to Login
      </button>
    </motion.div>
  );
};

export default VerifyOTP;
