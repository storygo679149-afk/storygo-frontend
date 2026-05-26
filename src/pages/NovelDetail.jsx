import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import novelService from '../services/novelService';
import useAuth from '../hooks/useAuth';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FiArrowLeft, FiHeart, FiBookOpen, FiClock, FiEye, FiUser, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './NovelDetail.css';

const NovelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);  // ✅ always array
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(null);

  useEffect(() => {
    fetchNovel();
  }, [id]);

  const fetchNovel = async () => {
    setIsLoading(true);
    try {
      const response = await novelService.getNovelById(id);
      const data = response.data?.data || response.data || {};
      
      setNovel(data.novel || null);
      // ✅ Ensure chapters is always an array
      setChapters(Array.isArray(data.chapters) ? data.chapters : []);
      setReadingProgress(data.progress || null);
      setIsLiked(data.novel?.is_liked || false);
    } catch (error) {
      console.error('Failed to load novel:', error);
      toast.error('Failed to load novel');
      navigate('/novels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like');
      return;
    }
    try {
      await novelService.toggleLike(id);
      setIsLiked(!isLiked);
      setNovel(prev => ({ ...prev, like_count: (prev?.like_count || 0) + (isLiked ? -1 : 1) }));
      toast.success(isLiked ? 'Removed like' : 'Liked!');
    } catch (error) {
      toast.error('Failed');
    }
  };

  const getReadingTime = () => {
    if (!novel?.total_words) return '~5 min';
    const minutes = Math.floor(novel.total_words / 200);
    return `${minutes} min read`;
  };

  if (isLoading) {
    return (
      <div className="novel-detail-loading">
        <SkeletonLoader type="banner" />
        <SkeletonLoader type="episode" count={4} />
      </div>
    );
  }

  if (!novel) return null;

  return (
    <div className="novel-detail-page">
      <div className="novel-detail-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="novel-hero">
          <div className="novel-cover">
            {novel.cover_image_url ? (
              <img src={novel.cover_image_url} alt={novel.title} />
            ) : (
              <div className="cover-placeholder"><FiBookOpen size={48} /></div>
            )}
          </div>
          <div className="novel-info">
            <h1>{novel.title}</h1>
            <p className="author"><FiUser /> {novel.author_name || novel.creator_username}</p>
            <div className="stats">
              <span><FiHeart /> {novel.like_count || 0}</span>
              <span><FiEye /> {novel.read_count || 0}</span>
              <span><FiClock /> {getReadingTime()}</span>
            </div>
            <p className="description">{novel.description}</p>
            <div className="actions">
              {chapters.length > 0 && (
                <Link to={`/novels/${id}/read/${chapters[0].id}`} className="read-now-btn">
                  Start Reading <FiChevronRight />
                </Link>
              )}
              <button className={`like-btn ${isLiked ? 'active' : ''}`} onClick={handleLike}>
                <FiHeart /> {isLiked ? 'Liked' : 'Like'}
              </button>
            </div>
            <div className="tags">
              {novel.status && <span className="tag status">{novel.status}</span>}
              {novel.is_premium && <span className="tag premium">Premium</span>}
              {novel.category_name && <span className="tag">{novel.category_name}</span>}
            </div>
          </div>
        </div>

        <div className="chapters-section">
          <h2>Chapters ({chapters.length})</h2>
          <div className="chapters-list">
            {chapters.length === 0 ? (
              <div className="no-chapters">No chapters yet. Check back soon!</div>
            ) : (
              chapters.map((chapter) => (
                <Link
                  to={`/novels/${id}/read/${chapter.id}`}
                  key={chapter.id}
                  className="chapter-item"
                >
                  <div className="chapter-number">Chapter {chapter.chapter_number}</div>
                  <div className="chapter-title">{chapter.title}</div>
                  <div className="chapter-meta">
                    <span>{chapter.word_count || 0} words</span>
                    {chapter.is_premium && <span className="premium-tag">Premium</span>}
                    {readingProgress?.chapter_id === chapter.id && (
                      <span className="continue-tag">Continue</span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelDetail;