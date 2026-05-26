import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiPlay } from 'react-icons/fi';
import './SeriesCard.css';

const SeriesCard = ({ series, index = 0, badge }) => {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/series/${series.id}`);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    navigate(`/series/${series.id}`);
  };

  // Real author name only
  const authorName = series.creator_name || series.author_name || '';

  // Real genre tags (tags array → category name → nothing)
  const genreTags = (() => {
    if (series.tags?.length) {
      return series.tags
        .slice(0, 3)
        .map(t => (typeof t === 'string' ? t : t.name))
        .filter(Boolean);
    }
    if (series.category_name) return [series.category_name];
    return [];
  })();

  return (
    <motion.div
      className="cinematic-card"
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
    >
      <div className="card-bg" />

      {/* Top area */}
      <div className="card-top">
        <div className="card-thumb">
          {series.thumbnail_url ? (
            <img src={series.thumbnail_url} alt={series.title} loading="lazy" />
          ) : (
            <div className="card-thumb-placeholder">
              <span className="placeholder-icon">🎵</span>
            </div>
          )}
        </div>

        <div className="card-badge-now-playing">
          <span className="wave-icon">〰️</span>
          <span>Now Playing</span>
        </div>

        {badge && (
          <div className="card-custom-badge" style={{ backgroundColor: badge.color || '#FFD700' }}>
            {badge.text}
          </div>
        )}

        <button className="card-menu" onClick={(e) => e.stopPropagation()}>
          <span>…</span>
        </button>
      </div>

      {/* Glass panel */}
      <div className="card-glass-panel">
        <div className="card-text">
          <h3 className="card-title" title={series.title}>
            {series.title}
          </h3>
          {authorName && <p className="card-author">Author — {authorName}</p>}
        </div>

        <motion.button
          className="card-play-btn"
          onClick={handlePlayClick}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlay />
        </motion.button>

        {/* Bottom row – only genre tags, no likes */}
        {genreTags.length > 0 && (
          <div className="card-info-row">
            <span className="card-genres">🎵 {genreTags.join(' · ')}</span>
          </div>
        )}
      </div>

      <div className="play-pulse"></div>
    </motion.div>
  );
};

export default SeriesCard;