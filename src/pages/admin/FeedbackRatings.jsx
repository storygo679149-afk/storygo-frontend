import React, { useEffect, useState } from 'react';
import { FiStar, FiTrash2 } from 'react-icons/fi';
import apiService from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';
import './Admin.css';

const FeedbackRatings = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // The server returns: { status:'success', data: { reviews: [...] } }
        const response = await apiService.get('/admin/ratings');
        // Axios wraps the response: response.data is the server JSON
        const serverData = response.data;
        // The reviews array is inside serverData.data.reviews
        const reviewsArray = serverData.data?.reviews || [];
        setReviews(reviewsArray);
      } catch (err) {
        console.error(err);
        setError('Failed to load ratings. Please try again.');
        toast.error('Failed to load ratings');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const deleteReview = async (id) => {
    try {
      await apiService.delete(`/admin/ratings/${id}`);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch {
      toast.error('Deletion failed');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <h1><FiStar /> Feedback & Ratings</h1>
        <div className="admin-loading">
          <SkeletonLoader type="card" count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <h1><FiStar /> Feedback & Ratings</h1>
        <div className="empty-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1><FiStar /> Feedback & Ratings</h1>
      {reviews.length === 0 ? (
        <div className="empty-state">
          <p>No reviews yet.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Series</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td>{r.username}</td>
                <td>{r.series_title}</td>
                <td>{'⭐'.repeat(r.rating)}</td>
                <td>{r.review_text || '—'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => deleteReview(r.id)}
                  >
                    <FiTrash2 color="#F87171" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FeedbackRatings;