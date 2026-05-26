import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiBookOpen, FiHeart, FiEye, FiClock } from 'react-icons/fi';
import { formatCompactNumber } from '../../utils/formatters';
import './NovelCard.css';

const NovelCard = ({ novel, index = 0 }) => {
  const navigate = useNavigate();

  const handleClick = () => navigate(`/novels/${novel.id}`);
  
  const readingTime = Math.floor((novel.total_words || 0) / 200);
  
  return (
    <motion.div
      className="novel-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -8 }}
      onClick={handleClick}
    >
      <div className="novel-card-cover">
        {novel.cover_image_url ? (
          <img src={novel.cover_image_url} alt={novel.title} loading="lazy" />
        ) : (
          <div className="cover-placeholder"><FiBookOpen /></div>
        )}
        <div className="cover-overlay">
          <button className="read-btn">Read Now →</button>
        </div>
        {novel.status === 'completed' && <span className="completed-badge">Completed</span>}
        {novel.is_premium && <span className="premium-badge">Premium</span>}
      </div>
      
      <div className="novel-card-info">
        <h3 className="novel-title">{novel.title}</h3>
        <p className="novel-author">by {novel.author_name || novel.creator_username}</p>
        <div className="novel-meta">
          <span><FiHeart /> {formatCompactNumber(novel.like_count || 0)}</span>
          <span><FiEye /> {formatCompactNumber(novel.read_count || 0)}</span>
          <span><FiClock /> {readingTime} min read</span>
        </div>
        <div className="chapter-count">{novel.total_chapters || 0} chapters</div>
      </div>
    </motion.div>
  );
};

export default NovelCard;