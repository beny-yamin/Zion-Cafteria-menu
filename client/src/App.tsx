import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';
import { CustomerMenuPage } from './pages/CustomerMenuPage.js';
import { KitchenDisplayPage } from './pages/KitchenDisplayPage.js';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage.js';
import { StaffDashboardPage } from './pages/StaffDashboardPage.js';
import { StaffLoginPage } from './pages/StaffLoginPage.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/menu?table=1" replace />} />
          <Route path="/menu" element={<CustomerMenuPage />} />
          <Route path="/login" element={<StaffLoginPage />} />

          {/* Protected Route for Owner */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Route for Kitchen Staff & Owner */}
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute allowedRoles={['Owner', 'KitchenStaff']}>
                <KitchenDisplayPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Route for Floor Staff, Kitchen & Owner */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['Owner', 'KitchenStaff', 'Staff']}>
                <StaffDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/menu?table=1" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
