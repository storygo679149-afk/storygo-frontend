import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiUsers, FiBook, FiHeadphones, FiDollarSign, FiCreditCard,
  FiBell, FiTarget, FiUserCheck, FiCalendar,
  FiStar, FiCloud, FiShield, FiHardDrive,
  FiGlobe, FiUserPlus, FiMapPin, FiDatabase   // ← ADDED FiDatabase here
} from 'react-icons/fi';
import './Admin.css';

const links = [
  { to: '/admin', icon: <FiHome />, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
  { to: '/admin/series', icon: <FiBook />, label: 'Series' },
  { to: '/admin/episodes', icon: <FiHeadphones />, label: 'Episodes' },
  { to: '/admin/payments', icon: <FiDollarSign />, label: 'Payments' },
  { to: '/admin/subscriptions', icon: <FiCreditCard />, label: 'Subscriptions' },
  { to: '/admin/notifications', icon: <FiBell />, label: 'Notifications' },
  { to: '/admin/creators', icon: <FiUserCheck />, label: 'Creators' },
  { to: '/admin/plans', icon: <FiCreditCard />, label: 'Plans' },
  { to: '/admin/schedule', icon: <FiCalendar />, label: 'Schedule' },
  { to: '/admin/feedback', icon: <FiStar />, label: 'Feedback' },
  { to: '/admin/listeners', icon: <FiMapPin />, label: 'Listeners' },
  { to: '/admin/integrations', icon: <FiCloud />, label: 'Integrations' },
  { to: '/admin/audit', icon: <FiShield />, label: 'Audit Log' },
  { to: '/admin/storage', icon: <FiHardDrive />, label: 'Storage' },
  { to: '/admin/onboarding', icon: <FiUserPlus />, label: 'Onboarding' },
  { to: '/admin/database', icon: <FiDatabase />, label: 'Database Users' },  // ← NEW ENTRY
];

const AdminSidebar = () => (
  <aside className="admin-sidebar">
    <div className="admin-logo">StoryGo Admin</div>
    <nav>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          {link.icon} <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default AdminSidebar;