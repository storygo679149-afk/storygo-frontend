import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiBookOpen, FiHeadphones, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import './CreatorProfile.css';

const CreatorProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    fetchCreator();
  }, [username]);

  const fetchCreator = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/creator/${username}`);
      setCreator(res.data.data);
      setFollowing(res.data.data.is_following);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Creator not found');
        navigate('/');
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (following) {
        await api.delete(`/users/unfollow/${creator.id}`);
        setFollowing(false);
        setCreator(prev => ({ ...prev, followers_count: prev.followers_count - 1 }));
        toast.success(`Unfollowed ${creator.username}`);
      } else {
        await api.post(`/users/follow/${creator.id}`);
        setFollowing(true);
        setCreator(prev => ({ ...prev, followers_count: prev.followers_count + 1 }));
        toast.success(`Following ${creator.username}`);
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) {
    return <div className="creator-profile-loading">Loading profile...</div>;
  }
  if (!creator) return null;

  return (
    <motion.div className="creator-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="profile-hero">
        <div className="profile-avatar">
          {creator.profile_picture ? (
            <img src={creator.profile_picture} alt={creator.full_name || creator.username} />
          ) : (
            <div className="avatar-placeholder">
              {(creator.full_name || creator.username).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{creator.full_name || creator.username}</h1>
          <p className="username">@{creator.username}</p>
          {creator.creator_bio && <p className="bio">{creator.creator_bio}</p>}
          <div className="profile-stats">
            <div className="stat">
              <FiBookOpen />
              <span>{creator.total_series}</span>
              <span>Series</span>
            </div>
            <div className="stat">
              <FiHeadphones />
              <span>{creator.total_episodes}</span>
              <span>Episodes</span>
            </div>
            <div className="stat">
              <FiUsers />
              <span>{creator.followers_count}</span>
              <span>Followers</span>
            </div>
          </div>
          <button className={`follow-btn ${following ? 'following' : ''}`} onClick={handleFollow}>
            {following ? <FiUserCheck /> : <FiUserPlus />}
            {following ? ' Following' : ' Follow'}
          </button>
        </div>
      </div>

      <div className="profile-series">
        <h2>Recent Series</h2>
        {creator.recent_series.length === 0 ? (
          <p className="no-series">No series yet.</p>
        ) : (
          <div className="series-grid">
            {creator.recent_series.map(series => (
              <Link to={`/series/${series.id}`} key={series.id} className="series-card">
                {series.cover_image_url ? (
                  <img src={series.cover_image_url} alt={series.title} />
                ) : (
                  <div className="card-placeholder"><FiBookOpen size={32} /></div>
                )}
                <div className="series-info">
                  <h3>{series.title}</h3>
                  <small>{new Date(series.created_at).toLocaleDateString()}</small>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CreatorProfile;
