import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminModeration.css';

const AdminModeration = () => {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFlagged(); }, []);

  const fetchFlagged = async () => {
    try {
      const res = await api.get('/admin/flagged');
      setFlagged(res.data.data);
    } catch (err) { toast.error('Failed to load flagged content'); }
    finally { setLoading(false); }
  };

  const resolveAction = async (id, action, notes = '') => {
    try {
      await api.post(`/admin/flagged/${id}/resolve`, { action, notes });
      toast.success(`Content ${action === 'remove' ? 'removed' : action + 'ed'}`);
      fetchFlagged();
    } catch (err) { toast.error('Action failed'); }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-moderation">
      <h1>Moderation Queue</h1>
      <table className="admin-table">
        <thead><tr><th>Type</th><th>Content ID</th><th>Reason</th><th>Reported By</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {flagged.map(item => (
            <tr key={item.id}>
              <td>{item.content_type}</td>
              <td>{item.content_id}</td>
              <td>{item.reason}</td>
              <td>{item.reporter_name || 'Anonymous'}</td>
              <td>{new Date(item.created_at).toLocaleDateString()}</td>
              <td>
                <button className="btn-sm" onClick={() => resolveAction(item.id, 'warn')}>Warn</button>
                <button className="btn-sm remove" onClick={() => resolveAction(item.id, 'remove')}>Remove</button>
                <button className="btn-sm escalate" onClick={() => resolveAction(item.id, 'escalate')}>Escalate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};
export default AdminModeration;
