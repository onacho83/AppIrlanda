import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../store/authStore';
import './MainLayout.css';

/** Mapa de rutas a títulos de página */
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':      'Dashboard',
  '/pedidos':        'Pedidos',
  '/presupuestos':   'Presupuestos',
  '/clientes':       'Clientes',
  '/catalogo':       'Catálogo',
  '/pagos':          'Pagos',
  '/facturacion':    'Facturación',
  '/calendario':     'Calendario',
  '/reportes':       'Reportes',
  '/configuracion':  'Configuración',
};

export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Imprenta Irlanda';

  return (
    <div className="layout">
      <Sidebar
        userRole={user?.role || 'OPERADOR'}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Overlay mobile */}
      {mobileSidebarOpen && (
        <div
          className="layout__overlay"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`layout__main ${sidebarCollapsed ? 'layout__main--collapsed' : ''}`}
      >
        <Header
          userName={user?.name || 'Usuario'}
          pageTitle={pageTitle}
          onLogout={logout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="layout__content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
