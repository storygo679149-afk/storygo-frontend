import React from 'react';
import { motion } from 'framer-motion';
import SeriesCard from './SeriesCard';
import SkeletonLoader from '../common/SkeletonLoader';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './SeriesGrid.css';

const SeriesGrid = ({ 
  series = [], 
  isLoading = false, 
  title, 
  subtitle,
  viewAllLink,
  layout = 'grid',
  skeletonCount = 6
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  if (isLoading) {
    return (
      <div className="series-grid-section">
        {title && (
          <div className="series-grid-header">
            <h2 className="series-grid-title">{title}</h2>
          </div>
        )}
        <div className={`series-grid ${layout}`}>
          <SkeletonLoader type="card" count={skeletonCount} />
        </div>
      </div>
    );
  }

  if (!series || series.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="series-grid-section"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      {(title || viewAllLink) && (
        <div className="series-grid-header">
          <div className="series-grid-header-left">
            {title && <h2 className="series-grid-title">{title}</h2>}
            {subtitle && <p className="series-grid-subtitle">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link to={viewAllLink} className="series-grid-view-all">
              View All
              <FiChevronRight />
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      <div className={`series-grid ${layout}`}>
        {series.map((item, index) => (
          <SeriesCard 
            key={item.id} 
            series={item} 
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Horizontal scroll variant
export const SeriesHorizontalGrid = ({ 
  series = [], 
  isLoading = false, 
  title,
  viewAllLink 
}) => {
  if (isLoading) {
    return (
      <div className="series-grid-section">
        {title && (
          <div className="series-grid-header">
            <h2 className="series-grid-title">{title}</h2>
          </div>
        )}
        <div className="series-horizontal-scroll">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="horizontal-skeleton">
              <SkeletonLoader type="card" count={1} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!series || series.length === 0) return null;

  return (
    <motion.div
      className="series-grid-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {(title || viewAllLink) && (
        <div className="series-grid-header">
          <h2 className="series-grid-title">{title}</h2>
          {viewAllLink && (
            <Link to={viewAllLink} className="series-grid-view-all">
              View All
              <FiChevronRight />
            </Link>
          )}
        </div>
      )}
      
      <div className="series-horizontal-scroll">
        {series.map((item, index) => (
          <motion.div
            key={item.id}
            className="horizontal-card-wrapper"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SeriesCard series={item} index={index} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SeriesGrid;
