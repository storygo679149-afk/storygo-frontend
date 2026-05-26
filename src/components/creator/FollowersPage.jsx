import React, { useState, useEffect } from 'react';
import { FiUsers, FiAlertCircle } from 'react-icons/fi';
import userService from '../../services/userService';
import SkeletonLoader from '../common/SkeletonLoader';
import './FollowersPage.css';

const FollowersPage = () => {
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getFollowers();
      const list = res.data?.data?.followers || res.data?.followers || [];
      setFollowers(list);
    } catch (err) {
      console.error('Fetch followers error:', err);
      setError('Failed to load followers');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="followers-page">
        <div className="skeleton-container">
          <SkeletonLoader type="profile" count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="followers-page">
        <div className="error-container">
          <FiAlertCircle size={56} />
          <h3>{error}</h3>
          <button className="retry-btn" onClick={fetchFollowers}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="followers-page">
      {/* ---------- HEADER ---------- */}
      <div className="followers-header">
        <h2>
          <FiUsers />
          Followers
        </h2>
        <span className="followers-count-pill">{followers.length}</span>
      </div>

      {/* ---------- EMPTY STATE ---------- */}
      {followers.length === 0 ? (
        <div className="empty-followers">
          <FiUsers size={56} />
          <h3>No Followers Yet</h3>
          <p>When people follow you, they'll show up here.</p>
        </div>
      ) : (
        /* ---------- FOLLOWERS LIST ---------- */
        <div className="followers-list">
          {followers.map((follower) => (
            <div key={follower.id} className="follower-card">
              <div className="follower-avatar">
                {follower.profile_picture ? (
                  <img
                    src={follower.profile_picture}
                    alt={follower.username || 'follower'}
                  />
                ) : (
                  (follower.full_name?.charAt(0) ||
                    follower.username?.charAt(0) ||
                    '?')
                )}
              </div>

              <div className="follower-info">
                <p className="follower-name">
                  {follower.full_name || follower.username}
                </p>
                <p className="follower-username">@{follower.username}</p>
              </div>

              <div className="follower-stats-badge">
                <FiUsers size={15} />
                <span>{follower.followers_count || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowersPage;