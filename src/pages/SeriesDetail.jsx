import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import seriesService from '../services/seriesService';
import { useAudioContext } from '../context/AudioContext';
import useAuth from '../hooks/useAuth';
import SkeletonLoader from '../components/common/SkeletonLoader';
import {
  FiPlay, FiHeart, FiShare2, FiBookmark, FiChevronLeft,
  FiHeadphones, FiClock, FiStar, FiUser, FiCheckCircle,
  FiGlobe, FiMusic, FiPlayCircle, FiPauseCircle
} from 'react-icons/fi';
import { formatDuration, formatCompactNumber } from '../utils/formatters';
import toast from 'react-hot-toast';
import './SeriesDetail.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const trackVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: i => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, type: 'spring', stiffness: 120 }
  }),
  hover: { scale: 1.01, backgroundColor: 'rgba(255,255,255,0.06)', transition: { duration: 0.2 } }
};

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { playPlaylist, currentEpisode, isPlaying } = useAudioContext();

  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const episodeListRef = useRef(null);
  const episodeRefs = useRef({});

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [seriesResp, episodesResp] = await Promise.all([
          seriesService.getSeriesById(id),
          seriesService.getSeriesEpisodes(id, { limit: 200 })
        ]);
        if (cancelled) return;
        const seriesData = seriesResp.data?.series || seriesResp.data?.data?.series || null;
        const episodesData = episodesResp.data?.episodes || episodesResp.data?.data?.episodes || [];
        if (!seriesData) throw new Error('Series not found');
        setSeries(seriesData);
        setEpisodes(episodesData);
        setIsLiked(seriesData.is_liked === true);
        setIsBookmarked(seriesData.is_bookmarked === true);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load series');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const filteredEpisodes = useMemo(() => {
    if (!searchTerm.trim()) return episodes;
    const q = searchTerm.toLowerCase();
    return episodes.filter(ep => ep.title.toLowerCase().includes(q));
  }, [episodes, searchTerm]);

  // Safe number parsing
  const totalDuration = episodes.reduce((acc, ep) => acc + (Number(ep.duration_seconds) || 0), 0);
  const author = series?.creator_name || series?.author_name || 'Unknown Creator';
  const likes = Number(series?.like_count) || 0;
  const plays = Number(series?.play_count) || 0;
  const avgRating = Number(series?.average_rating) || 0;
  const ratingCount = Number(series?.rating_count) || 0;

  const maxDuration = episodes.length > 0 
    ? Math.max(...episodes.map(e => e.duration_seconds || 0), 1) 
    : 1;
  const maxPlayCount = episodes.length > 0 
    ? Math.max(...episodes.map(e => e.play_count || 0), 1) 
    : 1;

  const handlePlayAll = () => {
    if (episodes.length > 0) {
      playPlaylist(episodes, 0);
      toast.success('Playing all episodes');
    }
  };

  const handlePlayEpisode = (episode, index) => {
    playPlaylist(episodes, index);
  };

  const scrollToEpisode = (episodeId) => {
    const episodeElement = episodeRefs.current[episodeId];
    if (episodeElement) {
      episodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const episode = episodes.find(ep => ep.id === episodeId);
      if (episode) {
        const idx = episodes.findIndex(e => e.id === episodeId);
        handlePlayEpisode(episode, idx);
      }
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      await seriesService.toggleLike(id);
      setIsLiked(!isLiked);
      toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
    } catch { toast.error('Failed'); }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      await seriesService.toggleBookmark(id);
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'Bookmark removed' : 'Bookmarked');
    } catch { toast.error('Failed'); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: series?.title, text: series?.description, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  if (isLoading) {
    return (
      <div className="series-detail-loading">
        <SkeletonLoader type="banner" />
        <SkeletonLoader type="episode" count={6} />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="series-detail-error">
        <h2>{error || 'Series not found'}</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="series-detail-page">
      <div className="series-detail-container">
        {/* Back button */}
        <motion.button
          className="back-btn"
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05, x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiChevronLeft />
        </motion.button>

        {/* Hero section – Cover + Details */}
        <div className="series-hero">
          <motion.div
            className="series-cover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
          >
            {series.thumbnail_url ? (
              <img src={series.thumbnail_url} alt={series.title} />
            ) : (
              <div className="cover-placeholder"><FiMusic size={48} /></div>
            )}
            <div className="cover-glow" />
          </motion.div>

          <motion.div
            className="series-info"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h1 className="series-title">{series.title}</h1>
            <div className="series-meta">
              <span className="series-author">
                <FiUser /> {author}
                {series.is_verified && <FiCheckCircle className="verified-icon" />}
              </span>
              <div className="series-stats">
                <span><FiHeadphones /> {formatCompactNumber(plays)}</span>
                <span><FiHeart /> {formatCompactNumber(likes)}</span>
                {avgRating > 0 && <span><FiStar /> {avgRating.toFixed(1)} ({ratingCount})</span>}
              </div>
            </div>

            <div className="series-description-wrapper">
              <p className={`series-description ${showFullDescription ? 'expanded' : ''}`}>
                {series.description || 'No description available.'}
              </p>
              {series.description?.length > 200 && (
                <button className="read-more-btn" onClick={() => setShowFullDescription(!showFullDescription)}>
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            <div className="series-actions">
              <motion.button
                className="play-all-btn"
                onClick={handlePlayAll}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiPlay /> Play All
              </motion.button>
              <motion.button
                className={`action-btn ${isLiked ? 'active' : ''}`}
                onClick={handleLike}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiHeart />
              </motion.button>
              <motion.button
                className={`action-btn ${isBookmarked ? 'active' : ''}`}
                onClick={handleBookmark}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiBookmark />
              </motion.button>
              <motion.button
                className="action-btn"
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiShare2 />
              </motion.button>
            </div>

            <div className="series-tags">
              {series.category_name && <span className="tag">{series.category_name}</span>}
              {series.language && <span className="tag"><FiGlobe /> {series.language.toUpperCase()}</span>}
              {series.status && <span className="tag status">{series.status}</span>}
              {series.is_premium && <span className="tag premium">⭐ Premium</span>}
            </div>
          </motion.div>
        </div>

        {/* MINI EPISODE MAP */}
        {episodes.length > 0 && (
          <div className="episode-mini-map">
            <h3 className="mini-map-title">Episode Map</h3>
            <div className="mini-map-timeline">
              {episodes.map((episode) => {
                const widthPercent = ((episode.duration_seconds || 0) / maxDuration) * 100;
                const intensity = 0.2 + ((episode.play_count || 0) / maxPlayCount) * 0.8;
                return (
                  <div
                    key={episode.id}
                    className="mini-map-segment"
                    style={{
                      width: `${Math.max(2, widthPercent)}%`,
                      backgroundColor: `rgba(139, 92, 246, ${intensity})`,
                    }}
                    onClick={() => scrollToEpisode(episode.id)}
                    title={`Episode ${episode.episode_number}: ${episode.title} (${formatDuration(episode.duration_seconds)})`}
                  >
                    <span className="segment-number">{episode.episode_number}</span>
                  </div>
                );
              })}
            </div>
            <div className="mini-map-labels">
              <span>⬅️ Earlier</span>
              <span>Later ➡️</span>
            </div>
          </div>
        )}

        {/* Episodes header */}
        <div className="episodes-header">
          <h2>Episodes</h2>
          <div className="episode-count">{episodes.length} episodes • {Math.floor(totalDuration / 60)} min total</div>
          <div className="episode-search">
            <input
              type="text"
              placeholder="Search episodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="episode-search-input"
            />
          </div>
        </div>

        {/* Episode list */}
        <div className="episodes-list" ref={episodeListRef}>
          <AnimatePresence>
            {filteredEpisodes.length === 0 ? (
              <div className="no-episodes">No episodes found.</div>
            ) : (
              filteredEpisodes.map((episode, idx) => {
                const isActive = currentEpisode?.id === episode.id;
                return (
                  <motion.div
                    key={episode.id}
                    ref={el => episodeRefs.current[episode.id] = el}
                    className={`episode-item ${isActive ? 'active' : ''}`}
                    custom={idx}
                    variants={trackVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    onClick={() => handlePlayEpisode(episode, idx)}
                  >
                    <div className="episode-number">{episode.episode_number}</div>
                    <div className="episode-thumb">
                      {episode.thumbnail_url ? (
                        <img src={episode.thumbnail_url} alt={episode.title} />
                      ) : (
                        <FiMusic />
                      )}
                    </div>
                    <div className="episode-info">
                      <div className="episode-title">{episode.title}</div>
                      <div className="episode-meta">
                        <span><FiClock size={12} /> {formatDuration(episode.duration_seconds)}</span>
                        <span><FiHeadphones size={12} /> {formatCompactNumber(episode.play_count || 0)}</span>
                      </div>
                    </div>
                    <div className="episode-play">
                      {isActive && isPlaying ? (
                        <FiPauseCircle className="playing-icon" />
                      ) : (
                        <FiPlayCircle className="play-icon" />
                      )}
                    </div>
                    {isActive && <div className="now-playing-indicator">Now Playing</div>}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;