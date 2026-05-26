import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SeriesCard from '../series/SeriesCard';
import './TrendingSection.css';

const FILTERS = {
  language: ['All', 'English', 'Hindi', 'Spanish'],
  genre: ['All', 'Action', 'Romance', 'Horror', 'Sci-Fi'],
  status: ['All', 'Ongoing', 'Completed'],
};

const TrendingSection = ({ series = [] }) => {
  const [activeLang, setActiveLang] = useState('All');
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  const filteredSeries = useMemo(() => {
    return series.filter((s) => {
      const langMatch =
        activeLang === 'All' ||
        s.language?.toLowerCase() === activeLang.toLowerCase();
      const genreMatch =
        activeGenre === 'All' ||
        (s.category_name &&
          s.category_name.toLowerCase() === activeGenre.toLowerCase());
      const statusMatch =
        activeStatus === 'All' ||
        s.status?.toLowerCase() === activeStatus.toLowerCase();
      return langMatch && genreMatch && statusMatch;
    });
  }, [series, activeLang, activeGenre, activeStatus]);

  if (!series || series.length === 0) return null;

  return (
    <div className="trending-section">
      <div className="trending-header">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          🔥 Trending This Week
        </motion.h2>
        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          What's hot right now
        </motion.p>
      </div>

      {/* Filter chips */}
      <div className="filter-group">
        <div className="chip-row">
          {FILTERS.language.map((lang) => (
            <motion.button
              key={lang}
              className={`chip ${activeLang === lang ? 'active' : ''}`}
              onClick={() => setActiveLang(lang)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {lang}
            </motion.button>
          ))}
        </div>
        <div className="chip-row">
          {FILTERS.genre.map((g) => (
            <motion.button
              key={g}
              className={`chip ${activeGenre === g ? 'active' : ''}`}
              onClick={() => setActiveGenre(g)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {g}
            </motion.button>
          ))}
        </div>
        <div className="chip-row">
          {FILTERS.status.map((s) => (
            <motion.button
              key={s}
              className={`chip ${activeStatus === s ? 'active' : ''}`}
              onClick={() => setActiveStatus(s)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Series grid with unique keys */}
      <motion.div className="trending-grid" layout>
        <AnimatePresence>
          {filteredSeries.map((s, index) => (
            <motion.div
              // 🔥 FIX: Use a composite key to guarantee uniqueness
              key={`${s.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <SeriesCard series={s} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredSeries.length === 0 && (
          <p className="no-results">No series match the selected filters.</p>
        )}
      </motion.div>
    </div>
  );
};

export default TrendingSection;