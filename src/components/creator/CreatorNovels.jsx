import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import novelService from '../../services/novelService';
import SkeletonLoader from '../common/SkeletonLoader';
import { 
  FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiAlertCircle, 
  FiPlusCircle, FiEye, FiHeart, FiChevronRight 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './CreatorNovels.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const CreatorNovels = () => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    setIsLoading(true);
    try {
      const response = await novelService.getMyNovels({ limit: 50 });
      const novelsList = response?.data?.data?.novels || response?.data?.novels || [];
      setNovels(novelsList);
    } catch (error) {
      console.error('Failed to load novels:', error);
      toast.error('Failed to load novels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await novelService.deleteNovel(id);
      toast.success('Novel deleted successfully');
      setDeleteConfirm(null);
      fetchNovels();
    } catch (error) {
      toast.error('Failed to delete novel');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="creator-novels">
        <div className="creator-novels-header">
          <h2>My Novels</h2>
          <div className="skeleton-btn"></div>
        </div>
        <div className="novels-grid">
          <SkeletonLoader type="card" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="creator-novels">
      <motion.div 
        className="creator-novels-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2>My Novels</h2>
        <motion.button 
          className="create-novel-btn"
          onClick={() => navigate('/creator/novels/new')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus /> Write New Novel
        </motion.button>
      </motion.div>

      {novels.length === 0 ? (
        <motion.div 
          className="empty-novels"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FiBookOpen size={56} />
          <h3>No novels yet</h3>
          <p>Start writing your first novel and share your story with the world</p>
          <button onClick={() => navigate('/creator/novels/new')}>Create Your First Novel</button>
        </motion.div>
      ) : (
        <motion.div 
          className="novels-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {novels.map((novel, idx) => (
            <motion.div 
              key={novel.id} 
              className="novel-card-creator"
              variants={itemVariants}
              whileHover={{ y: -6 }}
            >
              <div className="novel-card-cover-creator">
                {novel.cover_image_url ? (
                  <img src={novel.cover_image_url} alt={novel.title} />
                ) : (
                  <div className="cover-placeholder-creator">
                    <FiBookOpen size={32} />
                  </div>
                )}
                <div className="cover-badge">
                  {novel.status === 'completed' ? 'Completed' : 'Ongoing'}
                </div>
              </div>
              <div className="novel-card-info-creator">
                <h3 className="novel-title-creator">{novel.title}</h3>
                <p className="novel-stats-creator">
                  <span><FiEye /> {novel.read_count || 0}</span>
                  <span><FiHeart /> {novel.like_count || 0}</span>
                  <span><FiBookOpen /> {novel.total_chapters || 0} ch</span>
                </p>
                <div className="novel-actions-creator">
                  <button 
                    className="action-btn manage"
                    onClick={() => navigate(`/creator/novels/${novel.id}/chapters`)}
                    title="Manage Chapters"
                  >
                    <FiEdit2 /> Manage
                  </button>
                  <button 
                    className="action-btn add-chapter"
                    onClick={() => navigate(`/creator/novels/${novel.id}/chapters/new`)}
                    title="Add Chapter"
                  >
                    <FiPlusCircle /> Add Chapter
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => setDeleteConfirm(novel)}
                    title="Delete Novel"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            className="delete-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <FiAlertCircle size={48} className="modal-icon" />
              <h3>Delete "{deleteConfirm.title}"?</h3>
              <p>This action cannot be undone. All chapters and progress will be permanently deleted.</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="confirm-btn" onClick={() => handleDelete(deleteConfirm.id)} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreatorNovels;