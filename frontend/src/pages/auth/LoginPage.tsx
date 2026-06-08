import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(username, password);
      setAuth(result.user, {
        token: result.token,
        refreshToken: result.refreshToken,
      });

      toast('success', `Bienvenido, ${result.user.name}`);

      // Redirigir según rol
      if (result.user.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/catalogo');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
      toast('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-card__header">
          <span className="login-card__logo">🏢</span>
          <h1 className="login-card__title">Imprenta Irlanda</h1>
          <p className="login-card__subtitle">Sistema de Gestión de Pedidos</p>
        </div>

        {/* Formulario */}
        <form className="login-card__form" onSubmit={handleSubmit}>
          <Input
            label="Usuario"
            placeholder="Ingresá tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Ingresá tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            error={error}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Iniciar sesión
          </Button>
        </form>
      </div>
    </div>
  );
};
