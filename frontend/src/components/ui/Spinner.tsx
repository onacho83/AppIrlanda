import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color }) => {
  return (
    <div
      className={`spinner spinner--${size}`}
      role="status"
      aria-label="Cargando"
      style={color ? { borderTopColor: color } : undefined}
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
};
