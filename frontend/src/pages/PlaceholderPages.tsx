import React from 'react';

/** Página placeholder para secciones en construcción */
interface PlaceholderPageProps {
  title: string;
  icon: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  icon,
  description = 'Esta sección está en desarrollo.',
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 'var(--space-4)',
      color: 'var(--color-text-muted)',
    }}>
      <span style={{ fontSize: '64px' }}>{icon}</span>
      <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text)', fontWeight: 600 }}>{title}</h2>
      <p style={{ fontSize: 'var(--text-base)' }}>{description}</p>
    </div>
  );
};

/* Páginas individuales que se exportan */
export const DashboardPage: React.FC = () => <PlaceholderPage title="Dashboard" icon="📊" description="Métricas y resumen de negocio" />;
export const CatalogPage: React.FC = () => <PlaceholderPage title="Catálogo" icon="📦" description="Productos y categorías" />;
export const OrdersListPage: React.FC = () => <PlaceholderPage title="Pedidos" icon="📋" description="Lista de pedidos" />;
export const ClientsListPage: React.FC = () => <PlaceholderPage title="Clientes" icon="👥" description="Gestión de clientes" />;
export const QuotesListPage: React.FC = () => <PlaceholderPage title="Presupuestos" icon="📝" description="Cotizaciones" />;
export const PaymentsPage: React.FC = () => <PlaceholderPage title="Pagos" icon="💰" description="Registro de pagos" />;
export const InvoicesPage: React.FC = () => <PlaceholderPage title="Facturación" icon="🧾" description="Facturas electrónicas" />;
export const CalendarPage: React.FC = () => <PlaceholderPage title="Calendario" icon="📅" description="Entregas programadas" />;
export const ReportsPage: React.FC = () => <PlaceholderPage title="Reportes" icon="📈" description="Estadísticas y reportes" />;
export const SettingsPage: React.FC = () => <PlaceholderPage title="Configuración" icon="⚙️" description="Configuración del sistema" />;
