import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import './ContestDetail.css';

const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [formData, setFormData] = useState({ title: '', story: '', cover_image_url: '' });
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [contestRes, subRes, resultsRes] = await Promise.all([
        api.get(`/contests/${id}`),
        api.get(`/contests/${id}/my-submission`).catch(() => ({ data: { data: null } })),
        api.get(`/contests/${id}/results`).catch(() => ({ data: { data: null } }))
      ]);
      setContest(contestRes.data.data);
      setMySubmission(subRes.data.data);
      if (resultsRes.data.data && resultsRes.data.data.winners?.length) setResults(resultsRes.data.data);
    } catch (err) {
      toast.error('Failed to load contest');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.story) return toast.error('Title and story required');
    setSubmitting(true);
    try {
      await api.post(`/contests/${id}/submit`, formData);
      toast.success('Story submitted!');
      fetchData();
      setFormData({ title: '', story: '', cover_image_url: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!contest) return <div>Contest not found</div>;

  const isActive = new Date(contest.end_date) > new Date() && contest.status === 'active';
  const canSubmit = isActive && !mySubmission;

  return (
    <motion.div className="contest-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {contest.background_image_url && <div className="contest-hero" style={{ backgroundImage: `url(${contest.background_image_url})` }} />}
      <div className="contest-info">
        <h1>{contest.title}</h1>
        <p className="theme">Theme: {contest.theme}</p>
        <p>{contest.description}</p>
        <div className="dates">
          <span>Start: {new Date(contest.start_date).toLocaleDateString()}</span>
          <span>End: {new Date(contest.end_date).toLocaleDateString()}</span>
        </div>
      </div>

      {results && (
        <div className="results-section">
          <h2>🏆 Winners</h2>
          {results.winners.map((w, idx) => (
            <div key={w.id} className="winner-card">
              <span className="rank">#{idx+1}</span>
              <strong>{w.title}</strong> by {w.username} – Score: {w.admin_rating}
            </div>
          ))}
        </div>
      )}

      {canSubmit && (
        <div className="submit-section">
          <h2>Submit Your Story</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Story Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            <textarea placeholder="Write your story here..." rows="8" value={formData.story} onChange={e => setFormData({...formData, story: e.target.value})} required />
            <input type="url" placeholder="Cover image URL (optional)" value={formData.cover_image_url} onChange={e => setFormData({...formData, cover_image_url: e.target.value})} />
            <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Story'}</button>
          </form>
        </div>
      )}

      {mySubmission && !results && (
        <div className="my-submission">
          <h2>Your Submission</h2>
          <h3>{mySubmission.title}</h3>
          <p>{mySubmission.story}</p>
          {mySubmission.admin_rating && <p>Admin Rating: {mySubmission.admin_rating} / 10</p>}
        </div>
      )}

      {!isActive && !results && <p>This contest has ended. Check back for winners.</p>}
    </motion.div>
  );
};
export default ContestDetail;
