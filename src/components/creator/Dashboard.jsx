// src/components/creator/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import seriesService from '../../services/seriesService';
import userService from '../../services/userService';
import SkeletonLoader from '../common/SkeletonLoader';
import Analytics from './Analytics';
import {
  FiPlus, FiBookOpen, FiHeadphones, FiUsers,
  FiTrendingUp, FiEdit, FiAlertCircle,
  FiBarChart2, FiActivity, FiMic, FiExternalLink
} from 'react-icons/fi';   // Added FiMic, FiExternalLink
import toast from 'react-hot-toast';
import './Dashboard.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [recentSeries, setRecentSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeContentTab, setActiveContentTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, seriesRes] = await Promise.all([
        userService.getCreatorStats(),
        seriesService.getMySeries({ limit: 5 })
      ]);

      const statsData = statsRes.data?.data?.stats || statsRes.data?.stats || {};
      setStats(statsData);

      const seriesList = seriesRes.data?.data?.series || seriesRes.data?.series || [];
      setRecentSeries(seriesList);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Failed to load dashboard');
      toast.error('Dashboard load failed');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Series', value: stats?.series_count || 0, icon: <FiBookOpen />, color: '#ff6b6b' },
    { label: 'Total Episodes', value: stats?.episodes_count || 0, icon: <FiHeadphones />, color: '#1e90ff' },
    { label: 'Total Plays', value: stats?.total_plays || 0, icon: <FiTrendingUp />, color: '#2ed573' },
    { label: 'Followers', value: stats?.followers_count || 0, icon: <FiUsers />, color: '#ffa502' }
  ];

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <SkeletonLoader type="banner" />
        <SkeletonLoader type="card" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div className="dashboard-error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <FiAlertCircle size={48} />
        <h2>{error}</h2>
        <button onClick={fetchDashboardData} className="retry-btn">Try Again</button>
      </motion.div>
    );
  }

  return (
    <div className="creator-dashboard">
      {/* Welcome Section */}
      <motion.div
        className="dashboard-welcome"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="welcome-content">
          <div className="welcome-text">
            <h1>Welcome back, {user?.full_name || user?.username}!</h1>
            <p>Manage your content and track your audience growth</p>
          </div>
          <div className="welcome-actions">
            <motion.button
              className="create-series-btn"
              onClick={() => navigate('/creator/series/new')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiPlus /> Create New Series
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tab Switcher - Now with TTS tab */}
      <div className="dashboard-tabs">
        {[
          { key: 'overview', label: 'Overview', icon: <FiActivity /> },
          { key: 'analytics', label: 'Analytics', icon: <FiBarChart2 /> },
          { key: 'tts', label: 'TTS Tool', icon: <FiMic /> }   // <-- Added TTS tab
        ].map(tab => (
          <motion.button
            key={tab.key}
            className={`dash-tab ${activeContentTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveContentTab(tab.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.icon} {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Animated Content */}
      <AnimatePresence mode="wait">
        {activeContentTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stat Cards */}
            <motion.div
              className="stats-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {statCards.map(stat => (
                <motion.div
                  key={stat.label}
                  className="stat-card"
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                >
                  <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{(stat.value || 0).toLocaleString()}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Recent Series */}
            <motion.div
              className="recent-series"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="section-header">
                <h2 className="section-title">Recent Series</h2>
                <Link to="/creator/series" className="view-all">View All</Link>
              </div>
              {recentSeries.length === 0 ? (
                <motion.div
                  className="empty-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <FiBookOpen size={48} />
                  <h3>No series yet</h3>
                  <p>Create your first series to start sharing your stories</p>
                  <motion.button
                    className="create-first-btn"
                    onClick={() => navigate('/creator/series/new')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Create Your First Series
                  </motion.button>
                </motion.div>
              ) : (
                <div className="series-list">
                  {recentSeries.map((series, index) => (
                    <motion.div
                      key={series.id}
                      className="series-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.06)' }}
                      onClick={() => navigate(`/creator/series/${series.id}`)}
                    >
                      <div className="series-thumb">
                        {series.thumbnail_url ? (
                          <img src={series.thumbnail_url} alt={series.title} />
                        ) : (
                          <div className="series-thumb-placeholder"><FiBookOpen /></div>
                        )}
                      </div>
                      <div className="series-info">
                        <h3>{series.title}</h3>
                        <div className="series-meta">
                          <span><FiHeadphones size={14} /> {series.total_episodes || 0} Episodes</span>
                          <span><FiTrendingUp size={14} /> {series.play_count || 0} Plays</span>
                        </div>
                        <span className={`series-status ${series.status}`}>{series.status || 'ongoing'}</span>
                      </div>
                      <motion.button
                        className="series-edit-btn"
                        onClick={(e) => { e.stopPropagation(); navigate(`/creator/series/${series.id}/edit`); }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiEdit />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : activeContentTab === 'analytics' ? (
          /* Analytics Tab */
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <Analytics />
          </motion.div>
        ) : (
          /* TTS Tab Content */
          <motion.div
            key="tts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="tts-tab-content"
          >
            <div className="tts-card">
              <div className="tts-icon">
                <FiMic size={48} />
              </div>
              <h2>Text-to-Speech Generator</h2>
              <p>
                Use our integrated TTS tool to create high-quality voiceovers for your episodes.
                Generate natural-sounding audio in multiple languages and voices.
              </p>
              <a
                href="https://ttsmp3.com"
                target="_blank"
                rel="noopener noreferrer"
                className="tts-external-button"
              >
                Open TTS Tool <FiExternalLink />
              </a>
              <small>Opens in a new tab. Free to use with premium voices available.</small>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;