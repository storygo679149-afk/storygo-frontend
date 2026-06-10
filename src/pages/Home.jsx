import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import seriesService from '../services/seriesService';
import userService from '../services/userService';
import HeroSection from '../components/home/HeroSection';
import ContinueListeningHome from '../components/home/ContinueListeningHome';
import MoodGrid from '../components/home/MoodGrid';
import TrendingSection from '../components/home/TrendingSection';
import NewReleasesSection from '../components/home/NewReleasesSection';
import TopCreators from '../components/home/TopCreators';
import './Home.css';

const Home = () => {
  const [featuredSeries, setFeaturedSeries] = useState(null);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [latestSeries, setLatestSeries] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [globalStats, setGlobalStats] = useState({ seriesCount: 0, creatorsCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setIsLoading(true);

    // Fetch all needed data in parallel
    const [trendingRes, latestRes, featuredRes, creatorsRes] = await Promise.allSettled([
      seriesService.getTrending({ limit: 5 }),
      seriesService.getAllSeries({ sort: 'latest', limit: 5 }),
      seriesService.getFeaturedSeries(),
      userService.getTopCreators(),
    ]);

    setTrendingSeries(
      trendingRes.status === 'fulfilled' ? extractArray(trendingRes.value, 'trending') : []
    );
    setLatestSeries(
      latestRes.status === 'fulfilled' ? extractArray(latestRes.value) : []
    );
    setFeaturedSeries(
      featuredRes.status === 'fulfilled' ? extractFirst(featuredRes.value) : null
    );
    setTopCreators(
      creatorsRes.status === 'fulfilled' ? extractArray(creatorsRes.value, 'creators') : []
    );

    // ✅ Fetch global stats with correct extraction
    try {
      const response = await userService.getGlobalStats();
      // The backend returns: { status: 'success', data: { series_count, creators_count, ... } }
      const statsData = response?.data?.data;
      if (statsData) {
        setGlobalStats({
          seriesCount: Number(statsData.series_count) || 0,
          creatorsCount: Number(statsData.creators_count) || 0,
        });
      } else {
        console.warn('Unexpected stats response structure:', response?.data);
        setGlobalStats({ seriesCount: 0, creatorsCount: 0 });
      }
    } catch (error) {
      console.error('Global stats fetch failed:', error);
      setGlobalStats({ seriesCount: 0, creatorsCount: 0 });
    }

    setIsLoading(false);
  };

  const extractArray = (response, key = 'series') => {
    const d = response?.data;
    return d?.data?.[key] || d?.[key] || d || [];
  };

  const extractFirst = (response) => {
    const arr = extractArray(response, 'series');
    return arr.length > 0 ? arr[0] : null;
  };

  if (isLoading) {
    return (
      <div className="home-loading">
        <div className="hero-skeleton shimmer" />
        <div className="home-content-skeleton">
          <div className="skeleton-row" />
          <div className="skeleton-grid" />
          <div className="skeleton-row" />
        </div>
      </div>
    );
  }

  return (
    <motion.div className="home-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <HeroSection featuredSeries={featuredSeries} stats={globalStats} />
      <section className="home-section"><ContinueListeningHome /></section>
      <section className="home-section"><MoodGrid /></section>
      <section className="home-section"><TrendingSection series={trendingSeries} /></section>
      <section className="home-section"><NewReleasesSection series={latestSeries} /></section>
      <section className="home-section"><TopCreators creators={topCreators} /></section>
    </motion.div>
  );
};

export default Home;
