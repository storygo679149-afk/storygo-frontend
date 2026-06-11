import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiBarChart2, FiFlag, FiDollarSign, FiBell, FiSettings, FiLogOut, FiMenu
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import './AdminLayout.css';

const AdminLayout = () => {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    { path: '/admin/users', icon: <FiUsers />, label: 'Users & Creators' },
    { path: '/admin/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
    { path: '/admin/moderation', icon: <FiFlag />, label: 'Moderation' },
    { path: '/admin/monetization', icon: <FiDollarSign />, label: 'Monetization' },
    { path: '/admin/notifications', icon: <FiBell />, label: 'Notifications' },
    { path: '/admin/contests', icon: <FiAward />, label: 'Contests' }
    { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
    { path: '/admin/audit-logs', icon: <FiBarChart2 />, label: 'Audit Logs' },
  ];
  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          <span>{collapsed ? 'A' : 'Admin Panel'}</span>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}><FiMenu /></button>
        </div>
        <nav>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <button className="admin-logout-btn" onClick={logout}>
          <FiLogOut /> {!collapsed && 'Logout'}
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;
