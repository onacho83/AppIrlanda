import React, { useId } from 'react';
import './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  size = 'md',
  icon,
  fullWidth = true,
  className = '',
  id,
  ...rest
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const wrapperClasses = [
    'input-wrapper',
    fullWidth && 'input-wrapper--full',
    className,
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'input',
    `input--${size}`,
    error && 'input--error',
    icon && 'input--with-icon',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
        </label>
      )}
      <div className="input__container">
        {icon && <span className="input__icon" aria-hidden="true">{icon}</span>}
        <input
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <span id={`${inputId}-error`} className="input__error" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="input__helper">
          {helperText}
        </span>
      )}
    </div>
  );
};
