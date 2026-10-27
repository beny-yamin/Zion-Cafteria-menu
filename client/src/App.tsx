import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerMenuPage } from './pages/CustomerMenuPage.js';
import { KitchenDisplayPage } from './pages/KitchenDisplayPage.js';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage.js';
import { StaffLoginPage } from './pages/StaffLoginPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/menu?table=1" replace />} />
        <Route path="/menu" element={<CustomerMenuPage />} />
        <Route path="/kitchen" element={<KitchenDisplayPage />} />
        <Route path="/owner" element={<OwnerDashboardPage />} />
        <Route path="/login" element={<StaffLoginPage />} />
        <Route path="*" element={<Navigate to="/menu?table=1" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
