import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { Product, PricingType, CreateProductInput } from '../../types';
import { productService } from '../../services/productService';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  categoryId: string;
  onSuccess: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  categoryId,
  onSuccess,
}) => {
  const isEditing = !!product;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricingType, setPricingType] = useState<PricingType>('FIJO');
  const [basePrice, setBasePrice] = useState<number | ''>('');
  const [active, setActive] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(product?.name || '');
      setDescription(product?.description || '');
      setPricingType(product?.pricingType || 'FIJO');
      setBasePrice(product?.basePrice ?? '');
      setActive(product?.active ?? true);
      setError(null);
    }
  }, [isOpen, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del producto es obligatorio');
      return;
    }
    if (basePrice === '' || Number(basePrice) < 0) {
      setError('El precio base debe ser mayor o igual a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload: CreateProductInput = { 
        name, 
        categoryId, 
        description, 
        pricingType, 
        basePrice: Number(basePrice),
        active
      };
      
      if (isEditing && product) {
        await productService.update(product.id, payload);
      } else {
        await productService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>Guardar</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{error}</div>}
        
        <Input label="Nombre *" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} autoFocus />
        <Input label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
          <div className="input-group">
            <label className="input__label">Tipo de Precio</label>
            <select 
              className="input__field"
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value as PricingType)}
              disabled={loading}
            >
              <option value="FIJO">Fijo</option>
              <option value="CALCULADO">Calculado</option>
            </select>
          </div>
          <Input 
            label="Precio Base ($)" 
            type="number" 
            value={basePrice} 
            onChange={(e) => setBasePrice(e.target.value ? Number(e.target.value) : '')} 
            disabled={loading} 
            min={0}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
          <input 
            type="checkbox" 
            id="productActive" 
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={loading}
            style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
          />
          <label htmlFor="productActive" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
            Producto Activo
          </label>
        </div>
      </form>
    </Modal>
  );
};
