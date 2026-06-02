import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import './Admin.css';

const AdminHeader = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button
          className="menu-toggle-btn"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <FiMenu size={24} />
        </button>
        <h2>👤 {user?.full_name || 'Admin'}</h2>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

export default AdminHeader;
