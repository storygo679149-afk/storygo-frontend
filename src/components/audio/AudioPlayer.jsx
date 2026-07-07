import React, { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioContext } from '../../context/AudioContext';
import useAuth from '../../hooks/useAuth';
import episodeService from '../../services/episodeService';
import Comments from '../comments/Comments';
import PlaybackControls from './PlaybackControls';
import SeekBar from './SeekBar';
import SpeedControl from './SpeedControl';
import { formatTime, formatDuration } from '../../utils/formatters';
import {
  FiX, FiMinimize2, FiMaximize2, FiHeart, FiBookmark,
  FiList, FiMessageSquare, FiPlay
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AudioPlayer.css';

const AudioPlayer = () => {
  const {
    currentEpisode,
    isPlaying,
    isMinimized,
    progress,
    duration,
    playbackSpeed,
    isBuffering,
    volume,
    queue,
    queueIndex,
    playlist,
    playNextEpisode,
    playPreviousEpisode,
    setCurrentEpisode,
    setIsPlaying,
    setIsMinimized,
    setProgress,
    setDuration,
    setPlaybackSpeed,
    setIsBuffering,
    setVolume,
  } = useAudioContext();

  const { user } = useAuth();
  const audioRef = useRef(null);
  const hlsRef = useRef(null);
  const progressInterval = useRef(null);
  const saveInterval = useRef(null);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [chapters, setChapters] = useState([]);

  // UI tab state (nowplaying, upnext, comments)
  const [activeTab, setActiveTab] = useState('nowplaying');

  // Initialize audio element and events
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
      audioRef.current.addEventListener('loadstart', () => setIsBuffering(true));
      audioRef.current.addEventListener('canplay', () => setIsBuffering(false));
      audioRef.current.addEventListener('waiting', () => setIsBuffering(true));
      audioRef.current.addEventListener('playing', () => setIsBuffering(false));
      audioRef.current.addEventListener('ended', handleEpisodeEnd);
      audioRef.current.addEventListener('error', handleAudioError);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
      }
      clearInterval(progressInterval.current);
      clearInterval(saveInterval.current);
    };
  }, []);

  // Load episode when it changes
  useEffect(() => {
    if (currentEpisode && audioRef.current) {
      loadEpisode();
    }
  }, [currentEpisode?.id]);

  // Fetch chapters
  useEffect(() => {
    if (currentEpisode?.id) {
      episodeService.getChapters(currentEpisode.id)
        .then(res => setChapters(res.data?.data?.chapters || []))
        .catch(() => setChapters([]));
    } else {
      setChapters([]);
    }
  }, [currentEpisode?.id]);

  // Play/pause
  useEffect(() => {
    if (!audioRef.current || !currentEpisode) return;
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Playback error:', error);
          toast.error('Failed to play audio');
          setIsPlaying(false);
        });
      }
      startProgressTracking();
    } else {
      audioRef.current.pause();
      stopProgressTracking();
    }
  }, [isPlaying]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = playbackSpeed; }, [playbackSpeed]);

  useEffect(() => {
    if (isPlaying && user && currentEpisode) {
      saveInterval.current = setInterval(() => saveProgress(), 5000);
    }
    return () => { if (saveInterval.current) clearInterval(saveInterval.current); };
  }, [isPlaying, user, currentEpisode]);

  const loadEpisode = async () => {
    try {
      setIsBuffering(true);

      // Tear down any previous hls.js instance (from earlier HLS attempt) --
      // no longer used, but harmless to keep clearing just in case.
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // audio_url is a plain, short-lived signed MP3 stream link through
      // our own backend proxy -- no HLS/hls.js needed.
      audioRef.current.src = currentEpisode.audio_url;
      audioRef.current.load();

      if (user) {
        try {
         const res = await episodeService.checkBookmark(currentEpisode.id);
setIsBookmarked(res.data?.data?.is_bookmarked || false);

        } catch (err) {
          console.log('Bookmark check failed');
          setIsBookmarked(false);
        }
      }

      if (currentEpisode.user_progress && currentEpisode.user_progress > 0) {
        audioRef.current.currentTime = currentEpisode.user_progress;
        setCurrentTime(currentEpisode.user_progress);
      }
      if (currentEpisode.user_playback_speed) {
        setPlaybackSpeed(currentEpisode.user_playback_speed);
      }
    } catch (error) {
      console.error('Error loading episode:', error);
      if (error.response?.status !== 404) toast.error('Failed to load episode');
    } finally {
      setIsBuffering(false);
    }
  };

  const handleLoadedMetadata = () => {
    const audioDuration = audioRef.current.duration;
    if (audioDuration && isFinite(audioDuration)) setDuration(audioDuration);
    setIsBuffering(false);
  };

  const handleAudioError = (error) => {
    console.error('Audio error:', error);
    setIsBuffering(false);
    setIsPlaying(false);
    toast.error('Error playing audio. Please try again.');
  };

  const handleEpisodeEnd = () => {
    stopProgressTracking();
    setIsPlaying(false);
    saveProgress(true);
    playNextEpisode();
  };

  const startProgressTracking = () => {
    if (progressInterval.current) return;
    progressInterval.current = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        const pos = audioRef.current.currentTime;
        setCurrentTime(pos);
        setProgress(pos);
      }
    }, 250);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const saveProgress = useCallback(async (completed = false) => {
    if (!user || !currentEpisode || !audioRef.current) return;
    try {
      await episodeService.updateProgress(
        currentEpisode.id,
        Math.floor(audioRef.current.currentTime),
        playbackSpeed,
        completed
      );
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [user, currentEpisode, playbackSpeed]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      setProgress(time);
    }
  };
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    setShowSpeedControl(false);
    toast.success(`Speed: ${speed}x`);
  };
  const handleVolumeChange = (newVolume) => setVolume(newVolume);

  const handleBookmark = async () => {
    if (!user) { toast.error('Please login to bookmark'); return; }
    try {
      await episodeService.toggleBookmark(currentEpisode.id);
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'Bookmark removed' : 'Bookmarked');
    } catch (error) { toast.error('Failed to toggle bookmark'); }
  };

  const handleLike = async () => {
    if (!user) { toast.error('Please login to like'); return; }
    try {
      await episodeService.toggleLike(currentEpisode.series_id);
      setIsLiked(!isLiked);
      toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
    } catch (error) { toast.error('Failed to like'); }
  };

  const handleClose = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    setCurrentEpisode(null);
  };

  const toggleMinimize = () => setIsMinimized(!isMinimized);

  const jumpToChapter = (startSeconds) => handleSeek(startSeconds);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Get up-next list: playlist episodes after current, or queue
  const getUpNext = () => {
    const list = [];
    if (playlist && playlist.episodes && queueIndex >= 0) {
      for (let i = queueIndex + 1; i < playlist.episodes.length; i++) {
        list.push(playlist.episodes[i]);
      }
    }
    if (list.length === 0 && queue.length > 0 && queueIndex >= 0) {
      for (let i = queueIndex + 1; i < queue.length; i++) {
        list.push(queue[i]);
      }
    }
    return list.slice(0, 5);
  };

  if (!currentEpisode) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`audio-player ${isMinimized ? 'minimized' : 'expanded'}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Progress bar with chapter markers */}
        <div className="player-progress-bar" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          handleSeek(percent * duration);
        }}>
          <div className="player-progress-fill" style={{ width: `${progressPercent}%` }} />
          {chapters.map((ch, idx) => {
            const leftPercent = duration > 0 ? (ch.start_time_seconds / duration) * 100 : 0;
            if (leftPercent > 100 || leftPercent < 0) return null;
            return (
              <div
                key={ch.id || idx}
                className="chapter-marker"
                title={ch.title}
                style={{ left: `${leftPercent}%` }}
                onClick={(e) => { e.stopPropagation(); jumpToChapter(ch.start_time_seconds); }}
              />
            );
          })}
        </div>

        {!isMinimized && (
          <motion.div className="player-expanded-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header */}
            <div className="player-header">
              <button className="player-action-btn" onClick={toggleMinimize}><FiMinimize2 /></button>
              <span className="player-title">Now Playing</span>
              <button className="player-action-btn" onClick={handleClose}><FiX /></button>
            </div>

            {/* Episode info */}
            <div className="player-episode-info">
              {currentEpisode.thumbnail_url && (
                <motion.img
                  src={currentEpisode.thumbnail_url}
                  alt={currentEpisode.title}
                  className="player-thumbnail"
                  animate={{ scale: isPlaying ? 1 : 0.95 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <h3 className="player-episode-title">{currentEpisode.title}</h3>
              <p className="player-series-title">{currentEpisode.series_title}</p>
            </div>

            {/* Seek bar */}
            <SeekBar currentTime={currentTime} duration={duration} onSeek={handleSeek} buffered={0} />

            {/* Playback controls */}
            <PlaybackControls
              isPlaying={isPlaying}
              isBuffering={isBuffering}
              onPlayPause={handlePlayPause}
              onNext={playNextEpisode}
              onPrevious={playPreviousEpisode}
              onVolumeChange={handleVolumeChange}
              volume={volume}
            />

            {/* Tabs */}
            <div className="player-tabs">
              <button
                className={`player-tab ${activeTab === 'nowplaying' ? 'active' : ''}`}
                onClick={() => setActiveTab('nowplaying')}
              >
                Now Playing
              </button>
              <button
                className={`player-tab ${activeTab === 'upnext' ? 'active' : ''}`}
                onClick={() => setActiveTab('upnext')}
              >
                <FiList /> Up Next
              </button>
              <button
                className={`player-tab ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                <FiMessageSquare /> Comments
              </button>
            </div>

            {/* Tab content */}
            <div className="player-tab-content">
              {activeTab === 'nowplaying' && (
                <div className="player-actions">
                  <button className={`player-action-btn ${isLiked ? 'active' : ''}`} onClick={handleLike}>
                    <FiHeart /> <span>Like</span>
                  </button>
                  <button className={`player-action-btn ${isBookmarked ? 'active' : ''}`} onClick={handleBookmark}>
                    <FiBookmark /> <span>Bookmark</span>
                  </button>
                  <div className="speed-control-wrapper">
                    <button className="player-action-btn" onClick={() => setShowSpeedControl(!showSpeedControl)}>
                      <span>{playbackSpeed}x</span>
                    </button>
                    {showSpeedControl && (
                      <SpeedControl
                        currentSpeed={playbackSpeed}
                        onSpeedChange={handleSpeedChange}
                        onClose={() => setShowSpeedControl(false)}
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'upnext' && (
                <div className="upnext-list">
                  {getUpNext().length === 0 ? (
                    <p className="upnext-empty">No upcoming episodes</p>
                  ) : (
                    getUpNext().map(ep => (
                      <div key={ep.id} className="upnext-item" onClick={() => {
                        if (ep.id === currentEpisode.id) return;
                        setCurrentEpisode(ep);
                        setIsPlaying(true);
                        setActiveTab('nowplaying');
                      }}>
                        <img src={ep.thumbnail_url || '/placeholder.jpg'} alt="" className="upnext-thumb" />
                        <div className="upnext-info">
                          <p className="upnext-title">{ep.title}</p>
                          <p className="upnext-meta">Ep {ep.episode_number} • {formatDuration(ep.duration_seconds)}</p>
                        </div>
                        <button className="play-btn-sm"><FiPlay /></button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="player-comments">
                  <Comments episodeId={currentEpisode.id} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Minimized view */}
        {isMinimized && (
          <motion.div className="player-minimized-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="minimized-info">
              <img src={currentEpisode.thumbnail_url || '/default-thumbnail.png'} alt="" className="minimized-thumb" />
              <div className="minimized-text">
                <p className="minimized-title">{currentEpisode.title}</p>
                <p className="minimized-series">{currentEpisode.series_title}</p>
              </div>
            </div>
            <div className="minimized-controls">
              <button className={`play-btn-sm ${isPlaying ? 'playing' : ''}`} onClick={handlePlayPause} disabled={isBuffering}>
                {isBuffering ? <div className="mini-spinner" /> : isPlaying ? '❚❚' : '▶'}
              </button>
              <button className="player-action-btn" onClick={toggleMinimize}><FiMaximize2 /></button>
              <button className="player-action-btn" onClick={handleClose}><FiX /></button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioPlayer;
