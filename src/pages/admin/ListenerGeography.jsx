import React, { useEffect, useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import apiService from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import './Admin.css';

const ListenerGeography = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiService.get('/admin/listeners/cities');
        const list = response.data?.data?.cities || [];
        setCities(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  return (
    <div className="admin-page">
      <h1><FiMapPin /> Listeners by City</h1>

      {loading ? (
        <div className="admin-loading"><SkeletonLoader type="card" count={4} /></div>
      ) : cities.length === 0 ? (
        <div className="empty-state">
          <p>No listener data yet. Play some episodes to see results.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>City</th><th>Listeners</th></tr>
          </thead>
          <tbody>
            {cities.map(c => (
              <tr key={c.city}>
                <td>{c.city}</td>
                <td>{c.listeners}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListenerGeography;