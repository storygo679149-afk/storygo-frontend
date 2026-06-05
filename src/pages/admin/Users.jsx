import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import authService from '../../services/authService';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { FiSearch, FiUserPlus, FiEdit3, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterPremium, setFilterPremium] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ page, limit: 10, search });
      let filtered = res.data.users;
      if (filterPremium !== 'all') {
        filtered = filtered.filter(u => (filterPremium === 'premium' ? u.is_premium : !u.is_premium));
      }
      setUsers(filtered);
      setTotalPages(Math.ceil(res.data.total / 10));
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterPremium]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleStatus = async (userId, current) => {
    try {
      await adminService.toggleUserStatus(userId, !current);
      toast.success('Status updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(selectedIds.map(id => adminService.toggleUserStatus(id, false)));
      toast.success('Users deactivated');
      setSelectedIds([]);
      fetchUsers();
    } catch {
      toast.error('Failed to deactivate users');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await authService.signup(form);
      toast.success('User created');
      setShowAddModal(false);
      setForm({ username: '', email: '', password: '', full_name: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const togglePremium = async (userId, current) => {
    try {
      await adminService.togglePremium(userId, !current);
      toast.success('Premium status updated');
      setEditUser(prev => prev ? { ...prev, is_premium: !current } : null);
      fetchUsers();
    } catch {
      toast.error('Failed to update premium status');
    }
  };

  const selectAll = (e) => {
    if (e.target.checked) setSelectedIds(users.map(u => u.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const exportCSV = () => {
    const header = 'Full Name,Email,Premium,Active';
    const rows = users.map(u =>
      `${u.full_name || u.username},${u.email},${u.is_premium ? 'Yes' : 'No'},${u.is_active ? 'Yes' : 'No'}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page">
      <h1>User Management</h1>

      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="filter-select"
          value={filterPremium}
          onChange={(e) => setFilterPremium(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="premium">Premium Only</option>
          <option value="free">Free Only</option>
        </select>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <FiUserPlus /> Add User
        </button>
        <button className="btn btn-outline" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedIds.length} selected</span>
          <button className="btn btn-sm btn-danger" onClick={deleteSelected}>
            <FiTrash2 /> Deactivate Selected
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">
          <SkeletonLoader type="card" count={4} />
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <FiSearch size={48} />
          <p>No users found</p>
        </div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input
                    type="checkbox"
                    onChange={selectAll}
                    checked={users.length > 0 && selectedIds.length === users.length}
                  />
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Premium</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      className="admin-checkbox"
                      checked={selectedIds.includes(u.id)}
                      onChange={() => toggleSelect(u.id)}
                    />
                  </td>
                  <td>{u.full_name || u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.is_premium ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_premium ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="toggle-btn" onClick={() => toggleStatus(u.id, u.is_active)}>
                        {u.is_active
                          ? <FiToggleRight color="#34D399" />
                          : <FiToggleLeft color="#F87171" />
                        }
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setEditUser(u)}
                      >
                        <FiEdit3 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={page === i + 1 ? 'active' : ''}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New User</h2>
            <form className="modal-form" onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="form-input"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  className="form-input"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit {editUser.full_name || editUser.username}</h2>
            <form className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" value={editUser.full_name || ''} readOnly />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" value={editUser.email} readOnly />
              </div>
              <div className="form-group">
                <label>Premium Status</label>
                <button
                  type="button"
                  className={`btn btn-sm ${editUser.is_premium ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => togglePremium(editUser.id, editUser.is_premium)}
                >
                  {editUser.is_premium ? 'Remove Premium' : 'Make Premium'}
                </button>
              </div>
              <div className="form-group">
                <label>Account Status</label>
                <button
                  type="button"
                  className={`btn btn-sm ${editUser.is_active ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => {
                    toggleStatus(editUser.id, editUser.is_active);
                    setEditUser(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
                  }}
                >
                  {editUser.is_active ? 'Block User' : 'Unblock User'}
                </button>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditUser(null)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
