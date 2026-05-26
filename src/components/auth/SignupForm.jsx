import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FiMail, FiLock, FiUser, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './SignupForm.css';

const SignupForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const { username, email, password, full_name } = formData;

    if (!username.trim()) newErrors.username = 'Username is required';
    else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) newErrors.username = 'Username can only contain letters, numbers, and underscores';

    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!full_name.trim()) newErrors.full_name = 'Full name is required';
    else if (full_name.length < 2) newErrors.full_name = 'Full name must be at least 2 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await signup(formData);
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/');
      } else {
        toast.error(result.message || 'Signup failed');
      }
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="signup-form-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="signup-header">
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Join the audio storytelling community</p>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        <div className={`form-group ${errors.full_name ? 'has-error' : ''}`}>
          <label className="form-label"><FiUser className="input-icon" /> Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Your full name"
            className="form-input"
          />
          {errors.full_name && <span className="error-message">{errors.full_name}</span>}
        </div>

        <div className={`form-group ${errors.username ? 'has-error' : ''}`}>
          <label className="form-label"><FiUser className="input-icon" /> Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            className="form-input"
          />
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>

        <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
          <label className="form-label"><FiMail className="input-icon" /> Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="form-input"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
          <label className="form-label"><FiLock className="input-icon" /> Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="form-input"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <button type="submit" className="signup-btn" disabled={isLoading}>
          {isLoading ? <div className="btn-spinner" /> : <><FiUserPlus /> Create Account</>}
        </button>
      </form>

      <p className="signup-footer">
        Already have an account? <Link to="/auth?mode=login" className="login-link">Sign In</Link>
      </p>
    </motion.div>
  );
};

export default SignupForm;