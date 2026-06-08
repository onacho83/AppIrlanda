import React from 'react';
import './StatusBadge.css';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  RECIBIDO:                 { label: 'Recibido',                className: 'badge--blue' },
  ESPERANDO_DISENO:         { label: 'Esperando Diseño',       className: 'badge--violet' },
  ESPERANDO_CONFIRMACION:   { label: 'Esperando Confirmación', className: 'badge--amber' },
  EN_PRODUCCION:            { label: 'En Producción',          className: 'badge--cyan' },
  TERMINADO:                { label: 'Terminado',              className: 'badge--green' },
  ENTREGADO:                { label: 'Entregado',              className: 'badge--slate' },
  CANCELADO:                { label: 'Cancelado',              className: 'badge--red' },
  // Presupuestos
  PENDIENTE:                { label: 'Pendiente',              className: 'badge--amber' },
  ACEPTADO:                 { label: 'Aceptado',               className: 'badge--green' },
  RECHAZADO:                { label: 'Rechazado',              className: 'badge--red' },
  VENCIDO:                  { label: 'Vencido',                className: 'badge--slate' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge--slate' };

  return (
    <span className={`badge ${config.className} ${className}`}>
      <span className="badge__dot" aria-hidden="true" />
      {config.label}
    </span>
  );
};
