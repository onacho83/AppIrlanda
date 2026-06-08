import React from 'react';
import './Avatar.css';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Genera un color consistente a partir de un string */
const stringToColor = (str: string): string => {
  const colors = [
    '#2563EB', '#7C3AED', '#DB2777', '#DC2626',
    '#EA580C', '#D97706', '#16A34A', '#0891B2',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/** Obtiene las iniciales de un nombre (máximo 2) */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');
};

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  return (
    <div
      className={`avatar avatar--${size} ${className}`}
      style={{ backgroundColor: stringToColor(name) }}
      title={name}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
};
