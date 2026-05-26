import React from 'react';
import { motion } from 'framer-motion';
import SeriesCard from '../series/SeriesCard';
import './NewReleasesSection.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 18 },
  },
};

const NewReleasesSection = ({ series = [] }) => {
  if (!series || series.length === 0) return null;

  return (
    <div className="new-releases-section">
      <div className="section-header">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          🆕 New Releases
        </motion.h2>
        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Freshly dropped episodes and series
        </motion.p>
      </div>

      <motion.div
        className="new-releases-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {series.map((s) => (
          <motion.div key={s.id} variants={itemVariants}>
            <SeriesCard series={s} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default NewReleasesSection;