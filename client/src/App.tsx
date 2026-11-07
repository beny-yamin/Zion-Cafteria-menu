import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';
import { CustomerMenuPage } from './pages/CustomerMenuPage.js';
import { PaymentVerifyPage } from './pages/PaymentVerifyPage.js';
import { KitchenDisplayPage } from './pages/KitchenDisplayPage.js';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage.js';
import { SharedAuthPortal } from './pages/SharedAuthPortal.js';
import { PortfolioDemoBanner } from './components/layout/PortfolioDemoBanner.js';

const RootRoute: React.FC = () => {
  const { user } = useAuth();

  // Authenticated users go directly to their respective operational dashboards
  if (user) {
    if (user.role === 'Owner') return <Navigate to="/owner" replace />;
    if (user.role === 'KitchenStaff') return <Navigate to="/kitchen" replace />;
    return <Navigate to="/login" replace />;
  }

  // Root URL (/) is strictly the main website landing and authentication page
  return <SharedAuthPortal />;
};

const MainAppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <PortfolioDemoBanner />
      <Routes>
        {/* Main landing & login portal */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<SharedAuthPortal />} />

        {/* QR code opens menu directly; supports opaque token in URL */}
        <Route path="/menu" element={<CustomerMenuPage />} />
        <Route path="/menu/:token" element={<CustomerMenuPage />} />
        <Route path="/payment/verify" element={<PaymentVerifyPage />} />

        {/* Protected Owner & Kitchen Dashboards */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={['Owner']}>
              <OwnerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={['Owner', 'KitchenStaff']}>
              <KitchenDisplayPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback to main landing */}
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
