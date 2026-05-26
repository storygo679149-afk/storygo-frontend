import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import episodeService from '../services/episodeService';
import { useAudioContext } from '../context/AudioContext';
import useAuth from '../hooks/useAuth';
import apiService from '../services/api';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FiArrowLeft, FiLock } from 'react-icons/fi';
import './EpisodePlayer.css';

const EpisodePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playEpisode, currentEpisode, isPlaying, togglePlayPause, setAudioUrl } = useAudioContext();
  const { isAuthenticated } = useAuth();
  const [episode, setEpisode] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showAds, setShowAds] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const ep = await episodeService.getEpisodeById(id);
        if (cancelled) return;
        setEpisode(ep);
        // Check premium status
        if (ep.episode_number > 20 && isAuthenticated) {
          const { data: status } = await apiService.get('/payments/subscription/status');
          if (!status.is_premium) setIsLocked(true);
          else setShowAds(false);
        } else if (ep.episode_number > 20 && !isAuthenticated) {
          setIsLocked(true);
        } else {
          // Free users always see ads for any free episode
          setShowAds(!isAuthenticated || true); // will be updated after fetching premium
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (episode && !isLocked) {
      playEpisode(episode);
      // If free user, show ad before playing
      if (showAds) {
        // Play a mock ad audio (or insert ad logic)
        // e.g., setAudioUrl('/ads/ad_audio.mp3');
      }
    }
  }, [episode, isLocked]);

  if (loading) return <SkeletonLoader type="banner" />;
  if (!episode) return <p>Episode not found</p>;

  return (
    <div className="episode-player-page">
      <button onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>
      {isLocked ? (
        <div className="locked">
          <FiLock size={48} />
          <h2>This episode is locked</h2>
          <p>Subscribe to unlock all episodes after 20.</p>
          <button onClick={() => navigate('/subscription')}>Subscribe Now</button>
        </div>
      ) : (
        <>
          {showAds && <div className="ad-banner">Ad playing... (ad audio here)</div>}
          <div className="player-art">
            <img src={episode.thumbnail_url || episode.series_thumbnail} alt="" />
          </div>
          <h1>{episode.title}</h1>
          <p>{episode.series_title}</p>
          <button onClick={togglePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
        </>
      )}
    </div>
  );
};

export default EpisodePlayer;