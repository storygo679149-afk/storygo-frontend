import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import { formatDuration, formatTimeAgo } from '../../utils/formatters';
import { FiPlay, FiClock, FiChevronRight, FiHeadphones } from 'react-icons/fi';
import SkeletonLoader from '../common/SkeletonLoader';
import './ContinueListening.css';

const ContinueListening = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchListeningHistory();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchListeningHistory = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getListeningHistory({ limit: 10 });
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching listening history:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueListening = (item) => {
    navigate(`/play/${item.episode_id}`);
  };

  const handleViewAll = () => {
    navigate('/history');
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="continue-listening-section">
        <div className="section-header">
          <h2 className="section-title">
            <FiClock />
            Continue Listening
          </h2>
        </div>
        <div className="continue-listening-grid">
          <SkeletonLoader type="card" count={4} />
        </div>
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <motion.div
      className="continue-listening-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <FiClock />
          Continue Listening
        </h2>
        <button className="view-all-btn" onClick={handleViewAll}>
          View History
          <FiChevronRight />
        </button>
      </div>

      {/* Horizontal Scroll */}
      <div className="continue-listening-scroll">
        {history.map((item, index) => {
          const progressPercent = item.duration_seconds > 0 
            ? (item.progress_seconds / item.duration_seconds) * 100 
            : 0;
          
          return (
            <motion.div
              key={item.id}
              className="continue-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => handleContinueListening(item)}
            >
              {/* Thumbnail */}
              <div className="continue-thumbnail">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.series_title} loading="lazy" />
                ) : (
                  <div className="continue-thumb-placeholder">
                    <FiHeadphones size={24} />
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="continue-play-overlay">
                  <FiPlay />
                </div>

                {/* Progress Bar */}
                <div className="continue-progress-bar">
                  <div 
                    className="continue-progress-fill" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>

              {/* Content */}
              <div className="continue-content">
                <h4 className="continue-episode-title">{item.episode_title}</h4>
                <p className="continue-series-title">{item.series_title}</p>
                <div className="continue-meta">
                  <span className="continue-progress-text">
                    {item.is_completed ? (
                      <span className="completed-badge">Completed ✓</span>
                    ) : (
                      `${formatDuration(item.progress_seconds)} / ${formatDuration(item.duration_seconds)}`
                    )}
                  </span>
                  <span className="continue-timestamp">
                    {formatTimeAgo(item.updated_at)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ContinueListening;
