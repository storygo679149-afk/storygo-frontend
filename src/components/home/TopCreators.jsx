import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiUserCheck, FiUsers, FiBookOpen } from 'react-icons/fi';
import userService from '../../services/userService';
import useAuth from '../../hooks/useAuth';
import SkeletonLoader from '../common/SkeletonLoader';
import toast from 'react-hot-toast';
import './TopCreators.css';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 15 },
  },
};

const TopCreators = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userService
      .getTopCreators()
      .then((res) => {
        const list = res.data?.data?.creators || res.data?.creators || [];
        setCreators(list);
      })
      .catch((err) => console.error('Failed to fetch top creators:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleFollowToggle = async (creatorId, isCurrentlyFollowing) => {
    if (!isAuthenticated) {
      toast.error('Please login to follow');
      return;
    }
    try {
      if (isCurrentlyFollowing) {
        await userService.unfollowCreator(creatorId);
        toast.success('Unfollowed');
      } else {
        await userService.followCreator(creatorId);
        toast.success('Following');
      }
      setCreators((prev) =>
        prev.map((c) =>
          c.id === creatorId ? { ...c, is_following: !isCurrentlyFollowing } : c
        )
      );
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (isLoading) {
    return (
      <div className="top-creators-section">
        <h2 className="section-title">👨‍🎤 Top Creators to Follow</h2>
        <div className="creators-grid">
          <SkeletonLoader type="card" count={5} />
        </div>
      </div>
    );
  }

  if (creators.length === 0) return null;

  return (
    <div className="top-creators-section">
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
      >
        👨‍🎤 Top Creators to Follow
      </motion.h2>

      <motion.div
        className="creators-grid"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {creators.map((creator) => (
          <motion.div
            key={creator.id}
            className="creator-card"
            variants={item}
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => navigate(`/profile/${creator.id}`)}
          >
            {/* Avatar */}
            <div className="creator-avatar">
              {creator.profile_picture ? (
                <img src={creator.profile_picture} alt={creator.username} />
              ) : (
                <span className="avatar-placeholder">
                  {creator.full_name?.charAt(0) || creator.username?.charAt(0) || '?'}
                </span>
              )}
            </div>

            {/* Info */}
            <h4 className="creator-name">{creator.full_name || creator.username}</h4>
            <div className="creator-stats">
              <span>
                <FiBookOpen size={14} /> {creator.series_count} series
              </span>
              <span>
                <FiUsers size={14} /> {creator.followers_count} followers
              </span>
            </div>

            {/* Follow button */}
            <motion.button
              className={`follow-btn ${creator.is_following ? 'following' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleFollowToggle(creator.id, creator.is_following);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {creator.is_following ? (
                <>
                  <FiUserCheck /> Following
                </>
              ) : (
                <>
                  <FiUserPlus /> Follow
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TopCreators;