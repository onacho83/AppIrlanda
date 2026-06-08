import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import {
  DashboardPage,
  InvoicesPage,
  CalendarPage,
  ReportsPage,
  SettingsPage,
} from '../pages/PlaceholderPages';
import { ClientsListPage } from '../pages/clients/ClientsListPage';
import { ClientDetailPage } from '../pages/clients/ClientDetailPage';
import { CatalogPage } from '../pages/catalog/CatalogPage';
import { OrdersListPage } from '../pages/orders/OrdersListPage';
import { OrderDetailPage } from '../pages/orders/OrderDetailPage';
import { NewOrderPage } from '../pages/orders/NewOrderPage';
import { EditOrderPage } from '../pages/orders/EditOrderPage';
import { PaymentsPage } from '../pages/payments/PaymentsPage';
import { QuotesListPage } from '../pages/quotes/QuotesListPage';
import { useAuthStore } from '../store/authStore';

/** Ruta protegida: redirige a /login si no autenticado */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/** Ruta solo admin */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/catalogo" replace />;
  return <>{children}</>;
};

/** Ruta de login: redirige si ya está autenticado */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/dashboard' : '/catalogo'} replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login público */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Rutas protegidas con layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
          <Route path="/pedidos" element={<OrdersListPage />} />
          <Route path="/pedidos/nuevo" element={<NewOrderPage />} />
          <Route path="/pedidos/:id" element={<OrderDetailPage />} />
          <Route path="/pedidos/:id/editar" element={<EditOrderPage />} />
          <Route path="/presupuestos" element={<QuotesListPage />} />
          <Route path="/clientes" element={<ClientsListPage />} />
          <Route path="/clientes/:id" element={<ClientDetailPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/pagos" element={<PaymentsPage />} />
          <Route path="/facturacion" element={<InvoicesPage />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/reportes" element={<AdminRoute><ReportsPage /></AdminRoute>} />
          <Route path="/configuracion" element={<AdminRoute><SettingsPage /></AdminRoute>} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
