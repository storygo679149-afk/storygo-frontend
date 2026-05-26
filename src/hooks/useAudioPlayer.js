import { useContext, useCallback, useRef, useEffect } from 'react';
import AudioContext from '../context/AudioContext';
import { formatTime } from '../utils/formatters';

const useAudioPlayer = () => {
  const context = useContext(AudioContext);
  
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioProvider');
  }

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
    audioRef,
    setCurrentEpisode,
    setIsPlaying,
    setIsMinimized,
    setProgress,
    setDuration,
    setPlaybackSpeed,
    setIsBuffering,
    setVolume,
    playEpisode,
    playPlaylist,
    playNextEpisode,
    playPreviousEpisode,
    togglePlayPause,
    stopPlayback,
    seekTo,
    changePlaybackSpeed,
    changeVolume,
    addToQueue,
    removeFromQueue,
    clearQueue,
    saveProgress
  } = context;

  // Format current time
  const currentTimeFormatted = formatTime(progress);
  const durationFormatted = formatTime(duration);
  const remainingTime = duration - progress;
  const remainingTimeFormatted = formatTime(remainingTime);

  // Progress percentage
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Check if current episode is in queue
  const isInQueue = useCallback((episodeId) => {
    return queue.some(ep => ep.id === episodeId);
  }, [queue]);

  // Get next episode info
  const getNextEpisode = useCallback(() => {
    if (playlist && playlist.episodes && queueIndex < playlist.episodes.length - 1) {
      return playlist.episodes[queueIndex + 1];
    }
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      return queue[queueIndex + 1];
    }
    return null;
  }, [playlist, queue, queueIndex]);

  // Get previous episode info
  const getPreviousEpisode = useCallback(() => {
    if (playlist && playlist.episodes && queueIndex > 0) {
      return playlist.episodes[queueIndex - 1];
    }
    if (queue.length > 0 && queueIndex > 0) {
      return queue[queueIndex - 1];
    }
    return null;
  }, [playlist, queue, queueIndex]);

  // Check if there's a next episode
  const hasNextEpisode = getNextEpisode() !== null;
  const hasPreviousEpisode = getPreviousEpisode() !== null;

  // Skip forward by seconds
  const skipForward = useCallback((seconds = 15) => {
    const newTime = Math.min(progress + seconds, duration);
    seekTo(newTime);
  }, [progress, duration, seekTo]);

  // Skip backward by seconds
  const skipBackward = useCallback((seconds = 15) => {
    const newTime = Math.max(progress - seconds, 0);
    seekTo(newTime);
  }, [progress, seekTo]);

  // Toggle minimize
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, [setIsMinimized]);

  // Get queue info
  const queueInfo = {
    total: queue.length,
    current: queueIndex,
    remaining: queue.length - queueIndex - 1,
    hasQueue: queue.length > 0
  };

  return {
    // Episode info
    currentEpisode,
    isPlaying,
    isMinimized,
    isBuffering,
    
    // Timing
    progress,
    duration,
    currentTimeFormatted,
    durationFormatted,
    remainingTime,
    remainingTimeFormatted,
    progressPercent,
    
    // Controls
    playbackSpeed,
    volume,
    
    // Queue
    queue,
    queueIndex,
    queueInfo,
    playlist,
    
    // Core actions
    playEpisode,
    playPlaylist,
    playNextEpisode,
    playPreviousEpisode,
    togglePlayPause,
    stopPlayback,
    seekTo,
    
    // Convenience actions
    skipForward,
    skipBackward,
    toggleMinimize,
    
    // Speed and volume
    changePlaybackSpeed,
    changeVolume,
    
    // Queue actions
    addToQueue,
    removeFromQueue,
    clearQueue,
    isInQueue,
    
    // Navigation info
    getNextEpisode,
    getPreviousEpisode,
    hasNextEpisode,
    hasPreviousEpisode,
    
    // Progress
    saveProgress,
    
    // Audio ref (for direct access)
    audioRef
  };
};

export default useAudioPlayer;