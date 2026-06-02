```jsx
import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './Admin.css';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    preloadAdminPages();
  }, []);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (!isAuthenticated || !user?.is_admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">

      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open Menu"
      >
        <FiMenu />
      </button>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <AdminSidebar
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
      />

      <div className="admin-main">
        <AdminHeader />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
```
