import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiHeart } from 'react-icons/fi';
import './SeriesCard.css';

const SeriesCard = ({ series, index = 0, badge }) => {
  const navigate = useNavigate();

  const handleClick = () => navigate(`/series/${series.id}`);
  const handlePlayClick = (e) => {
    e.stopPropagation();
    navigate(`/series/${series.id}`);
  };

  // ---------- REAL DATA ONLY (no fallbacks) ----------

  // Author: only use creator_name or author_name – no hardcoded name
  const authorName = series.creator_name || series.author_name || '';

  // Genre tags: prefer tags array, else category name, else nothing
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

  // Like count: only show if it's a valid number > 0
  const likeCount = typeof series.like_count === 'number' ? series.like_count : 0;
  const showLikes = likeCount > 0;
  const formattedLikes = showLikes
    ? likeCount >= 1000
      ? (likeCount / 1000).toFixed(1) + 'K'
      : likeCount
    : null;

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

        {/* "Now Playing" badge */}
        <div className="card-badge-now-playing">
          <span className="wave-icon">〰️</span>
          <span>Now Playing</span>
        </div>

        {/* Custom badge (if any) */}
        {badge && (
          <div
            className="card-custom-badge"
            style={{ backgroundColor: badge.color || '#FFD700' }}
          >
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

          {/* Author – only if there's a real name */}
          {authorName && (
            <p className="card-author">Author — {authorName}</p>
          )}
        </div>

        {/* Play button */}
        <motion.button
          className="card-play-btn"
          onClick={handlePlayClick}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlay />
        </motion.button>

        {/* Bottom row – only shows if we have real data */}
        {(showLikes || genreTags.length > 0) && (
          <div className="card-info-row">
            {showLikes && (
              <span className="card-likes">
                <FiHeart className="heart-icon" />
                {formattedLikes}
              </span>
            )}
            {genreTags.length > 0 && (
              <span className="card-genres">
                🎵 {genreTags.join(' · ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Pulse glow */}
      <div className="play-pulse"></div>
    </motion.div>
  );
};

export default SeriesCard;