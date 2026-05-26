import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiHeadphones, FiUsers, FiBarChart2 } from 'react-icons/fi';
import userService from '../../services/userService';
import SkeletonLoader from '../common/SkeletonLoader';
import './Analytics.css';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getCreatorAnalytics();
      const analyticsData = res.data?.data || res.data;
      setData(analyticsData);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <SkeletonLoader type="text" count={3} />
        <SkeletonLoader type="card" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div className="analytics-error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <h3>{error}</h3>
        <button className="retry-btn" onClick={fetchAnalytics}>Retry</button>
      </motion.div>
    );
  }

  const totalPlays = data.seriesPlays.reduce((sum, s) => sum + (s.play_count || 0), 0);
  const maxPlayCount = Math.max(...data.weeklyPlays.map(w => w.play_count), 1);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05 } }),
  };

  return (
    <div className="analytics-page">
      <h2><FiBarChart2 style={{ marginRight: 10 }} /> Audience Analytics</h2>

      {/* Summary Cards */}
      <motion.div
        className="analytics-summary"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="summary-card" variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <FiHeadphones />
          <div>
            <h4>Total Plays</h4>
            <span>{totalPlays.toLocaleString()}</span>
          </div>
        </motion.div>
        <motion.div className="summary-card" variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <FiUsers />
          <div>
            <h4>Unique Listeners</h4>
            <span>{data.totalListeners}</span>
          </div>
        </motion.div>
        <motion.div className="summary-card" variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <FiTrendingUp />
          <div>
            <h4>Weekly Activity</h4>
            <span>Last 4 weeks</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Weekly Plays Bar Chart */}
      <motion.div
        className="chart-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3>Weekly Plays</h3>
        <div className="bar-chart">
          {data.weeklyPlays.map((week, i) => (
            <motion.div
              key={week.week_label}
              className="bar-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <span className="bar-value">{week.play_count}</span>
              <div className="bar" style={{ height: `${(week.play_count / maxPlayCount) * 150}px` }}>
                <motion.div
                  className="bar-fill"
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                />
              </div>
              <span className="bar-label">{week.week_label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top Episodes Table */}
      <motion.div
        className="chart-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Top Episodes</h3>
        {data.topEpisodes.length === 0 ? (
          <p className="no-data">No episodes yet.</p>
        ) : (
          <div className="episodes-table">
            <div className="table-header">
              <span>Episode</span>
              <span>Series</span>
              <span>Plays</span>
            </div>
            {data.topEpisodes.map((ep, i) => (
              <motion.div
                key={ep.id}
                className="table-row"
                custom={i}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <span className="ep-title">{ep.title}</span>
                <span className="series-title">{ep.series_title}</span>
                <span className="ep-plays">{ep.play_count.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Series Performance Bars */}
      <motion.div
        className="chart-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3>Series Performance</h3>
        <div className="series-list-analytics">
          {data.seriesPlays.map((series, i) => (
            <motion.div
              key={series.id}
              className="series-item-analytics"
              custom={i}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <span className="series-name">{series.title}</span>
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${series.play_count > 0 ? (series.play_count / Math.max(totalPlays ?? 1, 1)) * 100 : 0}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                />
              </div>
              <span className="series-plays">{(series.play_count || 0).toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;