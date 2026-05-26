import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Dashboard from '../components/creator/Dashboard';
import UploadEpisode from '../components/creator/UploadEpisode';
import SeriesManager from '../components/creator/SeriesManager';
import FollowersPage from '../components/creator/FollowersPage';
import Analytics from '../components/creator/Analytics';
import {
  FiBarChart2, FiBookOpen, FiHeadphones, FiUsers, FiTrendingUp, FiMic
} from 'react-icons/fi';
import './CreatorDashboard.css';

const CreatorDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
      return;
    }
    if (!user?.is_creator) {
      navigate('/become-creator');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user?.is_creator) {
    return null;
  }

  const tabs = [
    { key: '/creator/dashboard', label: 'Overview', icon: <FiBarChart2 /> },
    { key: '/creator/series', label: 'My Series', icon: <FiBookOpen /> },
    { key: '/creator/episodes/upload', label: 'Upload', icon: <FiHeadphones /> },
    { key: '/creator/analytics', label: 'Analytics', icon: <FiTrendingUp /> },
    { key: '/creator/followers', label: 'Followers', icon: <FiUsers /> },
  ];

  const renderContent = () => {
    const path = location.pathname;

    if (path === '/creator/dashboard') return <Dashboard />;
    if (path.startsWith('/creator/series')) return <SeriesManager />;
    if (path === '/creator/episodes/upload') return <UploadEpisode />;
    if (path === '/creator/analytics') return <Analytics />;
    if (path === '/creator/followers') return <FollowersPage />;

    return <Dashboard />;
  };

  return (
    <div className="creator-dashboard-page">
      <div className="creator-nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`creator-nav-btn ${
              location.pathname === tab.key ? 'active' : ''
            }`}
            onClick={() => navigate(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="creator-content">{renderContent()}</div>
    </div>
  );
};

export default CreatorDashboard;