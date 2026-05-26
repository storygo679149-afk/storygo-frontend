import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Admin.css';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="admin-header">
      <h2>👤 {user?.full_name || 'Admin'}</h2>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </header>
  );
};
export default AdminHeader;