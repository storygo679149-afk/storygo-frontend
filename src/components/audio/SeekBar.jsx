import React, { useRef, useCallback } from 'react';
import { formatTime } from '../../utils/formatters';
import './SeekBar.css';

const SeekBar = ({ currentTime, duration, onSeek, buffered = 0 }) => {
  const seekBarRef = useRef(null);
  const isDragging = useRef(false);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  const handleSeek = useCallback((e) => {
    if (!seekBarRef.current || duration <= 0) return;
    
    const rect = seekBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTime = percent * duration;
    
    onSeek(seekTime);
  }, [duration, onSeek]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    handleSeek(e);
    
    const handleMouseMove = (e) => {
      if (isDragging.current) {
        handleSeek(e);
      }
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    handleSeek(e.touches[0]);
    
    const handleTouchMove = (e) => {
      if (isDragging.current) {
        handleSeek(e.touches[0]);
      }
    };
    
    const handleTouchEnd = () => {
      isDragging.current = false;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className="seek-bar-container">
      <span className="seek-time current">{formatTime(currentTime)}</span>
      
      <div 
        className="seek-bar"
        ref={seekBarRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleSeek}
      >
        <div className="seek-bar-track">
          <div 
            className="seek-bar-buffered" 
            style={{ width: `${bufferedPercent}%` }}
          />
          <div 
            className="seek-bar-progress" 
            style={{ width: `${progressPercent}%` }}
          />
          <div 
            className="seek-bar-thumb" 
            style={{ left: `${progressPercent}%` }}
          />
        </div>
        
        {/* Time tooltip on hover */}
        <div className="seek-bar-tooltip" style={{ left: `${progressPercent}%` }}>
          {formatTime(currentTime)}
        </div>
      </div>
      
      <span className="seek-time duration">{formatTime(duration)}</span>
    </div>
  );
};

export default SeekBar;
