import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import {
  FiCheck, FiStar, FiHeadphones, FiDownload, FiHeart,
  FiBookmark, FiShield, FiZap, FiCreditCard, FiLoader,
  FiTrendingUp, FiUsers
} from 'react-icons/fi';
import './Subscription.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
  hover: {
    y: -12,
    scale: 1.02,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  }
};

const Subscription = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
      return;
    }
    fetchPlans();
    fetchCurrentSubscription();
  }, [isAuthenticated, navigate]);

  const fetchPlans = async () => {
    try {
      const response = await apiService.get('/payments/plans');
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setPlans(getFallbackPlans());
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await apiService.get('/payments/subscription/status');
      if (response.data && response.data.is_premium) {
        setCurrentPlan(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const getFallbackPlans = () => [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      price_amount: 4000,
      interval: 'month',
      currency: 'inr',
      features: ['Unlimited Listening', 'Ad-Free Experience', 'Download Episodes', 'Early Access']
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price_amount: 40000,
      interval: 'year',
      currency: 'inr',
      features: ['Unlimited Listening', 'Ad-Free Experience', 'Download Episodes', 'Early Access', 'Save 17%']
    }
  ];

  const handleSubscribe = async (planId) => {
    setSubscribing(planId);
    try {
      const response = await apiService.post('/payments/create-checkout-session', { planId });
      if (response.data.sessionUrl) {
        window.location.href = response.data.sessionUrl;
      } else {
        toast.error('Failed to initiate checkout');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Subscription failed');
    } finally {
      setSubscribing(null);
    }
  };

  const formatPrice = (amount) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="subscription-loading">
        <div className="spinner"></div>
        <p>Loading premium plans...</p>
      </div>
    );
  }

  const features = [
    { icon: <FiHeadphones />, text: 'Unlimited listening to all episodes' },
    { icon: <FiZap />, text: 'Ad-free experience' },
    { icon: <FiDownload />, text: 'Download episodes for offline listening' },
    { icon: <FiHeart />, text: 'Support your favorite creators' },
    { icon: <FiBookmark />, text: 'Unlimited bookmarks' },
    { icon: <FiTrendingUp />, text: 'Early access to new episodes' },
    { icon: <FiUsers />, text: 'Exclusive creator content' },
    { icon: <FiShield />, text: 'Priority support' }
  ];

  return (
    <div className="subscription-page">
      <div className="subscription-container">
        {/* Hero Section */}
        <motion.div
          className="subscription-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-badge">
            <FiStar /> Premium Experience
          </div>
          <h1 className="hero-title">Upgrade to <span className="gradient-text">Premium</span></h1>
          <p className="hero-subtitle">Unlock unlimited stories, ad-free listening, and exclusive content</p>
        </motion.div>

        {/* Current Plan Banner */}
        {currentPlan && (
          <motion.div
            className="current-plan-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FiCheck />
            <div>
              <strong>You're a Premium member!</strong>
              <p>Enjoying unlimited access to all content</p>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        {!currentPlan && plans.length > 0 && (
          <motion.div
            className="pricing-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                className="pricing-card"
                variants={cardVariants}
                whileHover="hover"
              >
                {plan.interval === 'year' && <div className="popular-badge">Best Value</div>}
                <div className="card-header">
                  <h3>{plan.name}</h3>
                  <div className="price">
                    <span className="amount">{formatPrice(plan.price_amount)}</span>
                    <span className="period">/{plan.interval}</span>
                  </div>
                  {plan.interval === 'year' && (
                    <p className="savings">Save 17% compared to monthly</p>
                  )}
                </div>
                <div className="card-features">
                  {features.slice(0, 5).map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      {feature.icon}
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="subscribe-btn"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                >
                  {subscribing === plan.id ? (
                    <>
                      <FiLoader className="spinning" /> Processing...
                    </>
                  ) : (
                    <>
                      <FiCreditCard /> Subscribe Now
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Features Grid */}
        <motion.div
          className="features-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>Everything you get with Premium</h2>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="feature-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <p>{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ/Trust Section */}
        <motion.div
          className="trust-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="trust-text">
            🔒 Secure payment powered by Stripe • Cancel anytime • 14-day money-back guarantee
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;