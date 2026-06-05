import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// ──────────────────────────────────────────────────────────────
// Inline CSS — no external dependencies needed
// ──────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at 20% 50%, #1a0000 0%, #0a0a0a 60%)',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: '20px',
  },
  card: {
    background: '#141414',
    borderRadius: '20px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
    border: '1px solid #2a2a2a',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(229,9,20,0.05)',
    animation: 'slideUp 0.4s ease',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoText: {
    fontSize: '26px',
    fontWeight: '900',
    color: '#e50914',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    margin: '0 0 4px',
  },
  logoSub: {
    fontSize: '11px',
    color: '#555',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    margin: 0,
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    textAlign: 'center',
    margin: '0 0 36px',
    lineHeight: '1.6',
  },
  emailHighlight: {
    color: '#ffffff',
    fontWeight: '600',
  },
  otpContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  otpInput: (filled) => ({
    width: '52px',
    height: '60px',
    textAlign: 'center',
    fontSize: '26px',
    fontWeight: '800',
    background: filled ? 'rgba(229,9,20,0.12)' : '#1e1e1e',
    border: `2px solid ${filled ? '#e50914' : '#333'}`,
    borderRadius: '10px',
    color: filled ? '#ffffff' : '#888',
    outline: 'none',
    cursor: 'text',
    transition: 'all 0.15s ease',
    caretColor: '#e50914',
    fontFamily: "'Courier New', monospace",
  }),
  verifyBtn: (disabled) => ({
    width: '100%',
    padding: '15px',
    background: disabled ? '#2a2a2a' : 'linear-gradient(135deg, #e50914, #c00a12)',
    color: disabled ? '#555' : '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
    marginBottom: '20px',
  }),
  resendRow: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#666',
    marginBottom: '0',
  },
  resendLink: (active) => ({
    color: active ? '#e50914' : '#444',
    cursor: active ? 'pointer' : 'not-allowed',
    fontWeight: '600',
    textDecoration: active ? 'underline' : 'none',
    transition: 'color 0.2s',
  }),
  timerBadge: {
    display: 'inline-block',
    background: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '2px 8px',
    fontSize: '12px',
    color: '#ffcc00',
    marginLeft: '6px',
    fontFamily: "'Courier New', monospace",
  },
  backBtn: {
    display: 'block',
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '13px',
    color: '#555',
    cursor: 'pointer',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
    width: '100%',
    transition: 'color 0.2s',
  },
  expiryNote: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#444',
    marginTop: '16px',
  },
};

const CSS_KEYFRAMES = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  input:focus {
    border-color: #e50914 !important;
    box-shadow: 0 0 0 3px rgba(229,9,20,0.15);
  }
`;

// ──────────────────────────────────────────────────────────────
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const OTP_LENGTH = 6;

const VerifyOTP = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const tempToken = location.state?.tempToken;
  const maskedEmail = location.state?.maskedEmail || location.state?.email || '';

  // Guard: bina login ke direct access block karo
  useEffect(() => {
    if (!tempToken) {
      navigate('/login', { replace: true });
    }
  }, [tempToken, navigate]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // Auto focus first input
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  const handleChange = useCallback((index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
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
      toast.error('Pura 6-digit OTP enter karo');
      return;
    }
    if (!tempToken) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
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
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Welcome back! 🎉');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verify nahi hua. Dobara try karo.';
      toast.error(msg);

      // Session expire hone pe login page pe redirect
      if (
        msg.toLowerCase().includes('expire') ||
        msg.toLowerCase().includes('session') ||
        err.response?.status === 401
      ) {
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }

      // OTP box reset karo galat hone pe
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }, [otp, tempToken, navigate]);

  const handleResend = useCallback(async () => {
    if (!canResend || !tempToken) return;
    try {
      await axios.post(
        `${API_URL}/api/auth/resend-otp`,
        {},
        {
          headers: { Authorization: `Bearer ${tempToken}` },
          timeout: 10000,
        }
      );
      toast.success('Naya OTP bhej diya! 📧');
      setOtp(Array(OTP_LENGTH).fill(''));
      setResendTimer(60);
      setCanResend(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      const msg = err.response?.data?.message || 'Resend nahi hua.';
      toast.error(msg);
      if (err.response?.status === 401) {
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      }
    }
  }, [canResend, tempToken, navigate]);

  const otpFilled = otp.join('').length === OTP_LENGTH;

  return (
    <>
      <style>{CSS_KEYFRAMES}</style>
      <div style={styles.page}>
        <div style={styles.card}>

          {/* Logo */}
          <div style={styles.logo}>
            <p style={styles.logoText}>StoryGo</p>
            <p style={styles.logoSub}>Audio Storytelling</p>
          </div>

          {/* Title */}
          <h2 style={styles.title}>OTP Verify Karo</h2>
          <p style={styles.subtitle}>
            6-digit code bheja gaya hai{' '}
            <span style={styles.emailHighlight}>{maskedEmail}</span>{' '}
            par. Check karo aur enter karo.
          </p>

          {/* OTP Inputs */}
          <div style={styles.otpContainer}>
            {otp.map((digit, idx) => (
              <input
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
                style={styles.otpInput(!!digit)}
                aria-label={`OTP digit ${idx + 1}`}
                disabled={loading}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || !otpFilled}
            style={styles.verifyBtn(loading || !otpFilled)}
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>

          {/* Resend Row */}
          <p style={styles.resendRow}>
            OTP nahi aaya?{' '}
            <span
              onClick={handleResend}
              style={styles.resendLink(canResend)}
              role="button"
              tabIndex={canResend ? 0 : -1}
              onKeyDown={(e) => e.key === 'Enter' && handleResend()}
            >
              Resend OTP
            </span>
            {!canResend && (
              <span style={styles.timerBadge}>{resendTimer}s</span>
            )}
          </p>

          <p style={styles.expiryNote}>⏱ OTP 10 minutes mein expire ho jaata hai</p>

          {/* Back to Login */}
          <button
            style={styles.backBtn}
            onClick={() => navigate('/login', { replace: true })}
          >
            ← Wapas Login pe
          </button>

        </div>
      </div>
    </>
  );
};

export default VerifyOTP;
