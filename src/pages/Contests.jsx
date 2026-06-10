import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import './Contests.css';

const Contests = () => {
  const [activeContests, setActiveContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const [activeRes, pastRes] = await Promise.all([
        api.get('/contests/active'),
        api.get('/contests/past')
      ]);
      setActiveContests(activeRes.data.data);
      setPastContests(pastRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading contests...</div>;

  return (
    <motion.div className="contests-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Writing Contests</h1>
      <section>
        <h2>Active Contests</h2>
        <div className="contest-grid">
          {activeContests.map(c => (
            <Link to={`/contests/${c.id}`} key={c.id} className="contest-card" style={{ backgroundImage: c.background_image_url ? `url(${c.background_image_url})` : 'none' }}>
              <div className="card-content">
                <h3>{c.title}</h3>
                <p>{c.theme}</p>
                <small>Ends: {new Date(c.end_date).toLocaleDateString()}</small>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2>Past Contests</h2>
        <div className="contest-grid">
          {pastContests.map(c => (
            <Link to={`/contests/${c.id}`} key={c.id} className="contest-card past">
              <div className="card-content">
                <h3>{c.title}</h3>
                <p>{c.theme}</p>
                <small>Ended: {new Date(c.end_date).toLocaleDateString()}</small>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
export default Contests;
