import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import novelService from '../../services/novelService';
import seriesService from '../../services/seriesService';
import { FiImage, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './UploadNovel.css';

const UploadNovel = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    language: 'en',
    author_name: '',
    tags: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await seriesService.getCategories();
      const cats = res?.data?.data?.categories || res?.data?.categories || [];
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);
    const payload = new FormData();
    payload.append('title', formData.title.trim());
    payload.append('description', formData.description);
    payload.append('category_id', formData.category_id);
    payload.append('language', formData.language);
    if (formData.author_name) payload.append('author_name', formData.author_name);
    if (formData.tags) payload.append('tags', formData.tags.split(',').map(t => t.trim()));
    if (coverImage) payload.append('cover_image', coverImage);

    try {
      await novelService.createNovel(payload);
      toast.success('Novel created! You can now add chapters.');
      navigate('/creator/dashboard?tab=novels');
    } catch (error) {
      toast.error('Failed to create novel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-novel">
      <motion.div className="upload-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Write New Novel</h1>
        <p>Start your written story journey</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter novel title" required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} placeholder="Describe your novel..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Language</label>
              <select name="language" value={formData.language} onChange={handleChange}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Author Name</label>
              <input type="text" name="author_name" value={formData.author_name} onChange={handleChange} placeholder="Your name as author" />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="romance, fantasy, adventure" />
            </div>
          </div>

          <div className="form-group">
            <label>Cover Image</label>
            <div className="cover-upload" onClick={() => document.getElementById('coverInput').click()}>
              {coverPreview ? (
                <div className="cover-preview">
                  <img src={coverPreview} alt="Cover preview" />
                  <button type="button" className="remove-cover" onClick={(e) => { e.stopPropagation(); setCoverImage(null); setCoverPreview(null); }}><FiX /></button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <FiImage size={32} />
                  <span>Click to upload cover image</span>
                </div>
              )}
              <input id="coverInput" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Novel'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default UploadNovel;