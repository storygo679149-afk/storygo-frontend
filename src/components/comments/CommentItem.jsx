import React from 'react';
import { FiTrash2, FiCornerDownRight } from 'react-icons/fi';

const CommentItem = ({ comment, currentUser, onReply, onDelete }) => {
  const isOwner = currentUser && currentUser.id === comment.user_id;
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginLeft: comment.parent_id ? 40 : 0 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          {comment.username?.charAt(0).toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, color: '#ccc' }}>@{comment.username}</span>
          <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>{new Date(comment.created_at).toLocaleString()}</span>
          <p style={{ margin: '4px 0', color: '#ddd' }}>{comment.body}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => onReply(comment)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiCornerDownRight /> Reply
            </button>
            {isOwner && (
              <button onClick={() => onDelete(comment.id)} style={{ background: 'none', border: 'none', color: '#ff5c72', cursor: 'pointer' }}>
                <FiTrash2 /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} currentUser={currentUser} onReply={onReply} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default CommentItem;