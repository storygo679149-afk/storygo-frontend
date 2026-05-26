import React, { useState } from 'react';
import { FiCloud, FiToggleLeft, FiToggleRight, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ApiIntegrations = () => {
  const [integrations, setIntegrations] = useState([
    { name: 'Stripe', enabled: true },
    { name: 'Google TTS', enabled: false },
  ]);

  const toggle = (name) => {
    setIntegrations(prev => prev.map(i => i.name === name ? { ...i, enabled: !i.enabled } : i));
    toast.success('Toggled');
  };

  return (
    <div className="admin-page">
      <h1><FiCloud /> API & Integrations</h1>
      <table className="admin-table">
        <thead>
          <tr><th>Service</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {integrations.map(i => (
            <tr key={i.name}>
              <td>{i.name}</td>
              <td><span className={`badge ${i.enabled ? 'badge-success' : 'badge-danger'}`}>{i.enabled ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button className="toggle-btn" onClick={() => toggle(i.name)}>
                  {i.enabled ? <FiToggleRight color="#34D399" /> : <FiToggleLeft color="#F87171" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApiIntegrations;