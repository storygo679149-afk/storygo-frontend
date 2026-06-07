import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import SkeletonLoader from './SkeletonLoader';

const ProtectedRoute = ({ children, requireCreator = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <SkeletonLoader type="card" count={6} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireCreator && !user?.is_creator) {
    return <Navigate to="/become-creator" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
