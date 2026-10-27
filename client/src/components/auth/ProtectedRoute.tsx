import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect unauthorized roles to their respective dashboards
    if (role === 'KitchenStaff') {
      return <Navigate to="/kitchen" replace />;
    }
    if (role === 'Staff') {
      return <Navigate to="/staff" replace />;
    }
    if (role === 'Customer') {
      return <Navigate to="/menu?table=1" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
