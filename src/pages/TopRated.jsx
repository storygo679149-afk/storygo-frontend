import React, { useState, useEffect } from 'react';
import seriesService from '../services/seriesService';
import SeriesGrid from '../components/series/SeriesGrid';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FiStar } from 'react-icons/fi';
import './TopRated.css';

const TopRated = () => {
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    seriesService.getAllSeries({ sort: 'rating', limit: 20 })
      .then(res => {
        const s = res.data?.data?.series || res.data?.series || [];
        setSeries(s);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="page-loader">
        <SkeletonLoader type="card" count={8} />
      </div>
    );
  }

  return (
    <div className="top-rated-page">
      <h1><FiStar /> Top Rated Series</h1>
      <p>Highest rated by our listeners</p>
      <SeriesGrid series={series} />
    </div>
  );
};

export default TopRated;