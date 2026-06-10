import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiBellOff, FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './NotificationBell.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Unread count error');
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    for (const id of unreadIds) {
      await api.post(`/notifications/${id}/read`);
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = async () => {
    if (!isOpen) {
      await fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button className="bell-btn" onClick={toggleDropdown}>
        {unreadCount > 0 ? (
          <div className="bell-with-badge">
            <FiBell size={22} />
            <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </div>
        ) : (
          <FiBellOff size={22} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="dropdown-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button className="mark-all" onClick={markAllAsRead}>Mark all read</button>
              )}
            </div>
            <div className="dropdown-list">
              {loading ? (
                <div className="loading-spinner">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">No notifications</div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`notif-item ${!notif.is_read ? 'unread' : ''}`}>
                    <div className="notif-content">
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-body">{notif.body}</div>
                      <div className="notif-time">{new Date(notif.sent_at).toLocaleString()}</div>
                    </div>
                    {!notif.is_read && (
                      <button className="mark-read-btn" onClick={() => markAsRead(notif.id)}>
                        <FiCheck size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
