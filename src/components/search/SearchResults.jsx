import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import seriesService from '../../services/seriesService';
import SeriesCard from '../series/SeriesCard';
import SkeletonLoader from '../common/SkeletonLoader';
import Pagination from '../common/Pagination';
import {
  FiSearch, FiFilter, FiX, FiChevronDown,
  FiBookOpen, FiHeadphones, FiSliders
} from 'react-icons/fi';
import './SearchResults.css';

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState({ series: [], episodes: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    type: 'all',
    category: '',
    language: '',
    sort: 'relevance',
    duration: ''       // ✅ duration filter
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query, activeTab, pagination.page, filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const params = {
        type: activeTab,
        page: pagination.page,
        limit: 20,
        // include all filter values
        category: filters.category,
        language: filters.language,
        sort: filters.sort,
        duration: filters.duration
      };
      const data = await seriesService.search(query, params);
      
      setResults(data.results || { series: [], episodes: [] });
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      console.error('Search error:', error);
      setResults({ series: [], episodes: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await seriesService.getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: '',
      language: '',
      sort: 'relevance',
      duration: ''
    });
  };

  const totalResults = (results.series?.length || 0) + (results.episodes?.length || 0);

  const tabs = [
    { key: 'all', label: 'All Results', count: totalResults },
    { key: 'series', label: 'Series', count: results.series?.length || 0 },
    { key: 'episodes', label: 'Episodes', count: results.episodes?.length || 0 }
  ];

  return (
    <div className="search-results-page">
      {/* Search Header */}
      <motion.div
        className="search-results-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="search-query-info">
          <FiSearch className="search-query-icon" />
          <div>
            <h1 className="search-query-text">"{query}"</h1>
            <p className="search-query-count">
              {pagination.total || totalResults} results found
            </p>
          </div>
        </div>
        
        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiSliders />
          Filters
          <FiChevronDown className={`filter-arrow ${showFilters ? 'rotate' : ''}`} />
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="search-tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`search-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </motion.div>

      {/* Filters Panel with DURATION */}
      <motion.div
        className={`filters-panel ${showFilters ? 'open' : ''}`}
        initial={false}
        animate={{ height: showFilters ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="filters-content">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Language</label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="filter-select"
            >
              <option value="">All Languages</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="filter-select"
            >
              <option value="relevance">Relevance</option>
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* ✅ Duration filter */}
          <div className="filter-group">
            <label>Duration</label>
            <select
              value={filters.duration}
              onChange={(e) => handleFilterChange('duration', e.target.value)}
              className="filter-select"
            >
              <option value="">Any duration</option>
              <option value="short">Under 15 min</option>
              <option value="medium">15 – 30 min</option>
              <option value="long">30 – 60 min</option>
              <option value="verylong">Over 1 hour</option>
            </select>
          </div>
          
          <button className="clear-filters-btn" onClick={clearFilters}>
            <FiX />
            Clear Filters
          </button>
        </div>
      </motion.div>

      {/* Results – unchanged */}
      {isLoading ? (
        <div className="search-loading">
          <SkeletonLoader type="card" count={8} />
        </div>
      ) : totalResults === 0 ? (
        <motion.div
          className="no-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FiBookOpen size={48} />
          <h2>No results found</h2>
          <p>Try adjusting your search or filters</p>
          <div className="no-results-suggestions">
            <h4>Suggestions:</h4>
            <ul>
              <li>Check your spelling</li>
              <li>Try more general keywords</li>
              <li>Try different keywords</li>
              <li>Remove filters to broaden your search</li>
            </ul>
          </div>
        </motion.div>
      ) : (
        <>
          {(activeTab === 'all' || activeTab === 'series') && results.series?.length > 0 && (
            <motion.div className="result-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {activeTab === 'all' && (
                <h3 className="result-section-title"><FiBookOpen /> Series ({results.series.length})</h3>
              )}
              <div className="results-grid">
                {results.series.map((series) => (
                  <SeriesCard key={series.id} series={series} />
                ))}
              </div>
            </motion.div>
          )}

          {(activeTab === 'all' || activeTab === 'episodes') && results.episodes?.length > 0 && (
            <motion.div className="result-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {activeTab === 'all' && (
                <h3 className="result-section-title"><FiHeadphones /> Episodes ({results.episodes.length})</h3>
              )}
              <div className="episodes-list">
                {results.episodes.map((episode) => (
                  <motion.div
                    key={episode.id}
                    className="episode-result-item"
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(`/play/${episode.id}`)}
                  >
                    <div className="episode-result-thumb">
                      {episode.series_thumbnail ? (
                        <img src={episode.series_thumbnail} alt="" />
                      ) : (
                        <FiHeadphones size={20} />
                      )}
                    </div>
                    <div className="episode-result-info">
                      <h4>{episode.title}</h4>
                      <p>{episode.series_title} • Episode {episode.episode_number}</p>
                    </div>
                    <span className="episode-result-duration">
                      {Math.floor(episode.duration_seconds / 60)} min
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

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
  );
};

export default SearchResults;