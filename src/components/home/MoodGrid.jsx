import React from 'react';
import { Link } from 'react-router-dom';
import './MoodGrid.css';

const moods = [
  { label: 'Epic', icon: '⚔️', gradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' },
  { label: 'Romance', icon: '❤️', gradient: 'linear-gradient(135deg, #FD79A8, #FDCB6E)' },
  { label: 'Thriller', icon: '🔪', gradient: 'linear-gradient(135deg, #E17055, #FDCB6E)' },
  { label: 'Fantasy', icon: '🐉', gradient: 'linear-gradient(135deg, #00B894, #55EFC4)' },
  { label: 'Mystery', icon: '🔍', gradient: 'linear-gradient(135deg, #0984E3, #74B9FF)' },
  { label: 'Drama', icon: '🎭', gradient: 'linear-gradient(135deg, #FDCB6E, #F39C12)' },
];

const MoodGrid = () => (
  <div className="mood-grid-section">
    <h2 className="section-title">Browse by Mood</h2>
    <div className="mood-tiles">
      {moods.map(({ label, icon, gradient }) => (
        <Link
          to={`/categories/${label.toLowerCase()}`}
          key={label}
          className="mood-tile"
          style={{ background: gradient }}
        >
          <div className="mood-overlay" />
          <span className="mood-icon">{icon}</span>
          <span className="mood-label">{label}</span>
        </Link>
      ))}
    </div>
  </div>
);

export default MoodGrid;