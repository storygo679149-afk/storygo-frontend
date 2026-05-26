import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { FiSearch, FiDollarSign } from 'react-icons/fi';
import './Admin.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    adminService.getPayments()
      .then(res => {
        const all = res.data;
        setPayments(filterStatus === 'all' ? all : all.filter(p => p.status === filterStatus));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const exportCSV = () => {
    const csv = payments.map(p => `${p.username},${p.amount},${p.status},${p.created_at}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'payments.csv'; a.click();
  };

  return (
    <div className="admin-page">
      <h1>Payments</h1>
      <div className="admin-toolbar">
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="succeeded">Succeeded</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <button className="btn btn-outline" onClick={exportCSV}>Export CSV</button>
      </div>
      {loading ? <div className="admin-loading"><SkeletonLoader type="card" count={4} /></div> : payments.length === 0 ? (
        <div className="empty-state"><FiDollarSign size={48} /><p>No payments found</p></div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td>{p.username}</td>
                <td>₹{(p.amount / 100).toFixed(2)}</td>
                <td><span className={`badge ${p.status === 'succeeded' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span></td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPayments;