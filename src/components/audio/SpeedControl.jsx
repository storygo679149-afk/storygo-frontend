import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import './SpeedControl.css';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

const SpeedControl = ({ currentSpeed, onSpeedChange, onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="speed-control"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="speed-control-header">
          <h4>Playback Speed</h4>
          <button className="speed-close-btn" onClick={onClose}>
            <FiX size={16} />
          </button>
        </div>
        
        <div className="speed-options">
          {SPEED_OPTIONS.map((speed) => (
            <motion.button
              key={speed}
              className={`speed-option ${currentSpeed === speed ? 'active' : ''}`}
              onClick={() => onSpeedChange(speed)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="speed-value">{speed}x</span>
              {currentSpeed === speed && (
                <motion.span
                  className="speed-indicator"
                  layoutId="speedIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
        
        <div className="speed-info">
          <p>Current: <strong>{currentSpeed}x</strong></p>
          {currentSpeed > 1 && (
            <p className="speed-warning">
              ⚡ Higher speeds may affect audio quality
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpeedControl;
