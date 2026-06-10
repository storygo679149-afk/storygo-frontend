import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSettings(res.data.data);
    } catch (err) { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const updateSetting = async (key, value) => {
    try {
      await api.put('/admin/settings', { key, value });
      toast.success(`${key} updated`);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (err) { toast.error('Update failed'); }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <motion.div className="admin-settings">
      <h1>Platform Settings</h1>
      <div className="settings-list">
        <div className="setting-item">
          <label>Maintenance Mode</label>
          <button className={settings.maintenance_mode === 'true' ? 'danger' : ''} onClick={() => updateSetting('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')}>
            {settings.maintenance_mode === 'true' ? 'Disable' : 'Enable'}
          </button>
        </div>
        <div className="setting-item">
          <label>Auto‑approve Creator Applications</label>
          <button onClick={() => updateSetting('creator_onboarding_auto_approve', settings.creator_onboarding_auto_approve === 'true' ? 'false' : 'true')}>
            {settings.creator_onboarding_auto_approve === 'true' ? 'Disable' : 'Enable'}
          </button>
        </div>
        <div className="setting-item">
          <label>Default Royalty Rate (%)</label>
          <input type="number" value={settings.default_royalty_rate || 70} onChange={e => updateSetting('default_royalty_rate', e.target.value)} />
        </div>
        <div className="setting-item">
          <label>Allow New Signups</label>
          <button onClick={() => updateSetting('enable_signups', settings.enable_signups === 'true' ? 'false' : 'true')}>
            {settings.enable_signups === 'true' ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default AdminSettings;
