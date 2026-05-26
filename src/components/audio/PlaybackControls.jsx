import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiSkipBack, 
  FiSkipForward, 
  FiPlay, 
  FiPause, 
  FiVolume2, 
  FiVolume1, 
  FiVolumeX 
} from 'react-icons/fi';
import './PlaybackControls.css';

const PlaybackControls = ({
  isPlaying,
  isBuffering,
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeChange,
  volume
}) => {
  const handleVolumeClick = () => {
    if (volume > 0) {
      onVolumeChange(0);
    } else {
      onVolumeChange(0.7);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <FiVolumeX />;
    if (volume < 0.5) return <FiVolume1 />;
    return <FiVolume2 />;
  };

  return (
    <div className="playback-controls">
      <div className="controls-left">
        <div className="volume-control">
          <button 
            className="volume-icon-btn"
            onClick={handleVolumeClick}
          >
            {getVolumeIcon()}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>

      <div className="controls-center">
        <motion.button
          className="control-btn skip-btn"
          onClick={onPrevious}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiSkipBack size={20} />
        </motion.button>

        <motion.button
          className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={onPlayPause}
          disabled={isBuffering}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isBuffering ? (
            <div className="spinner" />
          ) : isPlaying ? (
            <FiPause size={24} />
          ) : (
            <FiPlay size={24} />
          )}
        </motion.button>

        <motion.button
          className="control-btn skip-btn"
          onClick={onNext}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiSkipForward size={20} />
        </motion.button>
      </div>

      <div className="controls-right">
        {/* Empty for symmetry */}
      </div>
    </div>
  );
};

export default PlaybackControls;
