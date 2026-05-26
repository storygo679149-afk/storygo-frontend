import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import {
  FiUsers, FiStar, FiBookOpen, FiHeadphones,
  FiDollarSign, FiPlus, FiList, FiUploadCloud
} from 'react-icons/fi';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          adminService.getDashboard(),
          adminService.getUsers({ limit: 5, sort: 'newest' })
        ]);
        setStats(statsRes.data);
        setRecentUsers(usersRes.data.users.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="admin-content"><SkeletonLoader type="card" count={6} /></div>;

  const cards = [
    { label: 'Total Users', value: stats?.total_users, icon: <FiUsers />, color: '#6366F1' },
    { label: 'Premium Users', value: stats?.premium_users, icon: <FiStar />, color: '#F59E0B' },
    { label: 'Active Subscriptions', value: stats?.active_subscriptions, icon: <FiDollarSign />, color: '#10B981' },
    { label: 'Total Series', value: stats?.total_series, icon: <FiBookOpen />, color: '#3B82F6' },
    { label: 'Episodes', value: stats?.total_episodes, icon: <FiHeadphones />, color: '#8B5CF6' },
    { label: 'Revenue', value: `₹${((stats?.total_revenue || 0) / 100).toFixed(2)}`, icon: <FiDollarSign />, color: '#EC4899' },
  ];

  return (
    <div className="admin-page">
      <h1>Dashboard Overview</h1>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
          <FiUsers /> Manage Users
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/admin/series')}>
          <FiList /> All Series
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/admin/episodes')}>
          <FiHeadphones /> Episodes
        </button>
      </div>

      <div className="stats-grid">
        {cards.map(card => (
          <div key={card.label} className="stat-card" style={{ borderLeft: `4px solid ${card.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{card.label}</h3>
              <span style={{ color: card.color, fontSize: '1.8rem' }}>{card.icon}</span>
            </div>
            <p>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Registrations */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Recent Users</h2>
        {recentUsers.length === 0 ? (
          <div className="empty-state"><FiUsers size={48} /><p>No users found</p></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Premium</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.full_name || u.username}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.is_premium ? 'badge-success' : 'badge-danger'}`}>{u.is_premium ? 'Yes' : 'No'}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;