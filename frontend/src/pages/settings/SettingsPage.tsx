import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { configService, type BusinessConfig } from '../../services/configService';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await configService.getConfig();
      setConfig(data);
    } catch (err) {
      console.error('Error fetching config:', err);
      setError('No se pudo cargar la configuración del sistema.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (!config) return;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setConfig({ ...config, [name]: target.checked });
    } else if (type === 'number') {
      setConfig({ ...config, [name]: value === '' ? null : Number(value) });
    } else {
      setConfig({ ...config, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await configService.updateConfig(config);
      setSuccess('Configuración guardada exitosamente.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving config:', err);
      setError('Ocurrió un error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '50vh', display: 'flex' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="settings-page">
        <h1 className="settings-page__title">Configuración del Sistema</h1>
        <p style={{ color: 'var(--color-danger)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1 className="settings-page__title">Configuración del Sistema</h1>
      </div>

      {error && <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-3)', background: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)' }}>{error}</div>}
      {success && <div style={{ color: 'var(--color-success-dark)', marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-3)', background: 'var(--color-success-light)', borderRadius: 'var(--radius-md)' }}>{success}</div>}

      <Card>
        <form className="settings-form" onSubmit={handleSubmit}>
          
          <h2 className="settings-section-title">Datos del Negocio</h2>
          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">Nombre del Negocio *</label>
              <input
                type="text"
                className="input__field"
                name="businessName"
                value={config.businessName || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Teléfono</label>
              <input
                type="text"
                className="input__field"
                name="phone"
                value={config.phone || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">Email</label>
              <input
                type="email"
                className="input__field"
                name="email"
                value={config.email || ''}
                onChange={handleChange}
              />
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Dirección</label>
              <input
                type="text"
                className="input__field"
                name="address"
                value={config.address || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">Ruta o URL del Logo</label>
              <input
                type="text"
                className="input__field"
                name="logoPath"
                value={config.logoPath || ''}
                onChange={handleChange}
                placeholder="Ej: /images/logo.png o https://..."
              />
            </div>
          </div>

          <div className="settings-form__group">
            <label className="settings-form__label">Leyenda Comercial (pie de factura)</label>
            <input
              type="text"
              className="input__field"
              name="commercialLegend"
              value={config.commercialLegend || ''}
              onChange={handleChange}
              placeholder="Ej: Impresión offset - digital - tipográfica - www.imprentairlanda.com"
            />
            <span className="settings-form__help">Texto que aparecerá al pie de las facturas PDF generadas.</span>
          </div>

          <h2 className="settings-section-title" style={{ marginTop: 'var(--spacing-4)' }}>Configuración Fiscal (AFIP)</h2>
          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">CUIT</label>
              <input
                type="text"
                className="input__field"
                name="cuit"
                value={config.cuit || ''}
                onChange={handleChange}
                placeholder="Sin guiones"
              />
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Condición frente al IVA</label>
              <select
                className="input__field"
                name="ivaCondition"
                value={config.ivaCondition || ''}
                onChange={handleChange}
              >
                <option value="">Seleccione una opción...</option>
                <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
                <option value="MONOTRIBUTISTA">Monotributista</option>
                <option value="EXENTO">Exento</option>
              </select>
            </div>
          </div>

          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">Ingresos Brutos</label>
              <input
                type="text"
                className="input__field"
                name="grossIncome"
                value={config.grossIncome || ''}
                onChange={handleChange}
                placeholder="Ej: C.M. 901-278963-3"
              />
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Fecha de Inicio de Actividades</label>
              <input
                type="text"
                className="input__field"
                name="activityStartDate"
                value={config.activityStartDate || ''}
                onChange={handleChange}
                placeholder="Ej: 03/01/2005"
              />
            </div>
          </div>

          <div className="settings-form__row">
            <div className="settings-form__group">
              <label className="settings-form__label">Punto de Venta AFIP</label>
              <input
                type="number"
                className="input__field"
                name="arcaSalePoint"
                value={config.arcaSalePoint || ''}
                onChange={handleChange}
              />
            </div>
            <div className="settings-form__group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--spacing-2)', marginTop: '28px' }}>
              <input
                type="checkbox"
                id="arcaProduction"
                name="arcaProduction"
                checked={config.arcaProduction}
                onChange={handleChange}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="arcaProduction" className="settings-form__label" style={{ cursor: 'pointer' }}>
                Entorno de Producción AFIP
              </label>
            </div>
          </div>

          <div className="settings-form__group">
            <label className="settings-form__label">Certificado (CRT) AFIP</label>
            <textarea
              className="input__field"
              name="arcaCert"
              value={config.arcaCert || ''}
              onChange={handleChange}
              rows={4}
              placeholder="Pegar aquí el contenido del archivo .crt"
            />
            <span className="settings-form__help">Requerido para generar facturas electrónicas.</span>
          </div>

          <div className="settings-form__group">
            <label className="settings-form__label">Llave Privada (KEY) AFIP</label>
            <textarea
              className="input__field"
              name="arcaKey"
              value={config.arcaKey || ''}
              onChange={handleChange}
              rows={4}
              placeholder="Pegar aquí el contenido del archivo .key"
            />
          </div>

          <div className="settings-form__actions">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
