import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import seriesService from '../../services/seriesService';
import episodeService from '../../services/episodeService';
import SkeletonLoader from '../common/SkeletonLoader';
import Pagination from '../common/Pagination';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiPlay,
  FiBookOpen, FiAlertCircle, FiImage,
  FiHeadphones, FiUpload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './SeriesManager.css';

const SeriesManager = () => {
  const navigate = useNavigate();

  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSeries, setNewSeries] = useState({
    title: '',
    description: '',
    category_id: '',
    language: 'en',
    author_name: '',
    narrator_name: '',
    thumbnail: null,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch series on page/status change
  useEffect(() => {
    fetchSeries();
  }, [pagination.page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        searchSeries();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchSeries();
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await seriesService.getCategories();
      let categoriesList = response?.data?.data?.categories || response?.data?.categories || response?.categories || [];
      if (categoriesList.length) setCategories(categoriesList);
      else setCategories(getFallbackCategories());
    } catch (error) {
      setCategories(getFallbackCategories());
    }
  };

  const getFallbackCategories = () => [
    { id: '1', name: 'Fiction' },
    { id: '2', name: 'Non-Fiction' },
    { id: '3', name: 'Romance' },
    { id: '4', name: 'Horror' },
    { id: '5', name: 'Adventure' }
  ];

  const fetchSeries = async () => {
    setIsLoading(true);
    try {
      const filters = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      const response = await seriesService.getMySeries({ page: pagination.page, limit: 12, ...filters });
      console.log('Series API response:', response); // Debug
      const seriesList = response?.data?.data?.series || response?.data?.series || response?.series || [];
      setSeries(seriesList);
      const pag = response?.data?.data?.pagination || response?.data?.pagination || {};
      setPagination({
        page: pag.page || 1,
        totalPages: pag.pages || 1,
        total: pag.total || 0,
      });
    } catch (error) {
      console.error('Failed to load series:', error);
      toast.error(error.response?.data?.message || 'Failed to load series');
    } finally {
      setIsLoading(false);
    }
  };

  const searchSeries = async () => {
    setIsLoading(true);
    try {
      const response = await seriesService.searchMySeries(searchQuery);
      const seriesList = response?.data?.data?.series || response?.data?.series || response?.series || [];
      setSeries(seriesList);
      setPagination({ page: 1, totalPages: 1, total: seriesList.length });
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setNewSeries(prev => ({ ...prev, thumbnail: file }));
    }
  };

  const handleCreateSeries = async (e) => {
    e.preventDefault();
    if (!newSeries.title.trim()) {
      toast.error('Please enter a series title');
      return;
    }
    if (!newSeries.category_id) {
      toast.error('Please select a category');
      return;
    }
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', newSeries.title.trim());
      formData.append('description', newSeries.description.trim());
      formData.append('category_id', newSeries.category_id);
      formData.append('language', newSeries.language);
      if (newSeries.author_name.trim()) formData.append('author_name', newSeries.author_name.trim());
      if (newSeries.narrator_name.trim()) formData.append('narrator_name', newSeries.narrator_name.trim());
      if (newSeries.thumbnail) formData.append('thumbnail', newSeries.thumbnail);

      await seriesService.createSeries(formData);
      toast.success('Series created successfully!');
      setShowCreateForm(false);
      setNewSeries({
        title: '',
        description: '',
        category_id: '',
        language: 'en',
        author_name: '',
        narrator_name: '',
        thumbnail: null,
      });
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchSeries();
    } catch (error) {
      console.error('Create series error:', error);
      toast.error(error.response?.data?.message || 'Failed to create series');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (seriesId) => {
    setIsDeleting(true);
    try {
      await seriesService.deleteSeries(seriesId);
      toast.success('Series deleted');
      setDeleteConfirm(null);
      fetchSeries();
    } catch (error) {
      toast.error('Failed to delete series');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async (seriesId, currentStatus) => {
    const newStatus = currentStatus === 'ongoing' ? 'hiatus' : 'ongoing';
    try {
      await seriesService.updateSeries(seriesId, { status: newStatus });
      toast.success(`Series marked as ${newStatus}`);
      fetchSeries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Series' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'hiatus', label: 'On Hiatus' },
  ];

  return (
    <div className="series-manager">
      {/* Header */}
      <motion.div
        className="manager-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-left">
          <h1>My Series</h1>
          <p>{pagination.total} series total</p>
        </div>
        <motion.button
          className="new-series-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus /> New Series
        </motion.button>
      </motion.div>

      {/* Create Series Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            className="create-series-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="form-container">
              <h3>Create New Series</h3>
              <form onSubmit={handleCreateSeries}>
                <div className="form-group">
                  <label>Series Title *</label>
                  <input
                    type="text"
                    value={newSeries.title}
                    onChange={(e) => setNewSeries({ ...newSeries, title: e.target.value })}
                    placeholder="Enter series title"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newSeries.description}
                    onChange={(e) => setNewSeries({ ...newSeries, description: e.target.value })}
                    placeholder="Describe your series..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={newSeries.category_id}
                      onChange={(e) => setNewSeries({ ...newSeries, category_id: e.target.value })}
                      className="form-select"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={newSeries.language}
                      onChange={(e) => setNewSeries({ ...newSeries, language: e.target.value })}
                      className="form-select"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Author Name</label>
                    <input
                      type="text"
                      value={newSeries.author_name}
                      onChange={(e) => setNewSeries({ ...newSeries, author_name: e.target.value })}
                      placeholder="Author name"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Narrator</label>
                    <input
                      type="text"
                      value={newSeries.narrator_name}
                      onChange={(e) => setNewSeries({ ...newSeries, narrator_name: e.target.value })}
                      placeholder="Narrator name"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Cover Image</label>
                  <div
                    className="thumbnail-upload-area"
                    onClick={() => document.getElementById('series-thumbnail-input').click()}
                  >
                    <FiImage size={28} style={{ color: '#888' }} />
                    <span style={{ color: '#ccc', marginTop: 8 }}>
                      {newSeries.thumbnail ? newSeries.thumbnail.name : 'Click to upload a cover image'}
                    </span>
                  </div>
                  <input
                    id="series-thumbnail-input"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Series'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="manager-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search your series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="status-filters">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              className={`status-filter-btn ${statusFilter === opt.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Series Grid */}
      {isLoading ? (
        <div className="series-loading">
          <SkeletonLoader type="card" count={6} />
        </div>
      ) : series.length === 0 ? (
        <div className="empty-series">
          <FiBookOpen size={48} />
          <h2>No series found</h2>
          <p>Create your first series to start sharing your stories</p>
          <button className="create-btn" onClick={() => setShowCreateForm(true)}>
            Create Series
          </button>
        </div>
      ) : (
        <>
          <div className="series-grid">
            {series.map((item) => (
              <motion.div
                key={item.id}
                className="series-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/creator/series/${item.id}`)}
              >
                <div className="card-thumbnail">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} />
                  ) : (
                    <div className="card-thumb-placeholder">
                      <FiHeadphones size={32} />
                    </div>
                  )}
                  <span className={`card-status ${item.status}`}>{item.status || 'ongoing'}</span>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{item.title}</h3>
                  <div className="card-stats">
                    <span>{item.total_episodes || 0} episodes</span>
                    <span>{item.play_count || 0} plays</span>
                  </div>
                  {item.average_rating > 0 && (
                    <div className="card-rating">
                      {'⭐'.repeat(Math.floor(item.average_rating))}
                      <span>({item.rating_count || 0})</span>
                    </div>
                  )}
                </div>
                <div className="card-actions">
                  <button
                    className="card-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/creator/series/${item.id}/edit`);
                    }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="card-action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(item);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FiAlertCircle size={48} className="modal-icon" />
              <h2>Delete Series?</h2>
              <p>
                Are you sure you want to delete "{deleteConfirm.title}"?<br />
                This action cannot be undone and will delete all episodes in this series.
              </p>
              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button
                  className="modal-btn confirm"
                  onClick={() => handleDelete(deleteConfirm.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeriesManager;