import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import userService from '../services/userService';
import SeriesGrid from '../components/series/SeriesGrid';
import SkeletonLoader from '../components/common/SkeletonLoader';
import {
  FiBookOpen, FiClock, FiBookmark, FiHeart,
  FiUsers
} from 'react-icons/fi';
import './Library.css';

const Library = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('bookmarks');   // ← Bookmarks tab by default
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);          // episode bookmarks
  const [bookmarkedSeries, setBookmarkedSeries] = useState([]); // series bookmarks
  const [liked, setLiked] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
      return;
    }
    fetchLibraryData();
  }, [isAuthenticated, activeTab]);

  const fetchLibraryData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'history':
          const historyData = await userService.getListeningHistory({ limit: 20 });
          // Extract correctly
          setHistory(historyData.data?.data?.history || historyData.data?.history || []);
          break;

        case 'bookmarks':
          const [epBookmarks, serBookmarks] = await Promise.all([
            userService.getBookmarks({ limit: 20 }),
            userService.getBookmarkedSeries()
          ]);
          // ↙️ Correct extraction – go two levels deep for series
          setBookmarks(epBookmarks.data?.data?.bookmarks || epBookmarks.data?.bookmarks || []);
          setBookmarkedSeries(serBookmarks.data?.data?.series || serBookmarks.data?.series || []);
          break;

        case 'liked':
          const likedData = await userService.getLikedSeries({ limit: 20 });
          setLiked(likedData.data?.data?.series || likedData.data?.series || []);
          break;

        case 'following':
          const followingData = await userService.getFollowing();
          setFollowing(followingData.data?.data?.following || followingData.data?.following || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching library data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { key: 'bookmarks', label: 'Bookmarks', icon: <FiBookmark /> },
    { key: 'history', label: 'History', icon: <FiClock /> },
    { key: 'liked', label: 'Liked', icon: <FiHeart /> },
    { key: 'following', label: 'Following', icon: <FiUsers /> }
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="library-page">
      <div className="library-header"><h1>My Library</h1></div>

      <div className="library-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`library-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="library-content">
        {isLoading ? (
          <SkeletonLoader type="card" count={8} />
        ) : (
          <>
            {/* Bookmarks tab */}
            {activeTab === 'bookmarks' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {bookmarkedSeries.length > 0 && (
                  <>
                    <h3 className="result-section-title"><FiBookmark /> Bookmarked Series</h3>
                    <SeriesGrid series={bookmarkedSeries} />
                    <br />
                  </>
                )}
                {bookmarks.length > 0 && (
                  <>
                    <h3 className="result-section-title"><FiBookmark /> Bookmarked Episodes</h3>
                    <SeriesGrid
                      series={bookmarks.map(b => ({
                        id: b.episode_id,
                        title: b.episode_title,
                        series_title: b.series_title,
                        thumbnail_url: b.thumbnail_url
                      }))}
                    />
                  </>
                )}
                {bookmarkedSeries.length === 0 && bookmarks.length === 0 && (
                  <EmptyState icon={<FiBookmark />} message="No bookmarks yet" />
                )}
              </motion.div>
            )}

            {/* History tab */}
            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {history.length > 0 ? (
                  <SeriesGrid
                    series={history.map(h => ({
                      id: h.episode_id,
                      title: h.episode_title,
                      series_title: h.series_title,
                      thumbnail_url: h.thumbnail_url,
                      progress_seconds: h.progress_seconds,
                      duration_seconds: h.duration_seconds
                    }))}
                    title="Listening History"
                  />
                ) : (
                  <EmptyState icon={<FiClock />} message="No listening history yet" />
                )}
              </motion.div>
            )}

            {/* Liked tab */}
            {activeTab === 'liked' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {liked.length > 0 ? (
                  <SeriesGrid series={liked} title="Liked Series" />
                ) : (
                  <EmptyState icon={<FiHeart />} message="No liked series yet" />
                )}
              </motion.div>
            )}

            {/* Following tab */}
            {activeTab === 'following' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {following.length > 0 ? (
                  <div className="following-list">
                    {following.map(creator => (
                      <div key={creator.id} className="following-item">
                        <div className="following-avatar">
                          {creator.profile_picture ? (
                            <img src={creator.profile_picture} alt={creator.full_name} />
                          ) : (
                            <FiUsers />
                          )}
                        </div>
                        <div className="following-info">
                          <h3>{creator.full_name || creator.username}</h3>
                          <p>{creator.series_count || 0} series</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<FiUsers />} message="Not following anyone yet" />
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ icon, message }) => (
  <div className="library-empty">
    <div className="empty-icon">{icon}</div>
    <h3>{message}</h3>
  </div>
);

export default Library;