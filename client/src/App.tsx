import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';
import { CustomerMenuPage } from './pages/CustomerMenuPage.js';
import { PaymentVerifyPage } from './pages/PaymentVerifyPage.js';
import { KitchenDisplayPage } from './pages/KitchenDisplayPage.js';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage.js';
import { StaffDashboardPage } from './pages/StaffDashboardPage.js';
import { SharedAuthPortal } from './pages/SharedAuthPortal.js';
import { PortfolioDemoBanner } from './components/layout/PortfolioDemoBanner.js';

const RootRoute: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // If customer scans root QR or has table query parameter, immediately show the menu
  if (searchParams.get('table')) {
    return <CustomerMenuPage />;
  }

  // If already authenticated staff or owner, navigate to their dashboard
  if (user) {
    if (user.role === 'Owner') return <Navigate to="/owner" replace />;
    if (user.role === 'KitchenStaff') return <Navigate to="/kitchen" replace />;
    return <Navigate to="/staff" replace />;
  }

  // Default customer-first entry: always show the digital menu without login friction
  return <CustomerMenuPage />;
};

const MainAppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <PortfolioDemoBanner />
      <Routes>
        {/* Direct Landing: Customer Menu is primary, zero table-selection screen */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/menu" element={<CustomerMenuPage />} />
        <Route path="/login" element={<SharedAuthPortal />} />
        <Route path="/payment/verify" element={<PaymentVerifyPage />} />

        {/* Protected Staff & Owner Dashboards */}
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
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['Owner', 'KitchenStaff', 'Staff']}>
              <StaffDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/menu" replace />} />
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
