import React, { useEffect, useState } from 'react';
import { FiHardDrive, FiTrash2 } from 'react-icons/fi';
import apiService from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';
import './Admin.css';

// Helper to format bytes → human readable
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const StorageMedia = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await apiService.get('/admin/storage');
      // response.data.data.stats contains the payload
      setStats(response.data.data.stats);
    } catch (err) {
      console.error(err);
      setError('Failed to load storage information.');
      toast.error('Failed to load storage stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <h1><FiHardDrive /> Storage & Media</h1>
        <div className="admin-loading">
          <SkeletonLoader type="card" count={4} />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="admin-page">
        <h1><FiHardDrive /> Storage & Media</h1>
        <div className="empty-state">
          <p>{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1><FiHardDrive /> Storage & Media</h1>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Storage Used</h3>
          <p>{formatBytes(stats.cloudinary.storage_bytes)}</p>
        </div>
        <div className="stat-card">
          <h3>Bandwidth Used</h3>
          <p>{formatBytes(stats.cloudinary.bandwidth_bytes)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Episodes</h3>
          <p>{stats.database.total_episodes}</p>
        </div>
        <div className="stat-card">
          <h3>Database Size</h3>
          <p>{formatBytes(stats.database.total_size_bytes)}</p>
        </div>
      </div>

      {/* Orphaned Files Section */}
      <div className="section" style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '12px' }}>Orphaned Files</h3>
        {stats.orphaned_files.length === 0 ? (
          <div className="empty-state">
            <FiHardDrive size={32} />
            <p>{stats.orphaned_note || 'No orphaned files detected.'}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>File ID</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.orphaned_files.map(file => (
                <tr key={file.public_id}>
                  <td>{file.public_id}</td>
                  <td>{formatBytes(file.bytes)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => toast.error('Not implemented yet')}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '8px' }}>
          Orphan detection will compare Cloudinary files with database records.
        </p>
      </div>
    </div>
  );
};

export default StorageMedia;