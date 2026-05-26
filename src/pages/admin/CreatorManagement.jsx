import React, { useEffect, useState } from 'react';
import { FiUserCheck, FiRefreshCw } from 'react-icons/fi';
import apiService from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';
import './Admin.css';

const CreatorManagement = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCreators = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get('/admin/creators');
      const list = response.data?.data?.creators || [];
      setCreators(list);
    } catch (err) {
      console.error(err);
      setError('Failed to load creators.');
      toast.error('Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  // ----- Loading state -----
  if (loading) {
    return (
      <div className="admin-page">
        <h1><FiUserCheck /> Creator Management</h1>
        <div className="admin-loading">
          <SkeletonLoader type="card" count={4} />
        </div>
      </div>
    );
  }

  // ----- Error state -----
  if (error) {
    return (
      <div className="admin-page">
        <h1><FiUserCheck /> Creator Management</h1>
        <div className="empty-state">
          <p>{error}</p>
          <button className="btn btn-outline" onClick={fetchCreators}>
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ----- Empty state -----
  if (creators.length === 0) {
    return (
      <div className="admin-page">
        <h1><FiUserCheck /> Creator Management</h1>
        <div className="empty-state">
          <p>No creators found.</p>
        </div>
      </div>
    );
  }

  // ----- Main table -----
  return (
    <div className="admin-page">
      <h1><FiUserCheck /> Creator Management</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Creator</th>
            <th>Email</th>
            <th>Series</th>
            <th>Followers</th>
          </tr>
        </thead>
        <tbody>
          {creators.map(creator => (
            <tr key={creator.id}>
              <td>{creator.full_name || creator.username}</td>
              <td>{creator.email}</td>
              <td>{creator.series_count}</td>
              <td>{creator.followers_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CreatorManagement;