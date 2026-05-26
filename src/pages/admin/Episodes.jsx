import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import episodeService from '../../services/episodeService';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import {
  FiSearch, FiEdit3, FiTrash2, FiHeadphones, FiFilter
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

// Utility to format seconds → MM:SS or HH:MM:SS
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AdminEpisodes = () => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [allSeries, setAllSeries] = useState([]);   // for filter dropdown
  const [editEp, setEditEp] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      const [epRes, seriesRes] = await Promise.all([
        adminService.getEpisodes(),
        adminService.getSeries()
      ]);

      // Build series list for filter
      const seriesMap = seriesRes.data.map(s => ({ id: s.id, title: s.title }));
      setAllSeries(seriesMap);

      let filtered = epRes.data;
      if (seriesFilter !== 'all') {
        filtered = filtered.filter(e => e.series_id === seriesFilter);
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          e => e.title.toLowerCase().includes(q) ||
               e.series_title.toLowerCase().includes(q)
        );
      }
      setEpisodes(filtered);
    } catch (err) {
      toast.error('Failed to load episodes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, [search, seriesFilter]);

  const deleteEpisode = async (id) => {
    if (!window.confirm('Delete this episode?')) return;
    try {
      await episodeService.deleteEpisode(id);
      toast.success('Deleted');
      fetchEpisodes();
    } catch {
      toast.error('Failed');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await episodeService.updateEpisode(editEp.id, form);
      toast.success('Updated');
      setEditEp(null);
      fetchEpisodes();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="admin-page">
      <h1>Episode Management</h1>

      {/* Toolbar with search & filter */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            placeholder="Search episodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <FiFilter style={{ color: 'var(--admin-text-muted)' }} />
          <select
            className="filter-select"
            value={seriesFilter}
            onChange={(e) => setSeriesFilter(e.target.value)}
          >
            <option value="all">All Series</option>
            {allSeries.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Episode Table */}
      {loading ? (
        <div className="admin-loading">
          <SkeletonLoader type="card" count={5} />
        </div>
      ) : episodes.length === 0 ? (
        <div className="empty-state">
          <FiHeadphones size={48} />
          <p>No episodes found</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Series</th>
              <th>Ep #</th>
              <th>Duration</th>
              <th>Plays</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map(ep => (
              <tr key={ep.id}>
                <td>{ep.title}</td>
                <td>{ep.series_title}</td>
                <td>{ep.episode_number}</td>
                <td>{formatDuration(ep.duration_seconds)}</td>
                <td>{ep.play_count ?? 0}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setEditEp(ep);
                        setForm({ title: ep.title, description: ep.description });
                      }}
                    >
                      <FiEdit3 />
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => deleteEpisode(ep.id)}
                    >
                      <FiTrash2 color="#F87171" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {editEp && (
        <div className="modal-overlay" onClick={() => setEditEp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Episode</h2>
            <form className="modal-form" onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Title</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditEp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEpisodes;