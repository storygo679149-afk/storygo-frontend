import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// ──────────────────────────────────────────────────────────────
// Inline CSS — yeh apne existing Login CSS ke saath merge karo
// Ya isko completely replace karo agar fresh start chahte ho
// ──────────────────────────────────────────────────────────────
const CSS_KEYFRAMES = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .login-input:focus {
    border-color: #e50914 !important;
    box-shadow: 0 0 0 3px rgba(229,9,20,0.15) !important;
    outline: none;
  }
  .login-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff1a1a, #e50914) !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(229,9,20,0.4) !important;
  }
  .login-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  .toggle-pass:hover {
    color: #e50914 !important;
  }
`;

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
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    animation: 'fadeIn 0.4s ease',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  logoText: {
    fontSize: '28px',
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
    margin: '0 0 6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 32px',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#888',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    background: '#1e1e1e',
    border: '2px solid #2a2a2a',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '15px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  passwordInput: {
    width: '100%',
    padding: '14px 48px 14px 16px',
    background: '#1e1e1e',
    border: '2px solid #2a2a2a',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '15px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  togglePass: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#555',
    fontSize: '18px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  submitBtn: (loading) => ({
    width: '100%',
    padding: '15px',
    background: loading
      ? '#2a2a2a'
      : 'linear-gradient(135deg, #e50914, #c00a12)',
    color: loading ? '#555' : '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: loading ? 'not-allowed' : 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }),
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
    color: '#333',
    fontSize: '12px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#2a2a2a',
  },
  registerRow: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
  },
  registerLink: {
    color: '#e50914',
    fontWeight: '600',
    textDecoration: 'none',
    marginLeft: '4px',
  },
  errorBox: (show) => ({
    background: 'rgba(229,9,20,0.08)',
    border: '1px solid rgba(229,9,20,0.25)',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#ff6b6b',
    marginBottom: '20px',
    display: show ? 'block' : 'none',
  }),
};

// ──────────────────────────────────────────────────────────────
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email aur password dono required hain');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Valid email enter karo');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { email: email.trim().toLowerCase(), password },
        { timeout: 15000 }
      );

      if (res.data.success) {
        toast.success('OTP bhej diya! Email check karo 📧');

        // OTP page pe navigate karo — state mein tempToken pass karo
        navigate('/verify-otp', {
          state: {
            tempToken: res.data.tempToken,
            maskedEmail: res.data.maskedEmail,
          },
          replace: false, // user back press kar sakta hai
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Dobara try karo.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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

          {/* Heading */}
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Login karo aur sunao apni kahani 🎧</p>

          {/* Error Box */}
          <div style={styles.errorBox(!!errorMsg)}>{errorMsg}</div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="email">Email</label>
              <div style={styles.inputWrap}>
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  style={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="password">Password</label>
              <div style={styles.inputWrap}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  style={styles.togglePass}
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-btn"
              style={styles.submitBtn(loading)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={styles.spinner} />
                  OTP bhej rahe hain...
                </>
              ) : (
                'Login karo →'
              )}
            </button>

          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span>ya</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Register Link */}
          <p style={styles.registerRow}>
            Account nahi hai?
            <Link to="/register" style={styles.registerLink}>
              Register karo
            </Link>
          </p>

        </div>
      </div>
    </>
  );
};

export default Login;
