import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import seriesService from '../services/seriesService';
import SeriesGrid from '../components/series/SeriesGrid';
import Pagination from '../components/common/Pagination';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FiTrendingUp, FiCalendar, FiActivity, FiAlertCircle } from 'react-icons/fi';
import './Trending.css';

const Trending = () => {
  const [activePeriod, setActivePeriod] = useState('weekly');
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrending();
  }, [activePeriod, pagination.page]);

  // Helper: safely extract data from axios response
  const extractData = (response, key) => {
    const payload = response?.data;          // Axios wrapper
    if (!payload) return [];
    // the server always wraps in { status, data: { [key]: [...] } }
    const serverData = payload.data;         // server's "data" object
    if (serverData && serverData[key]) return serverData[key];
    // Fallback: maybe the server returned array directly?
    if (Array.isArray(serverData)) return serverData;
    // final fallback
    return [];
  };

  const fetchTrending = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data;
      switch (activePeriod) {
        case 'daily':
          data = await seriesService.getDailyTrending();
          setTrendingSeries(extractData(data, 'daily_trending'));
          setPagination({ page: 1, totalPages: 1 });
          break;
        case 'weekly':
          data = await seriesService.getWeeklyTrending();
          setTrendingSeries(extractData(data, 'weekly_trending'));
          setPagination({ page: 1, totalPages: 1 });
          break;
        default:
          data = await seriesService.getTrending({
            page: pagination.page,
            limit: 20
          });
          setTrendingSeries(extractData(data, 'trending'));
          const pag = data?.data?.pagination || {};
          setPagination({
            page: pag.page || 1,
            totalPages: pag.pages || 1
          });
      }
    } catch (error) {
      console.error('Error fetching trending:', error);
      setError('Failed to load trending content');
    } finally {
      setIsLoading(false);
    }
  };

  const periods = [
    { key: 'daily', label: 'Today', icon: <FiActivity /> },
    { key: 'weekly', label: 'This Week', icon: <FiCalendar /> },
    { key: 'all', label: 'All Time', icon: <FiTrendingUp /> }
  ];

  return (
    <div className="trending-page">
      <div className="trending-header">
        <h1>
          <FiTrendingUp />
          Trending
        </h1>
        <p>Discover what's popular right now</p>
      </div>

      <div className="trending-periods">
        {periods.map((period) => (
          <button
            key={period.key}
            className={`period-btn ${activePeriod === period.key ? 'active' : ''}`}
            onClick={() => {
              setActivePeriod(period.key);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            {period.icon}
            {period.label}
          </button>
        ))}
      </div>

      <div className="trending-content">
        {isLoading ? (
          <SkeletonLoader type="card" count={12} />
        ) : error ? (
          <div className="trending-error">
            <FiAlertCircle size={48} />
            <h2>{error}</h2>
            <button onClick={fetchTrending} className="retry-btn">Try Again</button>
          </div>
        ) : trendingSeries.length === 0 ? (
          <div className="trending-empty">
            <FiTrendingUp size={48} />
            <h2>No trending content</h2>
            <p>Check back later for trending series</p>
          </div>
        ) : (
          <>
            <SeriesGrid series={trendingSeries} />
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Trending;