import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import novelService from '../services/novelService';
import NovelCard from '../components/novels/NovelCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FiBookOpen, FiSearch, FiFilter, FiTrendingUp, FiClock, FiStar } from 'react-icons/fi';
import './NovelsPage.css';

const NovelsPage = () => {
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNovels();
  }, [sortBy]);

  const fetchNovels = async () => {
    setIsLoading(true);
    try {
      const params = { sort: sortBy, limit: 30 };
      const response = await novelService.getAllNovels(params);
      let novelsList = response?.data?.data?.novels || response?.data?.novels || [];
      if (searchTerm) {
        novelsList = novelsList.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setNovels(novelsList);
    } catch (error) {
      console.error('Failed to fetch novels:', error);
      setNovels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: <FiClock /> },
    { value: 'popular', label: 'Most Read', icon: <FiTrendingUp /> },
    { value: 'rating', label: 'Highest Rated', icon: <FiStar /> }
  ];

  return (
    <div className="novels-page">
      <div className="novels-container">
        <motion.div className="novels-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1><FiBookOpen /> Written Stories</h1>
          <p>Discover captivating novels and written series from talented creators</p>
        </motion.div>

        <div className="novels-controls">
          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Search novels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchNovels()}
            />
          </div>
          <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter /> Filters
          </button>
        </div>

        {showFilters && (
          <motion.div className="filters-panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <div className="filter-group">
              <label>Sort By</label>
              <div className="sort-buttons">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`sort-btn ${sortBy === opt.value ? 'active' : ''}`}
                    onClick={() => setSortBy(opt.value)}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="novels-grid"><SkeletonLoader type="card" count={12} /></div>
        ) : novels.length === 0 ? (
          <div className="empty-state">
            <FiBookOpen size={48} />
            <h3>No novels found</h3>
            <p>Try adjusting your search or check back later for new stories</p>
          </div>
        ) : (
          <div className="novels-grid">
            {novels.map((novel, idx) => (
              <NovelCard key={novel.id} novel={novel} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NovelsPage;