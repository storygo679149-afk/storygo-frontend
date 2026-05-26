import React, { useState } from 'react';
import { FiBell, FiPlus, FiSend, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const NotificationsAnnouncements = () => {
  const [bannerText, setBannerText] = useState('');
  const [bannerActive, setBannerActive] = useState(false);
  const [pushMsg, setPushMsg] = useState('');
  const [sentNotifications, setSentNotifications] = useState([]);

  const saveBanner = () => {
    // In a real app, POST to /api/admin/banner
    toast.success('Banner saved (locally)');
    localStorage.setItem('admin_banner', JSON.stringify({ text: bannerText, active: bannerActive }));
  };

  const sendPush = () => {
    if (!pushMsg.trim()) {
      toast.error('Please enter a message');
      return;
    }
    // Simulate sending push – just add to local list
    const newNotification = {
      id: Date.now(),
      message: pushMsg,
      timestamp: new Date().toISOString(),
    };
    setSentNotifications(prev => [newNotification, ...prev]);
    setPushMsg('');
    toast.success('Push notification simulated');
  };

  const deleteNotification = (id) => {
    setSentNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Removed');
  };

  return (
    <div className="admin-page">
      <h1><FiBell /> Notifications & Announcements</h1>

      <div style={{ display: 'grid', gap: '24px', maxWidth: '700px' }}>
        {/* Global Banner */}
        <div className="stat-card">
          <h3>Global Banner</h3>
          <div className="form-group">
            <label>Banner Text</label>
            <input
              className="form-input"
              placeholder="Welcome back! New stories just dropped..."
              value={bannerText}
              onChange={e => setBannerText(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={bannerActive}
              onChange={e => setBannerActive(e.target.checked)}
            />
            <label>Active</label>
          </div>
          <button className="btn btn-primary" onClick={saveBanner}>
            <FiSend /> Save Banner
          </button>
        </div>

        {/* Push Notification Simulator */}
        <div className="stat-card">
          <h3>Send Push Notification (Simulated)</h3>
          <div className="form-group">
            <label>Message</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={pushMsg}
              onChange={e => setPushMsg(e.target.value)}
              placeholder="New episode of 'Epic Tales' is out!"
            />
          </div>
          <button className="btn btn-primary" onClick={sendPush}>
            <FiSend /> Simulate Push
          </button>
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '8px' }}>
            ⚠ Push notifications cannot be sent to real users from the admin panel. This just records the attempt.
          </p>
        </div>

        {/* Sent Notifications Log */}
        <div className="stat-card">
          <h3>Sent Notifications</h3>
          {sentNotifications.length === 0 ? (
            <p style={{ color: '#888' }}>No notifications sent yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sentNotifications.map(n => (
                  <tr key={n.id}>
                    <td>{n.message}</td>
                    <td>{new Date(n.timestamp).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => deleteNotification(n.id)}>
                        <FiTrash2 color="#F87171" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsAnnouncements;