import React, { useEffect, useState } from 'react';
import { FiShield, FiSearch } from 'react-icons/fi';
import apiService from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import './Admin.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [error, setError] = useState(null);

  const fetchLogs = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/audit-logs', {
        page,
        limit: 20,
        action: searchTerm || undefined,
      });
      const data = response.data.data;
      setLogs(data.logs);
      setPagination({
        page: data.pagination.page,
        totalPages: data.pagination.pages,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.page, search);
  }, [pagination.page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // Reset to first page when searching
    fetchLogs(1, e.target.value);
  };

  return (
    <div className="admin-page">
      <h1><FiShield /> Audit Logs</h1>
      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            placeholder="Search by action..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <SkeletonLoader type="card" count={4} />
        </div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <p>No audit logs found.</p>
        </div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Action</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{log.admin_full_name || log.admin_username}</td>
                  <td>{log.action}</td>
                  <td>{log.ip_address || '—'}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                ‹
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  className={pagination.page === i + 1 ? 'active' : ''}
                  onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogs;