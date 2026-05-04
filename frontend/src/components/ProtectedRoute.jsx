import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  if (!user) {
    // Not logged in
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in but doesn't have the required role
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'seller') return <Navigate to="/seller" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
