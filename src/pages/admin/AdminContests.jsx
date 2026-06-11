import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminContests.css';

const AdminContests = () => {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    start_date: '',
    end_date: '',
    background_image_url: ''
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/contests');
      setContests(res.data.data);
    } catch (err) {
      toast.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (contestId) => {
    try {
      const res = await api.get(`/admin/contests/${contestId}/submissions`);
      setSubmissions(res.data.data);
    } catch (err) {
      toast.error('Failed to load submissions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/contests', formData);
      toast.success('Contest created');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        theme: '',
        start_date: '',
        end_date: '',
        background_image_url: ''
      });
      fetchContests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create contest');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async (submissionId, rating) => {
    try {
      await api.post(`/admin/contests/${selectedContest.id}/submissions/${submissionId}/rate`, { rating, notes: '' });
      toast.success('Rating saved');
      fetchSubmissions(selectedContest.id);
    } catch (err) {
      toast.error('Failed to rate');
    }
  };

  const determineWinner = async () => {
    if (!window.confirm('Are you sure? This will mark the contest as ended and declare a winner.')) return;
    try {
      await api.post(`/admin/contests/${selectedContest.id}/determine-winner`);
      toast.success('Winner determined');
      fetchSubmissions(selectedContest.id);
      fetchContests(); // refresh status
    } catch (err) {
      toast.error('Failed to determine winner');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  return (
    <motion.div className="admin-contests" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-contests-header">
        <h1>Contests Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Contest</button>
      </div>

      {showForm && (
        <div className="contest-form-modal" onClick={() => setShowForm(false)}>
          <div className="contest-form" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Contest</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description (optional)"
                rows="3"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Theme (e.g., Underground secret agent)"
                value={formData.theme}
                onChange={e => setFormData({ ...formData, theme: e.target.value })}
              />
              <input
                type="datetime-local"
                placeholder="Start Date"
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
              <input
                type="datetime-local"
                placeholder="End Date"
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
              <input
                type="url"
                placeholder="Background image URL (optional)"
                value={formData.background_image_url}
                onChange={e => setFormData({ ...formData, background_image_url: e.target.value })}
              />
              <div className="form-actions">
                <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading contests...</div>
      ) : contests.length === 0 ? (
        <div className="empty-state">No contests yet. Click "+ New Contest" to get started.</div>
      ) : (
        <div className="contests-list">
          {contests.map(c => (
            <div
              key={c.id}
              className="contest-card"
              onClick={() => { setSelectedContest(c); fetchSubmissions(c.id); }}
            >
              <h3>{c.title}</h3>
              <p>{c.theme || 'No theme specified'}</p>
              <small>{formatDate(c.start_date)} – {formatDate(c.end_date)}</small>
              <span className={`status ${c.status}`}>{c.status}</span>
            </div>
          ))}
        </div>
      )}

      {selectedContest && (
        <div className="submissions-panel">
          <div className="submissions-header">
            <h2>Submissions for "{selectedContest.title}"</h2>
            <button className="btn-sm" onClick={determineWinner}>🏆 Determine Winner</button>
          </div>
          {submissions.length === 0 ? (
            <p className="empty-submissions">No submissions yet.</p>
          ) : (
            <div className="submissions-grid">
              {submissions.map(s => (
                <div key={s.id} className="submission-card">
                  <h4>{s.title}</h4>
                  <p className="story-preview">{s.story.substring(0, 120)}...</p>
                  <div className="rating-area">
                    <label>Admin Rating (0-10):</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      defaultValue={s.admin_rating || ''}
                      onBlur={(e) => handleRate(s.id, parseFloat(e.target.value))}
                    />
                    {s.admin_rating && <span className="current-rating">Current: {s.admin_rating}</span>}
                  </div>
                  <div className="submission-meta">by {s.username || s.full_name}</div>
                </div>
              ))}
            </div>
          )}
          <button className="close-submissions" onClick={() => setSelectedContest(null)}>Close</button>
        </div>
      )}
    </motion.div>
  );
};

export default AdminContests;
