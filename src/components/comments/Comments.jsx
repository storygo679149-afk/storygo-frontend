import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import episodeService from '../../services/episodeService';
import CommentItem from './CommentItem';
import { FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Comments.css';

const Comments = ({ episodeId }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (episodeId) {
      fetchComments();
    }
  }, [episodeId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await episodeService.getComments(episodeId);
      setComments(res.data?.data?.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
      toast.error('Could not load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = newComment.trim();
    if (!body) return;

    setIsSubmitting(true);
    try {
      await episodeService.createComment(episodeId, {
        body,
        parent_id: replyTo?.id || null,
      });
      toast.success('Comment added');
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to post comment';
      toast.error(message);
      console.error('Comment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment) => {
    setReplyTo({ id: comment.id, username: comment.username });
    setNewComment(`@${comment.username} `);
  };

  const handleDelete = async (commentId) => {
    try {
      await episodeService.deleteComment(commentId);
      toast.success('Comment deleted');
      fetchComments();
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="comments-section">
      <h3>💬 Comments ({comments.length})</h3>

      {isAuthenticated && (
        <form className="comment-form" onSubmit={handleSubmit}>
          {replyTo && (
            <div className="replying-to">
              Replying to @{replyTo.username}
              <button
                type="button"
                className="cancel-reply"
                onClick={() => {
                  setReplyTo(null);
                  setNewComment('');
                }}
              >
                ✕
              </button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="comment-input"
          />
          <button
            type="submit"
            className="comment-submit-btn"
            disabled={!newComment.trim() || isSubmitting}
          >
            <FiSend /> Post
          </button>
        </form>
      )}

      {!isAuthenticated && (
        <p className="login-to-comment">
          Please <a href="/auth?mode=login">login</a> to comment.
        </p>
      )}

      {isLoading ? (
        <p className="comments-loading">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="no-comments">No comments yet. Be the first!</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={user}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;