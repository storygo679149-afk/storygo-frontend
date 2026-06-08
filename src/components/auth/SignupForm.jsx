import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthContext } from '../../context/AuthContext';
import OTPVerification from './OTPVerification';
import './SignupForm.css';

const SignupForm = () => {
  const { signup } = useAuthContext();
  const [step, setStep] = useState('register');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailError, setEmailError] = useState(''); // specific for duplicate email

  const validateForm = () => {
    const newErrors = {};
    const { username, email, password, full_name } = formData;

    if (!username.trim()) newErrors.username = 'Username required';
    else if (username.length < 3) newErrors.username = 'Min 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) newErrors.username = 'Only letters, numbers, underscore';

    if (!email.trim()) newErrors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email';

    if (!password) newErrors.password = 'Password required';
    else if (password.length < 6) newErrors.password = 'Min 6 characters';

    if (!full_name.trim()) newErrors.full_name = 'Full name required';

    setErrors(newErrors);
    // Clear emailError when revalidating
    setEmailError('');
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'email') setEmailError(''); // clear email error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await signup(formData);
    setIsLoading(false);

    if (result.success) {
      setRegisteredEmail(formData.email);
      setStep('verify');
    } else {
      // Check if error message indicates duplicate email
      if (result.message && result.message.toLowerCase().includes('email already')) {
        setEmailError(result.message);
        // Also add error to the email field highlight
        setErrors(prev => ({ ...prev, email: result.message }));
      }
      // toast is already shown by the context, so no need to duplicate
    }
  };

  const handleBackToRegister = () => {
    setStep('register');
    setRegisteredEmail('');
    setEmailError('');
    setErrors({});
  };

  if (step === 'verify') {
    return <OTPVerification email={registeredEmail} onBack={handleBackToRegister} />;
  }

  return (
    <div className="signup-page">
      <motion.div
        className="signup-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="signup-header">
          <div className="signup-icon"><FiUserPlus /></div>
          <h2>Create Account</h2>
          <p>Join the audio storytelling community</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label><FiUser /> Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              className={errors.full_name ? 'error' : ''}
            />
            {errors.full_name && <span className="error-message">{errors.full_name}</span>}
          </div>

          <div className="form-group">
            <label><FiUser /> Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="john_doe"
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label><FiMail /> Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="hello@storygo.com"
              className={errors.email ? 'error' : ''}
            />
            {/* Show inline error for duplicate email */}
            {emailError && <span className="error-message">{emailError}</span>}
            {errors.email && !emailError && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label><FiLock /> Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="signup-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="signin-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupForm;
