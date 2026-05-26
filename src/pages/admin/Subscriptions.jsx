import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { FiCreditCard } from 'react-icons/fi';
import './Admin.css';

const AdminSubscriptions = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('active');

  useEffect(() => {
    adminService.getSubscriptions()
      .then(res => {
        const all = res.data;
        setSubs(filterStatus === 'all' ? all : all.filter(s => s.status === filterStatus));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus]);

  return (
    <div className="admin-page">
      <h1>Subscriptions</h1>
      <div className="admin-toolbar">
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="canceled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      {loading ? <div className="admin-loading"><SkeletonLoader type="card" count={4} /></div> : subs.length === 0 ? (
        <div className="empty-state"><FiCreditCard size={48} /><p>No subscriptions</p></div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>User</th><th>Plan</th><th>Status</th><th>Since</th></tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s.id}>
                <td>{s.username}</td>
                <td>{s.plan_name}</td>
                <td><span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminSubscriptions;