import React, { useState, useRef, useEffect, useId } from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Etiqueta del select */
  label?: string;
  /** Opciones disponibles */
  options: SelectOption[];
  /** Valor seleccionado actualmente */
  value: string;
  /** Callback al cambiar la selección */
  onChange: (value: string) => void;
  /** Texto placeholder */
  placeholder?: string;
  /** Mensaje de error */
  error?: string;
  /** Habilitar búsqueda en las opciones */
  searchable?: boolean;
  /** Deshabilitado */
  disabled?: boolean;
  /** Ancho completo */
  fullWidth?: boolean;
}

/** Select personalizado con dropdown, búsqueda opcional y accesibilidad */
export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  error,
  searchable = false,
  disabled = false,
  fullWidth = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();

  const selectedOption = options.find((o) => o.value === value);
  const filteredOptions =
    searchable && search
      ? options.filter((o) =>
          o.label.toLowerCase().includes(search.toLowerCase())
        )
      : options;

  /* Cerrar al hacer click fuera */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Focus en el campo de búsqueda al abrir */
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div
      className={`select-wrapper ${fullWidth ? 'select-wrapper--full' : ''}`}
      ref={wrapperRef}
    >
      {label && (
        <label className="select__label" id={`${generatedId}-label`}>
          {label}
        </label>
      )}
      <button
        type="button"
        className={[
          'select__trigger',
          error && 'select__trigger--error',
          isOpen && 'select__trigger--open',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${generatedId}-label` : undefined}
      >
        <span
          className={
            selectedOption ? 'select__value' : 'select__placeholder'
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span
          className={`select__chevron ${isOpen ? 'select__chevron--open' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="select__dropdown" role="listbox">
          {searchable && (
            <div className="select__search">
              <input
                ref={searchInputRef}
                type="text"
                className="select__search-input"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar opciones"
              />
            </div>
          )}
          <div className="select__options">
            {filteredOptions.length === 0 ? (
              <div className="select__no-results">Sin resultados</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`select__option ${
                    option.value === value ? 'select__option--selected' : ''
                  }`}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="select__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
