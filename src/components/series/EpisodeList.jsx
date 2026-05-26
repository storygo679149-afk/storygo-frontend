import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiPlay, FiPlayCircle, FiCheckCircle, FiClock,
  FiLock, FiChevronDown, FiHeadphones
} from 'react-icons/fi';
import { formatDuration } from '../../utils/formatters';
import './EpisodeList.css';

const EpisodeList = ({ episodes = [], seriesId, isLoading = false, onPlayEpisode }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [expandedSeasons, setExpandedSeasons] = useState({});
  const [sortOrder, setSortOrder] = useState('asc');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      apiService.get('/payments/subscription/status')
        .then(res => setSubscription(res.data))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const groupedEpisodes = episodes.reduce((acc, episode) => {
    const season = episode.season_number || 1;
    if (!acc[season]) acc[season] = [];
    acc[season].push(episode);
    return acc;
  }, {});

  const seasons = Object.keys(groupedEpisodes).sort((a, b) => sortOrder === 'asc' ? a - b : b - a);

  const toggleSeason = (season) => {
    setExpandedSeasons(prev => ({ ...prev, [season]: !prev[season] }));
  };

  const handleEpisodeClick = async (episode) => {
    if (episode.episode_number <= 20) {
      if (onPlayEpisode) { onPlayEpisode(episode); }
      else { navigate(`/play/${episode.id}`); }
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to access premium episodes after episode 20.');
      return;
    }

    if (subscription && subscription.is_premium) {
      if (onPlayEpisode) { onPlayEpisode(episode); }
      else { navigate(`/play/${episode.id}`); }
      return;
    }

    toast.error('This episode requires a premium subscription. Subscribe for ₹40/month.');
  };

  const isLocked = (episode) => {
    if (episode.episode_number <= 20) return false;
    if (!isAuthenticated) return true;
    return !subscription || !subscription.is_premium;
  };

  const getProgressIndicator = (episode) => {
    if (episode.is_completed) return <FiCheckCircle className="episode-status completed" />;
    if (episode.user_progress && episode.user_progress > 0) {
      const percent = (episode.user_progress / episode.duration_seconds) * 100;
      return (
        <div className="episode-progress-bar">
          <div className="episode-progress-fill" style={{ width: `${percent}%` }} />
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="episode-list-loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="episode-skeleton">
            <div className="skeleton-number shimmer" />
            <div className="skeleton-content">
              <div className="skeleton-title shimmer" />
              <div className="skeleton-meta shimmer" />
            </div>
            <div className="skeleton-duration shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="episode-list-empty">
        <FiHeadphones size={40} />
        <h3>No episodes yet</h3>
        <p>Episodes will appear here once they are published</p>
      </div>
    );
  }

  return (
    <div className="episode-list-container">
      {seasons.length > 1 && (
        <div className="episode-sort-controls">
          <span className="episode-count">{episodes.length} Episode{episodes.length !== 1 ? 's' : ''}</span>
          <button className="sort-btn" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            Sort: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </button>
        </div>
      )}

      {seasons.length <= 1 ? (
        <div className="episode-items">
          {episodes
            .sort((a, b) => sortOrder === 'asc' ? a.episode_number - b.episode_number : b.episode_number - a.episode_number)
            .map((episode, index) => (
              <EpisodeItem
                key={episode.id}
                episode={episode}
                index={index}
                isAuthenticated={isAuthenticated}
                onClick={() => handleEpisodeClick(episode)}
                progressIndicator={getProgressIndicator(episode)}
                locked={isLocked(episode)}
              />
            ))}
        </div>
      ) : (
        <div className="episode-seasons">
          {seasons.map((season) => {
            const seasonEpisodes = groupedEpisodes[season];
            const isExpanded = expandedSeasons[season] !== false;
            return (
              <div key={season} className="episode-season">
                <button className="season-header" onClick={() => toggleSeason(season)}>
                  <div className="season-info">
                    <h3>Season {season}</h3>
                    <span className="season-episode-count">{seasonEpisodes.length} Episode{seasonEpisodes.length !== 1 ? 's' : ''}</span>
                  </div>
                  <motion.span className="season-toggle" animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <FiChevronDown />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div className="season-episodes" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      {seasonEpisodes
                        .sort((a, b) => sortOrder === 'asc' ? a.episode_number - b.episode_number : b.episode_number - a.episode_number)
                        .map((episode, index) => (
                          <EpisodeItem
                            key={episode.id}
                            episode={episode}
                            index={index}
                            isAuthenticated={isAuthenticated}
                            onClick={() => handleEpisodeClick(episode)}
                            progressIndicator={getProgressIndicator(episode)}
                            locked={isLocked(episode)}
                          />
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EpisodeItem = ({ episode, index, isAuthenticated, onClick, progressIndicator, locked }) => {
  return (
    <motion.div
      className={`episode-item ${locked ? 'locked' : ''}`}
      onClick={locked ? undefined : onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={!locked ? { x: 4 } : {}}
    >
      <div className="episode-number-section">
        <span className="episode-number">{episode.episode_number}</span>
        <button className="episode-play-btn">
          {locked ? <FiLock /> : <FiPlayCircle />}
        </button>
      </div>

      {progressIndicator && (
        <div className="episode-progress-indicator">{progressIndicator}</div>
      )}

      <div className="episode-info">
        <h4 className="episode-title">{episode.title}</h4>
        {episode.description && (
          <p className="episode-description">
            {episode.description.length > 100 ? `${episode.description.substring(0, 100)}...` : episode.description}
          </p>
        )}
        <div className="episode-meta">
          <span className="episode-meta-item">
            <FiClock size={12} /> {formatDuration(episode.duration_seconds)}
          </span>
          {episode.is_premium && <span className="premium-tag">PREMIUM</span>}
          {episode.play_count > 0 && (
            <span className="episode-meta-item">
              <FiHeadphones size={12} /> {episode.play_count.toLocaleString()}
            </span>
          )}
          {episode.publish_date && (
            <span className="episode-meta-item">{new Date(episode.publish_date).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <span className="episode-duration">{formatDuration(episode.duration_seconds)}</span>
    </motion.div>
  );
};

export default EpisodeList;