import React, { useState } from 'react';
import { FiTarget, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const RecommendationEngine = () => {
  const [trendingWeight, setTrendingWeight] = useState(50);
  const [curatedPlaylist, setCuratedPlaylist] = useState('');
  const [overrideSeries, setOverrideSeries] = useState([]);

  const save = () => {
    toast.success('Recommendation settings updated');
  };

  return (
    <div className="admin-page">
      <h1><FiTarget /> Recommendation Engine</h1>
      <div style={{ display: 'grid', gap: '24px', maxWidth: '700px' }}>
        <div className="stat-card">
          <h3>Trending Algorithm Weight</h3>
          <div className="form-group">
            <label>Trending Score Weight</label>
            <input type="range" min="0" max="100" value={trendingWeight} onChange={e => setTrendingWeight(e.target.value)} />
            <span>{trendingWeight}%</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Curated Playlist</h3>
          <div className="form-group">
            <label>Playlist Name</label>
            <input className="form-input" value={curatedPlaylist} onChange={e => setCuratedPlaylist(e.target.value)} />
          </div>
          {/* multi-select for series */}
          <div className="form-group">
            <label>Override Recommendations (series IDs)</label>
            <input className="form-input" placeholder="comma-separated IDs" onChange={e => setOverrideSeries(e.target.value.split(','))} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={save}><FiSave /> Save</button>
      </div>
    </div>
  );
};

export default RecommendationEngine;
