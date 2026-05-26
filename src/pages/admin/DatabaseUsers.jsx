import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { FiDatabase, FiSearch, FiDownload, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const DatabaseUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getDatabaseUsers();
      // Handle different response structures
      const userList = response?.data?.data?.users || response?.data?.users || [];
      setUsers(userList);
      if (userList.length === 0) {
        toast('No users found in database', { icon: 'ℹ️' });
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load users data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['ID', 'Username', 'Email', 'Full Name', 'Admin', 'Creator', 'Premium', 'Active', 'Created At'];
    const csvRows = filteredUsers.map(user => [
      user.id,
      user.username,
      user.email,
      user.full_name || '',
      user.is_admin ? 'Yes' : 'No',
      user.is_creator ? 'Yes' : 'No',
      user.is_premium ? 'Yes' : 'No',
      user.is_active ? 'Yes' : 'No',
      new Date(user.created_at).toLocaleString()
    ]);
    const csvContent = [headers, ...csvRows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().slice(0,19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <h1><FiDatabase /> Database Users</h1>
        <SkeletonLoader type="card" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <h1><FiDatabase /> Database Users</h1>
        <div className="empty-state">
          <FiAlertCircle size={48} color="#f87171" />
          <p style={{ color: '#f87171' }}>{error}</p>
          <button onClick={fetchUsers} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1><FiDatabase /> Database Users</h1>
      <p className="admin-subtitle">View all registered users (passwords are securely encrypted and not shown)</p>

      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by username, email, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-outline" onClick={exportCSV} disabled={filteredUsers.length === 0}>
          <FiDownload /> Export CSV
        </button>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <FiDatabase size={48} />
          <p>No users found</p>
          {users.length === 0 && !loading && (
            <p style={{ fontSize: '0.8rem', marginTop: 8 }}>No user records in database. Add some users first.</p>
          )}
        </div>
      ) : (
        <div className="admin-table-container" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Admin</th>
                <th>Creator</th>
                <th>Premium</th>
                <th>Active</th>
                <th>Created At</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{user.id.slice(0, 8)}…</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.full_name || '—'}</td>
                  <td><span className={`badge ${user.is_admin ? 'badge-success' : 'badge-danger'}`}>{user.is_admin ? 'Yes' : 'No'}</span></td>
                  <td><span className={`badge ${user.is_creator ? 'badge-info' : 'badge-danger'}`}>{user.is_creator ? 'Yes' : 'No'}</span></td>
                  <td><span className={`badge ${user.is_premium ? 'badge-warning' : 'badge-danger'}`}>{user.is_premium ? 'Yes' : 'No'}</span></td>
                  <td><span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>{user.is_active ? 'Active' : 'Blocked'}</span></td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DatabaseUsers;