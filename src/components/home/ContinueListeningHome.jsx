import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import { formatTime } from '../../utils/formatters';
import { FiPlay } from 'react-icons/fi';
import './ContinueListeningHome.css';

const ContinueListeningHome = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      userService.getListeningHistory({ limit: 3 }).then(res => {
        setItems(res.data?.history || []);
      });
    }
  }, [isAuthenticated]);

  if (items.length === 0) return null;

  return (
    <div className="continue-listening-home">
      <h2 className="section-title">Continue Listening</h2>
      <div className="continue-cards">
        {items.map(item => {
          const remaining = item.duration_seconds - item.progress_seconds;
          return (
            <div key={item.episode_id} className="continue-card" onClick={() => navigate(`/play/${item.episode_id}`)}>
              <img src={item.thumbnail_url || '/placeholder.jpg'} alt="" className="continue-thumb" />
              <div className="continue-details">
                <p className="continue-episode">{item.episode_title}</p>
                <p className="continue-series">{item.series_title}</p>
                <div className="continue-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(item.progress_seconds / item.duration_seconds) * 100}%` }} />
                  </div>
                  <span className="continue-remaining">{formatTime(remaining)} left</span>
                </div>
              </div>
              <button className="play-icon"><FiPlay /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueListeningHome;