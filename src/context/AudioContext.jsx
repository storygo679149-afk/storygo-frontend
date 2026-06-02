import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import episodeService from '../services/episodeService';
import { useAuthContext } from './AuthContext';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  
  // Audio State
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('audioVolume');
    return saved ? parseFloat(saved) : 0.7;
  });
  
  // Queue
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [playlist, setPlaylist] = useState(null); // { seriesId, episodes[] }

 const audioRef = useRef(null);
 const saveIntervalRef = useRef(null);
 
 useEffect(() => {
   if (isPlaying && currentEpisode && isAuthenticated) {
     saveIntervalRef.current = setInterval(() => { saveProgress(); }, 5000);
   }
   return () => clearInterval(saveIntervalRef.current);
 }, [isPlaying, currentEpisode, isAuthenticated]);
 
 const saveProgress = useCallback(async () => {
   if (!currentEpisode || !isAuthenticated || !audioRef.current) return;
   ...
 }, [currentEpisode, isAuthenticated, playbackSpeed]);


  // Play an episode
  const playEpisode = useCallback((episode, playlistData = null) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
    setIsMinimized(true);
    setProgress(episode.user_progress || 0);

    if (playlistData) {
      setPlaylist(playlistData);
      const index = playlistData.episodes.findIndex(ep => ep.id === episode.id);
      setQueueIndex(index);
    }
  }, []);

  // Play playlist
  const playPlaylist = useCallback((episodes, startIndex = 0) => {
    if (!episodes || episodes.length === 0) return;

    setQueue(episodes);
    setQueueIndex(startIndex);
    playEpisode(episodes[startIndex], { episodes });
  }, [playEpisode]);

  // Play next episode
  const playNextEpisode = useCallback(() => {
    if (playlist && playlist.episodes && queueIndex < playlist.episodes.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      playEpisode(playlist.episodes[nextIndex], playlist);
    } else if (queue.length > 0 && queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      playEpisode(queue[nextIndex]);
    } else {
      setIsPlaying(false);
    }
  }, [playlist, queue, queueIndex, playEpisode]);

  // Play previous episode
  const playPreviousEpisode = useCallback(() => {
    if (playlist && playlist.episodes && queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      playEpisode(playlist.episodes[prevIndex], playlist);
    } else if (queue.length > 0 && queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      playEpisode(queue[prevIndex]);
    }
  }, [playlist, queue, queueIndex, playEpisode]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Stop playback
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentEpisode(null);
    setProgress(0);
    setDuration(0);
    setQueue([]);
    setQueueIndex(-1);
    setPlaylist(null);
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
    setPlaylist(null);
  }, []);

  // Add to queue
  const addToQueue = useCallback((episode) => {
    setQueue(prev => [...prev, episode]);
  }, []);

  // Remove from queue
  const removeFromQueue = useCallback((episodeId) => {
    setQueue(prev => prev.filter(ep => ep.id !== episodeId));
  }, []);

  // Seek to position
  const seekTo = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  // Set playback speed
  const changePlaybackSpeed = useCallback((speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  // Set volume
  const changeVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const value = {
    // State
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
    
    // Refs
    audioRef,
    
    // Actions
    setCurrentEpisode,
    setIsPlaying,
    setIsMinimized,
    setProgress,
    setDuration,
    setPlaybackSpeed,
    setIsBuffering,
    setVolume,
    
    // Playback controls
    playEpisode,
    playPlaylist,
    playNextEpisode,
    playPreviousEpisode,
    togglePlayPause,
    stopPlayback,
    seekTo,
    changePlaybackSpeed,
    changeVolume,
    
    // Queue management
    addToQueue,
    removeFromQueue,
    clearQueue,
    
    // Progress
    saveProgress
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};

export default AudioContext;
export { AudioContext };
