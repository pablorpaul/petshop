import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AppShell from '../layouts/AppShell';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import OwnersPage from '../pages/OwnersPage';
import PetsPage from '../pages/PetsPage';
import ServiceTypesPage from '../pages/ServiceTypesPage';
import ServicesPage from '../pages/ServicesPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/owners" element={<OwnersPage />} />
            <Route path="/pets" element={<PetsPage />} />
            <Route path="/service-types" element={<ServiceTypesPage />} />
            <Route path="/services" element={<ServicesPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
