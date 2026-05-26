import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './Admin.css';

// Preload all admin pages (called once after mount)
const preloadAdminPages = () => {
  // These are the same lazy imports used in App.jsx – we just trigger the import
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

  useEffect(() => {
    // Start preloading all admin pages in the background
    preloadAdminPages();
  }, []);

  if (!isAuthenticated || !user?.is_admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;