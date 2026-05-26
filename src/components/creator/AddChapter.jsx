import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import novelService from '../../services/novelService';
import toast from 'react-hot-toast';
import './AddChapter.css';

const AddChapter = () => {
  const { novelId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    chapter_number: '',
    title: '',
    content: '',
    is_premium: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.chapter_number || !formData.title || !formData.content) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await novelService.addChapter(novelId, formData);
      toast.success('Chapter added!');
      navigate(`/creator/novels/${novelId}/chapters`);
    } catch (error) {
      toast.error('Failed to add chapter');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-chapter">
      <motion.div className="add-chapter-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Add Chapter</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Chapter Number *</label>
              <input type="number" name="chapter_number" value={formData.chapter_number} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Chapter Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea name="content" rows="12" value={formData.content} onChange={handleChange} placeholder="Write your chapter here..." required />
          </div>

          <div className="form-group checkbox">
            <label>
              <input type="checkbox" name="is_premium" checked={formData.is_premium} onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })} />
              Premium Chapter (requires subscription)
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Publish Chapter'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddChapter;