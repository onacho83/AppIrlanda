import React from 'react';
import { Button } from './Button';
import './EmptyState.css';

export interface EmptyStateProps {
  /** Emoji o ícono a mostrar */
  icon: string;
  /** Título del estado vacío */
  title: string;
  /** Descripción opcional */
  description?: string;
  /** Texto del botón de acción (CTA) */
  actionLabel?: string;
  /** Callback del botón de acción */
  onAction?: () => void;
}

/** Estado vacío con ícono, mensaje y CTA opcional */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="empty-state">
    <span className="empty-state__icon" aria-hidden="true">
      {icon}
    </span>
    <h3 className="empty-state__title">{title}</h3>
    {description && (
      <p className="empty-state__description">{description}</p>
    )}
    {actionLabel && onAction && (
      <Button
        variant="primary"
        onClick={onAction}
        className="empty-state__action"
      >
        {actionLabel}
      </Button>
    )}
  </div>
);
