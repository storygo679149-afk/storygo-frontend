import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './Admin.css';

// Preload all admin pages (called once after mount)
const preloadAdminPages = () => {
  import('../../pages/admin/AdminDashboard');
  import('../../pages/admin/Users');
  import('../../pages/admin/SeriesManager');
  import('../../pages/admin/Episodes');
  import('../../pages/admin/Payments');
  import('../../pages/admin/Subscriptions');
  import('../../pages/admin/NotificationsAnnouncements');
  import('../../pages/admin/CreatorManagement');
  import('../../pages/admin/SubscriptionPlans');
  import('../../pages/admin/ContentScheduling');
  import('../../pages/admin/FeedbackRatings');
  import('../../pages/admin/ApiIntegrations');
  import('../../pages/admin/AuditLogs');
  import('../../pages/admin/StorageMedia');
  import('../../pages/admin/OnboardingFlow');
  import('../../pages/admin/ListenerGeography');
};

const AdminLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    preloadAdminPages();
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated || !user?.is_admin) {
    return <Navigate to="/admin/login" replace />;
  }

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* Overlay visible only on mobile when sidebar is open */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="admin-main">
        <AdminHeader onMenuToggle={toggleSidebar} />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
