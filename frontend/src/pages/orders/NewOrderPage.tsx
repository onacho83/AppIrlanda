import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import type { Client, Product, ProductCategory, CreateOrderInput } from '../../types';
import { clientService } from '../../services/clientService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import './NewOrderPage.css';

export const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [clientId, setClientId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [chargedToAccount, setChargedToAccount] = useState(false);
  const [designFileReference, setDesignFileReference] = useState('');
  const [notes, setNotes] = useState('');

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [clientsRes, categoriesRes, productsRes] = await Promise.all([
          clientService.getAll({ limit: 1000 }), // En un entorno real se usaría autocomplete
          productService.getCategories(),
          productService.getAll({ limit: 1000 })
        ]);
        setClients(clientsRes.data);
        setCategories(categoriesRes);
        setProducts(productsRes.data);
        
        // Auto-select client if passed in URL
        const params = new URLSearchParams(window.location.search);
        const urlClientId = params.get('clientId');
        if (urlClientId && clientsRes.data.some(c => c.id === urlClientId)) {
          setClientId(urlClientId);
        }
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);
  const selectedProduct = useMemo(() => products.find(p => p.id === productId), [products, productId]);
  const filteredProducts = useMemo(() => {
    if (!categoryId) return [];
    return products.filter(p => p.categoryId === categoryId);
  }, [products, categoryId]);

  useEffect(() => {
    if (selectedProduct) {
      if (!productDescription) setProductDescription(selectedProduct.name);
      if (unitPrice === '') setUnitPrice(selectedProduct.basePrice);
    }
  }, [selectedProduct]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Capturamos el nombre del archivo. Los navegadores no proveen la ruta real por seguridad.
      setDesignFileReference(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent, createAnother: boolean = false) => {
    e.preventDefault();
    if (!clientId || !productId || !productDescription || !quantity || quantity <= 0 || unitPrice === '' || Number(unitPrice) < 0) {
      setError('Por favor completa todos los campos obligatorios correctamente.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: CreateOrderInput = {
        clientId,
        productId,
        productDescription,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        chargedToAccount,
        designFileReference: designFileReference || undefined,
        notes: notes || undefined,
      };

      const result = await orderService.create(payload);
      
      if (createAnother) {
        // Reset form for next order, but keep the client
        setCategoryId('');
        setProductId('');
        setProductDescription('');
        setQuantity(1);
        setUnitPrice('');
        setDesignFileReference('');
        setNotes('');
        setSubmitting(false);
        // Show a quick success message (in a real app, use a toast)
        alert('Pedido creado exitosamente. Puedes crear el siguiente.');
      } else {
        navigate(`/pedidos/${result.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el pedido.');
      setSubmitting(false);
    }
  };

  const subtotal = Number(quantity || 0) * Number(unitPrice || 0);
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  return (
    <div className="new-order">
      <div className="new-order__header">
        <Button variant="ghost" onClick={() => navigate(-1)} aria-label="Volver">←</Button>
        <h1 className="new-order__title">Nuevo Pedido</h1>
      </div>

      <form className="new-order__form" onSubmit={handleSubmit}>
        {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{error}</div>}

        <Card title="Datos Principales">
          <div className="new-order__row">
            <div className="input-group">
              <label className="input__label" htmlFor="clientId">Cliente *</label>
              <select 
                id="clientId"
                className="input__field"
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setChargedToAccount(false);
                }}
                disabled={loadingData || submitting}
              >
                <option value="">-- Seleccionar Cliente --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.cuit ? `(${c.cuit})` : ''}</option>
                ))}
              </select>
            </div>
            
            <div className="input-group">
              <label className="input__label" htmlFor="categoryId">Categoría *</label>
              <select 
                id="categoryId"
                className="input__field"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setProductId(''); // Reset product when category changes
                }}
                disabled={loadingData || submitting}
              >
                <option value="">-- Seleccionar Categoría --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input__label" htmlFor="productId">Producto Base *</label>
              <select 
                id="productId"
                className="input__field"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={loadingData || submitting || !categoryId}
              >
                <option value="">-- Seleccionar Producto --</option>
                {filteredProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (${p.basePrice})</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card title="Detalles del Trabajo">
          <Input 
            label="Descripción del Trabajo *"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            disabled={submitting}
            placeholder="Ej: Tarjetas personales doble faz mate"
          />

          <div className="new-order__row" style={{ marginTop: 'var(--spacing-4)', justifyContent: 'flex-start' }}>
            <div style={{ width: '120px' }}>
              <Input 
                label="Cantidad *"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                disabled={submitting}
                min={1}
              />
            </div>
            <div style={{ width: '200px' }}>
              <Input 
                label="Precio Unitario ($) *"
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
                disabled={submitting}
                min={0}
              />
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <label className="input__label">Ruta/Link del Archivo de Diseño (Opcional)</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Input 
                value={designFileReference}
                onChange={(e) => setDesignFileReference(e.target.value)}
                disabled={submitting}
                placeholder="Ej: C:\Diseños\cliente\tarjeta.pdf o buscar archivo..."
              />
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <Button type="button" variant="secondary" style={{ whiteSpace: 'nowrap' }}>Examinar...</Button>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  disabled={submitting}
                  style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <Input 
              label="Notas adicionales (Opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
          </div>

          {selectedClient?.hasCurrentAccount && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)', background: 'var(--color-surface-hover)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
              <input 
                type="checkbox" 
                id="chargedToAccount" 
                checked={chargedToAccount}
                onChange={(e) => setChargedToAccount(e.target.checked)}
                disabled={submitting}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
              />
              <label htmlFor="chargedToAccount" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                Cargar a Cuenta Corriente (Límite disponible: ${selectedClient.creditLimit?.toLocaleString() || 0})
              </label>
            </div>
          )}
        </Card>

        <div className="new-order__summary">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>Resumen</h3>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>IVA (21% referencial):</span>
            <span>${tax.toLocaleString()}</span>
          </div>
          <div className="summary-row summary-row--total">
            <span>Total a Pagar:</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>

        <div className="new-order__actions" style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end', marginTop: 'var(--spacing-6)' }}>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>Cancelar</Button>
          <Button variant="secondary" onClick={(e) => handleSubmit(e, true)} disabled={submitting} type="button">Crear y agregar otro</Button>
          <Button variant="primary" type="submit" loading={submitting}>Crear Pedido</Button>
        </div>
      </form>
    </div>
  );
};
