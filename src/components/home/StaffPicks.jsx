import React from 'react';
import SeriesCard from '../series/SeriesCard';
import './StaffPicks.css';

const StaffPicks = ({ series }) => (
  <div>
    <h2 className="section-title">⭐ Staff Picks</h2>
    <p className="section-subtitle">Curated by our team – this week's theme: Mythology</p>
    <div className="staff-grid">
      {series.map(s => (
        <SeriesCard key={s.id} series={s} badge={{ text: 'Staff Pick', color: '#FFD700' }} />
      ))}
    </div>
  </div>
);

export default StaffPicks;