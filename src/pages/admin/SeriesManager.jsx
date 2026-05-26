import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import seriesService from '../../services/seriesService'; // for delete/update
import SkeletonLoader from '../../components/common/SkeletonLoader';
import {
  FiSearch, FiEdit3, FiTrash2, FiEye,
  FiToggleLeft, FiToggleRight, FiBookOpen // <-- added
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminSeries = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editSeries, setEditSeries] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'ongoing', is_premium: false });

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSeries();
      const filtered = search ? res.data.filter(s => s.title.toLowerCase().includes(search.toLowerCase())) : res.data;
      setSeries(filtered);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSeries(); }, [search]);

  const toggleActive = async (id, current) => {
    try {
      await adminService.updateSeriesStatus(id, !current);
      toast.success('Status updated');
      fetchSeries();
    } catch { toast.error('Failed'); }
  };

  const deleteSeries = async (id) => {
    if (!window.confirm('Delete this series?')) return;
    try {
      await seriesService.deleteSeries(id); // from seriesService
      toast.success('Deleted');
      fetchSeries();
    } catch { toast.error('Failed'); }
  };

  const openEdit = (s) => {
    setEditSeries(s);
    setForm({ title: s.title, description: s.description || '', status: s.status, is_premium: s.is_premium });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await seriesService.updateSeries(editSeries.id, form); // updateSeries from seriesService
      toast.success('Updated');
      setEditSeries(null);
      fetchSeries();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="admin-page">
      <h1>Series Management</h1>
      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input placeholder="Search series..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-outline" onClick={() => {
          const csv = series.map(s => `${s.title},${s.creator_name},${s.status}`).join('\n');
          const blob = new Blob([csv]); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'series.csv'; a.click();
        }}>Export CSV</button>
      </div>

      {loading ? <div className="admin-loading"><SkeletonLoader type="card" count={4} /></div> : series.length === 0 ? (
        <div className="empty-state"><FiSearch size={48} /><p>No series found</p></div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Creator</th>
              <th>Status</th>
              <th>Episodes</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {series.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {s.thumbnail_url ? <img src={s.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <FiBookOpen />}
                  </div>
                </td>
                <td>{s.title}</td>
                <td>{s.creator_name}</td>
                <td><span className={`badge ${s.status === 'ongoing' ? 'badge-info' : s.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                <td>{s.total_episodes || 0}</td>
                <td>
                  <button className="toggle-btn" onClick={() => toggleActive(s.id, s.is_active)}>
                    {s.is_active ? <FiToggleRight color="#34D399" /> : <FiToggleLeft color="#F87171" />}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(s)}><FiEdit3 /></button>
                    <button className="btn btn-sm btn-outline" onClick={() => deleteSeries(s.id)}><FiTrash2 color="#F87171" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editSeries && (
        <div className="modal-overlay" onClick={() => setEditSeries(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Series</h2>
            <form className="modal-form" onSubmit={handleUpdate}>
              <div className="form-group"><label>Title</label><input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="form-group"><label>Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} /></div>
              <div className="form-group"><label>Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                </select>
              </div>
              <div className="form-group">
                <label>Premium</label>
                <input type="checkbox" checked={form.is_premium} onChange={e => setForm({...form, is_premium: e.target.checked})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditSeries(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeries;