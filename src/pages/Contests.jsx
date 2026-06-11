import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiCalendar, FiUsers, FiClock, FiAward } from 'react-icons/fi';
import api from '../services/api';
import './Contests.css';

const Contests = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const [activeRes, pastRes] = await Promise.all([
        api.get('/contests/active'),
        api.get('/contests/past')
      ]);
      // Combine and deduplicate
      const all = [...activeRes.data.data, ...pastRes.data.data];
      setContests(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isActive = (contest) => {
    const now = new Date();
    return new Date(contest.start_date) <= now && new Date(contest.end_date) >= now;
  };

  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (contest.theme && contest.theme.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && isActive(contest)) ||
                         (filterStatus === 'ended' && !isActive(contest));
    return matchesSearch && matchesFilter;
  });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    hover: { y: -8, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      className="contests-page"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <div className="contests-header">
        <motion.h1 variants={fadeInUp}>Writing Contests</motion.h1>
        <motion.p variants={fadeInUp}>Showcase your talent and win amazing prizes</motion.p>
      </div>

      <motion.div className="search-filters" variants={fadeInUp}>
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title or theme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          <button
            className={`chip ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`chip ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Active
          </button>
          <button
            className={`chip ${filterStatus === 'ended' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ended')}
          >
            Ended
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="skeleton-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </motion.div>
        ) : filteredContests.length === 0 ? (
          <motion.div
            key="empty"
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <FiAward size={48} />
            <h3>No contests found</h3>
            <p>Try adjusting your search or check back later for new opportunities.</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="contest-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredContests.map((contest) => (
              <motion.div
                key={contest.id}
                className="contest-card"
                variants={cardVariants}
                whileHover="hover"
                onClick={() => navigate(`/contests/${contest.id}`)}
              >
                <div className="card-image">
                  {contest.background_image_url ? (
                    <img src={contest.background_image_url} alt={contest.title} />
                  ) : (
                    <div className="card-image-placeholder">
                      <FiAward size={40} />
                    </div>
                  )}
                  <div className={`card-badge ${isActive(contest) ? 'active' : 'ended'}`}>
                    {isActive(contest) ? 'Active' : 'Ended'}
                  </div>
                </div>
                <div className="card-content">
                  <h3>{contest.title}</h3>
                  <p>{contest.theme || 'No theme specified'}</p>
                  <div className="card-stats">
                    <span><FiCalendar size={12} /> {formatDate(contest.start_date)}</span>
                    <span><FiClock size={12} /> {formatDate(contest.end_date)}</span>
                    {/* Optional: participant count if available */}
                    {/* <span><FiUsers size={12} /> {contest.participants || 0}</span> */}
                  </div>
                  <div className="card-footer">
                    <div className="deadline">
                      {isActive(contest) ? 'Open for submissions' : 'Closed'}
                    </div>
                    <button className="enter-btn">
                      {isActive(contest) ? 'Submit Story' : 'View Results'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Contests;
