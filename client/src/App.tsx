import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';
import { CustomerMenuPage } from './pages/CustomerMenuPage.js';
import { KitchenDisplayPage } from './pages/KitchenDisplayPage.js';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage.js';
import { StaffDashboardPage } from './pages/StaffDashboardPage.js';
import { SharedAuthPortal } from './pages/SharedAuthPortal.js';
import { PortfolioDemoBanner } from './components/layout/PortfolioDemoBanner.js';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <PortfolioDemoBanner />
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              user.role === 'Owner' ? (
                <Navigate to="/owner" replace />
              ) : user.role === 'KitchenStaff' ? (
                <Navigate to="/kitchen" replace />
              ) : (
                <Navigate to="/staff" replace />
              )
            ) : (
              <SharedAuthPortal />
            )
          }
        />
        <Route path="/login" element={<SharedAuthPortal />} />
        <Route path="/menu" element={<CustomerMenuPage />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};
