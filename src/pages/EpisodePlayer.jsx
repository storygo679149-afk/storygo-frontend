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

  const fetchEpisode = async () => {
    try {
      const ep = await episodeService.getEpisodeById(id);
      if (cancelled) return;

      setEpisode(ep);

      // Episodes after 20 are premium-locked
      if (ep.episode_number > 20) {
        if (!isAuthenticated) {
          // Not logged in → locked
          setIsLocked(true);
          setShowAds(false);
        } else {
          // Logged in → check subscription
          const { data: status } = await apiService.get('/payments/subscription/status');
          if (cancelled) return;

          if (status.is_premium) {
            setIsLocked(false);
            setShowAds(false); // premium → no ads, no lock
          } else {
            setIsLocked(true);
            setShowAds(false); // locked → don't show ads either
          }
        }
      } else {
        // Free episode (1-20)
        if (!isAuthenticated) {
          setShowAds(true);  // guest → show ads
        } else {
          // Check if premium
          const { data: status } = await apiService.get('/payments/subscription/status');
          if (cancelled) return;
          setShowAds(!status.is_premium); // premium → no ads, free → ads
        }
      }

    } catch (err) {
      console.error('EpisodePlayer fetch error:', err);
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  fetchEpisode();
  return () => { cancelled = true; };
}, [id, isAuthenticated]);

useEffect(() => {
  if (episode && !isLocked) {
    playEpisode(episode);
  }
}, [episode, isLocked, playEpisode]); // ✅ add playEpisode

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
