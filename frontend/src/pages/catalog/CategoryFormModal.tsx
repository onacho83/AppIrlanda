import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { ProductCategory, CreateCategoryInput } from '../../types';
import { productService } from '../../services/productService';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: ProductCategory;
  onSuccess: () => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  category,
  onSuccess,
}) => {
  const isEditing = !!category;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(category?.name || '');
      setDescription(category?.description || '');
      setError(null);
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload: CreateCategoryInput = { name, description };
      if (isEditing && category) {
        await productService.updateCategory(category.id, payload);
      } else {
        await productService.createCategory(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
      size="sm"
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
      </form>
    </Modal>
  );
};
