import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminAuditLogs.css';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 50 });
  const [filterAction, setFilterAction] = useState('');
  const [filterAdmin, setFilterAdmin] = useState('');

  useEffect(() => { fetchLogs(); }, [pagination.page, filterAction, filterAdmin]);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/admin/audit-logs?page=${pagination.page}&limit=50&action=${filterAction}&admin=${filterAdmin}`);
      setLogs(res.data.data);
      setPagination(prev => ({ ...prev, total: res.data.total }));
    } catch (err) { toast.error('Failed to load audit logs'); }
  };

  return (
    <motion.div className="admin-auditlogs">
      <h1>Audit Logs</h1>
      <div className="audit-filters">
        <input type="text" placeholder="Filter by action" value={filterAction} onChange={e => setFilterAction(e.target.value)} />
        <input type="text" placeholder="Filter by admin" value={filterAdmin} onChange={e => setFilterAdmin(e.target.value)} />
      </div>
      <table className="admin-table">
        <thead>
          <tr><th>Admin</th><th>Action</th><th>Target Type</th><th>Target ID</th><th>Details</th><th>IP</th><th>Date</th></tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.admin_name || 'System'}</td>
              <td>{log.action}</td>
              <td>{log.target_type || '-'}</td>
              <td>{log.target_id ? log.target_id.slice(0,8)+'…' : '-'}</td>
              <td><pre className="log-details">{JSON.stringify(log.details, null, 2)}</pre></td>
              <td>{log.ip_address}</td>
              <td>{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={pagination.page === 1} onClick={() => setPagination({...pagination, page: pagination.page-1})}>Previous</button>
        <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}</span>
        <button disabled={pagination.page * pagination.limit >= pagination.total} onClick={() => setPagination({...pagination, page: pagination.page+1})}>Next</button>
      </div>
    </motion.div>
  );
};
export default AdminAuditLogs;
