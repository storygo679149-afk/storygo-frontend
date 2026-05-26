import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import SkeletonLoader from './SkeletonLoader';

const ProtectedRoute = ({ children, requireCreator = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading skeleton while checking auth
  if (isLoading) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <SkeletonLoader type="card" count={6} />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=login" state={{ from: location }} replace />;
  }

  // Check creator requirement
  if (requireCreator && !user?.is_creator) {
    return <Navigate to="/become-creator" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
