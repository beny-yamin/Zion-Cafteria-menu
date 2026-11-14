import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { AdminUser, UserRole } from '../../types/index.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user: authUser, role: authRole, loading } = useAuth();
  const location = useLocation();

  let storedUser: AdminUser | null = null;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (raw) storedUser = JSON.parse(raw);
  } catch {
    storedUser = null;
  }

  const currentUser = authUser || storedUser;
  const currentRole: UserRole | null = authRole || currentUser?.role || null;

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && currentRole && !allowedRoles.includes(currentRole)) {
    if (currentRole === 'Owner') {
      return <Navigate to="/owner" replace />;
    }
    if (currentRole === 'KitchenStaff') {
      return <Navigate to="/kitchen" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
