import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import seriesService from '../services/seriesService';
import SeriesCard from '../components/series/SeriesCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FiZap, FiTrendingUp, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import './NewReleases.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const NewReleases = () => {
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('week'); // week, month, all

  useEffect(() => {
    fetchNewReleases();
  }, [timeframe]);

  const fetchNewReleases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let sortParam = 'latest';
      let limit = 50;
      const response = await seriesService.getAllSeries({ sort: sortParam, limit });
      const seriesList = response?.data?.data?.series || response?.data?.series || [];
      setSeries(seriesList);
    } catch (err) {
      console.error('Failed to fetch new releases:', err);
      setError('Failed to load new releases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeframeLabel = () => {
    switch(timeframe) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Time';
    }
  };

  if (isLoading) {
    return (
      <div className="new-releases-page">
        <div className="new-releases-header">
          <h1>🆕 New Releases</h1>
          <p>Freshly uploaded series and episodes</p>
        </div>
        <div className="new-releases-grid">
          <SkeletonLoader type="card" count={12} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="new-releases-page">
        <div className="new-releases-header">
          <h1>🆕 New Releases</h1>
          <p>Freshly uploaded series and episodes</p>
        </div>
        <div className="error-state">
          <FiAlertCircle size={48} />
          <p>{error}</p>
          <button onClick={fetchNewReleases} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="new-releases-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="new-releases-container">
        {/* Header Section */}
        <div className="new-releases-header">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FiZap className="header-icon" /> New Releases
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Freshly uploaded series and episodes
          </motion.p>
        </div>

        {/* Timeframe Filters */}
        <motion.div
          className="timeframe-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            className={`filter-chip ${timeframe === 'week' ? 'active' : ''}`}
            onClick={() => setTimeframe('week')}
          >
            <FiCalendar /> This Week
          </button>
          <button
            className={`filter-chip ${timeframe === 'month' ? 'active' : ''}`}
            onClick={() => setTimeframe('month')}
          >
            <FiTrendingUp /> This Month
          </button>
          <button
            className={`filter-chip ${timeframe === 'all' ? 'active' : ''}`}
            onClick={() => setTimeframe('all')}
          >
            <FiZap /> All Time
          </button>
        </motion.div>

        {/* Stats Badge */}
        <motion.div
          className="releases-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="stat-badge">{series.length} new series</span>
          <span className="stat-badge">{getTimeframeLabel()}</span>
        </motion.div>

        {/* Series Grid */}
        {series.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FiZap size={56} />
            <h3>No new releases yet</h3>
            <p>Check back soon for fresh content</p>
          </motion.div>
        ) : (
          <motion.div
            className="new-releases-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {series.map((item, idx) => (
              <motion.div key={item.id} variants={itemVariants}>
                <SeriesCard series={item} index={idx} badge={{ text: 'New', color: '#10B981' }} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default NewReleases;