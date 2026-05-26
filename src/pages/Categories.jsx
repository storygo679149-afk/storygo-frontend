import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import seriesService from '../services/seriesService';
import SkeletonLoader from '../components/common/SkeletonLoader';
import {
  FiTrendingUp, FiHeart, FiBookOpen, FiHeadphones,
  FiCompass, FiZap, FiStar, FiUsers, FiSmile, FiAlertCircle
} from 'react-icons/fi';
import './Categories.css';

// Category icon mapping
const categoryIcons = {
  'Action & Adventure': <FiZap />,
  'Romance': <FiHeart />,
  'Horror': <FiAlertCircle />,
  'Science Fiction': <FiTrendingUp />,
  'Fantasy': <FiStar />,
  'Mystery & Thriller': <FiCompass />,
  'Comedy': <FiSmile />,
  'Drama': <FiBookOpen />,
  'Historical Fiction': <FiBookOpen />,
  'Self-Help': <FiUsers />,
  'Non-Fiction': <FiBookOpen />,
  'Fiction': <FiBookOpen />,
  default: <FiHeadphones />
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await seriesService.getCategories();
      const cats = response?.data?.data?.categories || response?.data?.categories || [];
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (categoryName) => {
    return categoryIcons[categoryName] || categoryIcons.default;
  };

  if (isLoading) {
    return (
      <div className="categories-page">
        <div className="categories-header">
          <h1>Browse Categories</h1>
          <p>Discover series by genre and mood</p>
        </div>
        <div className="categories-grid">
          <SkeletonLoader type="card" count={10} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-page">
        <div className="categories-header">
          <h1>Browse Categories</h1>
          <p>Discover series by genre and mood</p>
        </div>
        <div className="error-state">
          <FiAlertCircle size={48} />
          <p>{error}</p>
          <button onClick={fetchCategories} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="categories-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="categories-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Browse Categories
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Discover series by genre and mood
        </motion.p>
      </div>

      <motion.div
        className="categories-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category) => (
          <motion.div
            key={category.id}
            className="category-card"
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to={`/categories/${category.slug}`} className="category-link">
              <div className="category-icon">
                {getIcon(category.name)}
              </div>
              <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-count">
                  {category.series_count || 0} series
                </p>
              </div>
              <div className="category-arrow">
                <span>→</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {categories.length === 0 && !isLoading && (
        <div className="empty-state">
          <FiBookOpen size={48} />
          <h3>No categories found</h3>
          <p>Check back later for new categories</p>
        </div>
      )}
    </motion.div>
  );
};

export default Categories;