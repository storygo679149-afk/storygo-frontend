import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import seriesService from '../services/seriesService';
import SeriesCard from '../components/series/SeriesCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FiArrowLeft, FiBookOpen, FiAlertCircle, FiTrendingUp, FiClock } from 'react-icons/fi';
import './CategoryDetail.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2
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

const CategoryDetail = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('latest'); // latest, popular, rating

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCategoryData();
  }, [slug, sortBy]);

  const fetchCategoryData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [catRes, serRes] = await Promise.all([
        seriesService.getCategoryBySlug(slug),
        seriesService.getCategorySeries(slug, { limit: 50, sort: sortBy })
      ]);

      const categoryData = catRes.data?.data?.category || catRes.data?.category || null;
      const seriesData = serRes.data?.data?.series || serRes.data?.series || [];

      if (!categoryData) throw new Error('Category not found');

      setCategory(categoryData);
      setSeries(seriesData);
    } catch (err) {
      console.error('Error fetching category:', err);
      setError(err.message || 'Failed to load category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="category-detail-page">
        <div className="category-detail-container">
          <div className="category-hero loading">
            <SkeletonLoader type="banner" />
          </div>
          <div className="category-series-grid">
            <SkeletonLoader type="card" count={8} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="category-detail-page">
        <div className="category-detail-container">
          <div className="error-container">
            <FiAlertCircle size={56} />
            <h2>{error || 'Category not found'}</h2>
            <Link to="/categories" className="back-home-btn">
              <FiArrowLeft /> Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="category-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="category-detail-container">
        {/* Back button */}
        <motion.div
          className="back-nav"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/categories" className="back-btn">
            <FiArrowLeft /> All Categories
          </Link>
        </motion.div>

        {/* Hero section */}
        <motion.div
          className="category-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="category-hero-content">
            <h1 className="category-title">{category.name}</h1>
            {category.description && (
              <p className="category-description">{category.description}</p>
            )}
            <div className="category-stats">
              <span className="stat-badge">
                <FiBookOpen /> {series.length} series
              </span>
              {category.series_count && (
                <span className="stat-badge">
                  <FiTrendingUp /> {category.series_count} total
                </span>
              )}
            </div>
          </div>
          <div className="category-hero-glow" />
        </motion.div>

        {/* Sort options */}
        <motion.div
          className="category-sort"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="sort">Sort by:</label>
          <select id="sort" value={sortBy} onChange={handleSortChange} className="sort-select">
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
        </motion.div>

        {/* Series grid */}
        {series.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FiBookOpen size={56} />
            <h3>No series yet</h3>
            <p>Be the first to add a series in this category</p>
          </motion.div>
        ) : (
          <motion.div
            className="category-series-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {series.map((ser, idx) => (
              <motion.div key={ser.id} variants={itemVariants}>
                <SeriesCard series={ser} index={idx} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryDetail;