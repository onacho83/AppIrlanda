import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import type { UpdateOrderInput, ProductCategory, Product, Client } from '../../types';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import './NewOrderPage.css';

export const EditOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [client, setClient] = useState<Client | null>(null);

  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [designFileReference, setDesignFileReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [order, categoriesRes, productsRes] = await Promise.all([
          orderService.getById(id),
          productService.getCategories(),
          productService.getAll({ limit: 1000 })
        ]);
        
        setCategories(categoriesRes);
        setProducts(productsRes.data);
        setClient(order.client || null);

        setProductId(order.productId);
        // Find category for the product
        const prod = productsRes.data.find(p => p.id === order.productId);
        if (prod) {
          setCategoryId(prod.categoryId);
        }

        setProductDescription(order.productDescription || '');
        setQuantity(order.quantity);
        setUnitPrice(order.unitPrice);
        setDesignFileReference(order.designFileReference || '');
        setNotes(order.notes || '');
      } catch (err) {
        setError('Error al cargar los datos del pedido');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filteredProducts = useMemo(() => {
    if (!categoryId) return [];
    return products.filter(p => p.categoryId === categoryId);
  }, [products, categoryId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesignFileReference(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !productId || !productDescription || !quantity || quantity <= 0 || unitPrice === '' || Number(unitPrice) < 0) {
      setError('Por favor completa todos los campos obligatorios correctamente.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: UpdateOrderInput = {
        productId,
        productDescription,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        designFileReference: designFileReference || undefined,
        notes: notes || undefined,
      };

      await orderService.update(id, payload);
      navigate(`/pedidos/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el pedido.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="new-order" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="new-order">
      <div className="new-order__header">
        <Button variant="ghost" onClick={() => navigate(`/pedidos/${id}`)} aria-label="Volver">←</Button>
        <h1 className="new-order__title">Editar Pedido {client ? `de ${client.name}` : ''}</h1>
      </div>

      <form className="new-order__form" onSubmit={handleSubmit}>
        {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{error}</div>}

        <Card title="Catálogo de Productos">
          <div className="new-order__row">
            <div className="input-group">
              <label className="input__label" htmlFor="categoryId">Categoría *</label>
              <select 
                id="categoryId"
                className="input__field"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setProductId('');
                }}
                disabled={submitting}
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
                disabled={submitting || !categoryId}
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
                placeholder="Ej: C:\Diseños\cliente\tarjeta.pdf o link a Drive"
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
        </Card>

        <div className="new-order__actions" style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end', marginTop: 'var(--spacing-6)' }}>
          <Button variant="secondary" onClick={() => navigate(`/pedidos/${id}`)} disabled={submitting}>Cancelar</Button>
          <Button variant="primary" type="submit" loading={submitting}>Guardar Cambios</Button>
        </div>
      </form>
    </div>
  );
};
