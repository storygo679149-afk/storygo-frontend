import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../context/AuthContext';
import './OTPVerification.css';

const OTPVerification = ({ email, onBack, tempToken = null, isLoginFlow = false }) => {
  const { verifyOTP, verifyLoginOTP, resendOTP } = useAuthContext();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (idx, val) => {
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) document.getElementById(`otp-input-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-input-${idx - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Enter 6-digit code');
      return;
    }
    setIsLoading(true);
    let result;
    if (isLoginFlow && tempToken) {
      result = await verifyLoginOTP(email, code, tempToken);
    } else {
      result = await verifyOTP(email, code);
    }
    setIsLoading(false);
    if (result.success) {
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
      setTimeLeft(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    }
  };

  return (
    <div className="otp-page">
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
          <div className="otp-icon"><FiMail /></div>
          <h2>{isLoginFlow ? 'Login Verification' : 'Verify Your Email'}</h2>
          <p>We've sent a 6‑digit code to</p>
          <strong>{email}</strong>
        </div>
        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`otp-input-${i}`}
                type="text"
                maxLength="1"
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="otp-input"
                autoFocus={i === 0}
              />
            ))}
          </div>
          <button type="submit" className="verify-button" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
          <div className="resend-section">
            {canResend ? (
              <button type="button" onClick={handleResend} className="resend-button">
                Resend code
              </button>
            ) : (
              <p className="timer">Expires in {formatTime(timeLeft)}</p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
