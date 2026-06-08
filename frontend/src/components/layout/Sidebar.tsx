import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',      label: 'Dashboard',      icon: '📊', adminOnly: true },
  { path: '/pedidos',        label: 'Pedidos',         icon: '📋' },
  { path: '/presupuestos',   label: 'Presupuestos',   icon: '📝' },
  { path: '/clientes',       label: 'Clientes',       icon: '👥' },
  { path: '/catalogo',       label: 'Catálogo',       icon: '📦' },
  { path: '/pagos',          label: 'Pagos',           icon: '💰' },
  { path: '/facturacion',    label: 'Facturación',    icon: '🧾' },
  { path: '/calendario',     label: 'Calendario',     icon: '📅' },
  { path: '/reportes',       label: 'Reportes',       icon: '📈', adminOnly: true },
  { path: '/configuracion',  label: 'Configuración', icon: '⚙️', adminOnly: true },
];

interface SidebarProps {
  userRole: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, collapsed, onToggleCollapse }) => {
  const items = NAV_ITEMS.filter(item => !item.adminOnly || userRole === 'ADMIN');

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">🏢</span>
          {!collapsed && <span className="sidebar__logo-text">Imprenta Irlanda</span>}
        </div>
        <button
          className="sidebar__toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navegación */}
      <nav className="sidebar__nav" role="navigation" aria-label="Menú principal">
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar__link-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
