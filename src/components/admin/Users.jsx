import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [onboardingQueue, setOnboardingQueue] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers();
    fetchOnboarding();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users?search=${search}`);
      setUsers(res.data.data);
    } catch (err) { toast.error('Failed to load users'); }
  };
  const fetchOnboarding = async () => {
    try {
      const res = await api.get('/admin/creator-onboarding?status=pending');
      setOnboardingQueue(res.data.data);
    } catch (err) { toast.error('Failed load onboarding'); }
  };
  const handleUserAction = async (userId, action, reason = '') => {
    try {
      await api.put(`/admin/users/${userId}/status`, { action, reason });
      toast.success(`User ${action}ned`);
      fetchUsers();
    } catch (err) { toast.error('Action failed'); }
  };
  const approveCreator = async (onboardId, revenueShare) => {
    try {
      await api.post(`/admin/creator-onboarding/${onboardId}/approve`, { revenue_share: revenueShare });
      toast.success('Creator approved');
      fetchOnboarding();
      fetchUsers();
    } catch (err) { toast.error('Approval failed'); }
  };
  const viewUserDetails = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
      setShowDrawer(true);
    } catch (err) { toast.error('Could not load details'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-users">
      <h1>User Management</h1>
      <div className="admin-tabs">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Listeners & Creators</button>
        <button className={activeTab === 'onboarding' ? 'active' : ''} onClick={() => setActiveTab('onboarding')}>
          Creator Requests ({onboardingQueue.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <input type="text" placeholder="Search by username or email" value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
          <table className="admin-table">
            <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td><td>{u.email}</td>
                  <td>{u.is_creator ? 'Creator' : u.is_admin ? 'Admin' : 'Listener'}</td>
                  <td>{u.is_active ? 'Active' : 'Suspended'}</td>
                  <td>
                    <button className="btn-sm" onClick={() => viewUserDetails(u.id)}>View</button>
                    <button className="btn-sm warn" onClick={() => handleUserAction(u.id, 'warn')}>Warn</button>
                    <button className="btn-sm suspend" onClick={() => handleUserAction(u.id, 'suspend', 'Suspended by admin')}>Suspend</button>
                    <button className="btn-sm ban" onClick={() => handleUserAction(u.id, 'ban', 'Banned by admin')}>Ban</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'onboarding' && (
        <div className="onboarding-queue">
          {onboardingQueue.map(req => (
            <div key={req.id} className="onboarding-card">
              <h3>{req.full_name}</h3>
              <p>@{req.username} · {req.email}</p>
              <p>Submitted: {new Date(req.submitted_at).toLocaleDateString()}</p>
              <div className="flex gap-2">
                <input type="number" id={`rev-${req.id}`} placeholder="Revenue share %" defaultValue="70" />
                <button onClick={() => approveCreator(req.id, document.getElementById(`rev-${req.id}`).value)}>Approve</button>
                <button className="danger">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer for user details */}
      {showDrawer && selectedUser && (
        <div className="drawer-overlay" onClick={() => setShowDrawer(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <h2>{selectedUser.user.username}</h2>
            <p>Email: {selectedUser.user.email}</p>
            <p>Joined: {new Date(selectedUser.user.created_at).toLocaleDateString()}</p>
            <h3>Listening History</h3>
            <ul>
              {selectedUser.listeningHistory.map(h => (
                <li key={h.id}>{h.series_title} - {h.episode_title} at {new Date(h.listened_at).toLocaleString()}</li>
              ))}
            </ul>
            <button onClick={() => setShowDrawer(false)}>Close</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
export default AdminUsers;
