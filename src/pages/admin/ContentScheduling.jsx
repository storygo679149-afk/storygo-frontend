import React, { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiTrash2, FiPlus } from 'react-icons/fi';
import apiService from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';
import './Admin.css';

const ContentScheduling = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [adding, setAdding] = useState(false);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const response = await apiService.get('/admin/schedule');
      const data = response.data.data?.schedules || response.data?.schedules || [];
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  // Fetch episodes for selection (using admin endpoint)
  const fetchEpisodes = async () => {
    try {
      const response = await apiService.get('/admin/episodes');
      const data = response.data || response.data?.data || [];
      setEpisodes(data);
    } catch (error) {
      console.error('Failed to load episodes:', error);
      toast.error('Failed to load episode list');
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchEpisodes();
  }, []);

  // Create new schedule
  const handleAdd = async () => {
    if (!selectedEpisodeId || !scheduledAt) {
      toast.error('Please select an episode and time');
      return;
    }
    setAdding(true);
    try {
      await apiService.post('/admin/schedule', {
        episode_id: selectedEpisodeId,
        scheduled_at: new Date(scheduledAt).toISOString(),
      });
      toast.success('Schedule created');
      setSelectedEpisodeId('');
      setScheduledAt('');
      fetchSchedules();
    } catch (error) {
      console.error('Create schedule error:', error);
      toast.error('Failed to create schedule');
    } finally {
      setAdding(false);
    }
  };

  // Delete schedule
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await apiService.delete(`/admin/schedule/${id}`);
      toast.success('Schedule deleted');
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Delete schedule error:', error);
      toast.error('Failed to delete schedule');
    }
  };

  return (
    <div className="admin-page">
      <h1><FiCalendar /> Content Scheduling</h1>

      {/* Add new schedule card */}
      <div className="stat-card" style={{ marginBottom: '24px' }}>
        <h3>Schedule New Release</h3>
        <div
          className="form-group"
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label>Episode</label>
            <select
              className="filter-select"
              value={selectedEpisodeId}
              onChange={e => setSelectedEpisodeId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Select an episode</option>
              {episodes.map(ep => (
                <option key={ep.id} value={ep.id}>
                  {ep.title} (Ep {ep.episode_number})
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label>Release Date & Time</label>
            <input
              type="datetime-local"
              className="form-input"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={adding}
          >
            <FiPlus /> {adding ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>

      {/* Schedule list */}
      {loading ? (
        <div className="admin-loading">
          <SkeletonLoader type="card" count={3} />
        </div>
      ) : schedules.length === 0 ? (
        <div className="empty-state">
          <FiCalendar size={48} />
          <p>No scheduled releases</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Episode</th>
              <th>Series</th>
              <th>Scheduled At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map(s => (
              <tr key={s.id}>
                <td>{s.episode_title} (Ep {s.episode_number})</td>
                <td>{s.series_title}</td>
                <td>{new Date(s.scheduled_at).toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${
                      s.is_published ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {s.is_published ? 'Published' : 'Pending'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleDelete(s.id)}
                    disabled={s.is_published}
                  >
                    <FiTrash2
                      color={s.is_published ? '#888' : '#F87171'}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ContentScheduling;