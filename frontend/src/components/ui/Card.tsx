import React from 'react';
import './Card.css';

export interface CardProps {
  /** Variante visual del card */
  variant?: 'flat' | 'elevated' | 'interactive';
  /** Clases CSS adicionales */
  className?: string;
  /** Título del card */
  title?: React.ReactNode;
  /** Contenido del card */
  children: React.ReactNode;
  /** Callback al hacer click (convierte el card en interactivo) */
  onClick?: () => void;
  /** Estilos en línea */
  style?: React.CSSProperties;
  /** Padding personalizado */
  padding?: string;
}

/** Card reutilizable con variantes flat, elevated e interactive */
export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  className = '',
  title,
  children,
  onClick,
  style,
  padding,
}) => {
  const classes = [
    'card',
    `card--${variant}`,
    onClick && 'card--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ ...style, padding }}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {title && <div className="card__header"><h3 className="card__title">{title}</h3></div>}
      {children}
    </div>
  );
};
