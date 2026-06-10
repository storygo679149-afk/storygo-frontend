import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    if (!title || !body) return toast.error('Title and body required');
    setSending(true);
    try {
      await api.post('/admin/notifications/send', { title, body, audience });
      toast.success('Notification queued');
      setTitle(''); setBody('');
    } catch (err) { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  return (
    <motion.div className="admin-notifications">
      <h1>Send Notification</h1>
      <div className="notify-form">
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Message body" rows="5" value={body} onChange={e => setBody(e.target.value)} />
        <select value={audience} onChange={e => setAudience(e.target.value)}>
          <option value="all">All Users</option>
          <option value="creators">Only Creators</option>
          <option value="listeners">Only Listeners</option>
        </select>
        <button onClick={sendNotification} disabled={sending}>{sending ? 'Sending...' : 'Send Notification'}</button>
      </div>
    </motion.div>
  );
};
export default AdminNotifications;
