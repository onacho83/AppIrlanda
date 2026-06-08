import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '../ui/Avatar';
import './Header.css';

interface HeaderProps {
  userName: string;
  pageTitle: string;
  onLogout: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  pageTitle,
  onLogout,
  onToggleMobileSidebar,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header__left">
        {onToggleMobileSidebar && (
          <button
            className="header__menu-btn"
            onClick={onToggleMobileSidebar}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        )}
        <h1 className="header__title">{pageTitle}</h1>
      </div>

      <div className="header__right">
        {/* Dropdown de usuario */}
        <div className="header__user" ref={dropdownRef}>
          <button
            className="header__user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <Avatar name={userName} size="sm" />
            <span className="header__user-name">{userName}</span>
            <span className="header__chevron" aria-hidden="true">▾</span>
          </button>

          {dropdownOpen && (
            <div className="header__dropdown" role="menu">
              <button
                className="header__dropdown-item header__dropdown-item--danger"
                onClick={onLogout}
                role="menuitem"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
