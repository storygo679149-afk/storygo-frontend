import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiPlay,
  FiUserPlus,
  FiHeadphones,
  FiUsers,
  FiStar
} from 'react-icons/fi';
import './HeroSeaction.css';
/* ---------- ANIMATED COUNTER ---------- */
const CountUp = ({ end, duration = 2, suffix = '+' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = null;
          const step = (ts) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / (duration * 1000), 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ---------- MAIN HERO ---------- */
const HeroSection = ({ featuredSeries, stats }) => {
  return (
    <section className="hero-section">
      {/* Background layers */}
      <div className="hero-bg-layer">
        {featuredSeries?.thumbnail_url && (
          <div
            className="hero-bg-image"
            style={{ backgroundImage: `url(${featuredSeries.thumbnail_url})` }}
          />
        )}
        <div className="hero-bg-gradient" />
        <div className="hero-bg-glow purple" />
        <div className="hero-bg-glow pink" />
        <div className="hero-particles" />
      </div>

      <div className="hero-content">
        {/* ========== LEFT TEXT ========== */}
        <motion.div
          className="hero-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.2 }
            }
          }}
        >
          <motion.h1
            className="hero-headline"
            variants={{
              hidden: { opacity: 0, y: 60 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 80, damping: 20 }
              }
            }}
          >
            <span className="gradient-text">Your World</span>
            <br />
            of Audio Stories
          </motion.h1>

          <motion.p
            className="hero-tagline"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 80, damping: 20 }
              }
            }}
          >
            Immerse yourself in thousands of original series.
            <br />
            Listen free, anywhere.
          </motion.p>

          <motion.div
            className="hero-ctas"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 80, damping: 20 }
              }
            }}
          >
            <Link to="/trending" className="btn btn-primary hero-btn">
              <FiPlay className="btn-icon" />
              Start Listening Free
            </Link>
            <Link to="/become-creator" className="btn btn-glass hero-btn">
              <FiUserPlus className="btn-icon" />
              Become a Creator
            </Link>
          </motion.div>

          <motion.div
            className="hero-stats"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 80, damping: 20 }
              }
            }}
          >
            <div className="hero-stat">
              <div className="stat-icon">
                <FiHeadphones />
              </div>
              <div>
                <span className="stat-value">
                  <CountUp end={stats.seriesCount || 0} />+
                </span>
                <span className="stat-label">Series</span>
              </div>
            </div>
            <div className="hero-stat">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div>
                <span className="stat-value">
                  <CountUp end={stats.creatorsCount || 0} />+
                </span>
                <span className="stat-label">Creators</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ========== RIGHT FEATURED CARD ========== */}
        {featuredSeries && (
          <motion.div
            className="hero-featured-card"
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ y: -12 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="featured-card-badge">
              <FiStar /> Featured Weekly
            </div>

            <motion.div
              className="featured-card-thumb"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <img src={featuredSeries.thumbnail_url} alt={featuredSeries.title} />
              <div className="featured-card-overlay" />
            </motion.div>

            <div className="featured-card-info">
              <h3 className="featured-card-title">{featuredSeries.title}</h3>
              <p className="featured-card-author">
                {featuredSeries.author_name || featuredSeries.creator_name || 'Unknown Author'}
              </p>
              <Link to={`/series/${featuredSeries.id}`} className="btn btn-play">
                <FiPlay /> Play Now
              </Link>
            </div>

            {/* Glass reflection */}
            <div className="card-glass-reflection" />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;