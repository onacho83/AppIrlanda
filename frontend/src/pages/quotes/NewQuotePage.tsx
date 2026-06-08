import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { quoteService } from '../../services/quoteService';
import { clientService } from '../../services/clientService';
import { productService } from '../../services/productService';
import type { Client, Product, CreateQuoteInput, CreateQuoteItemInput } from '../../types';
import './QuotesListPage.css';

export const NewQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<CreateQuoteItemInput[]>([
    { productId: '', description: '', quantity: 1, unitPrice: 0 }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load options for selects
    clientService.getAll({ limit: 100 }).then(res => setClients(res.data));
    productService.getAll({ limit: 100 }).then(res => setProducts(res.data));
  }, []);

  const handleItemChange = (index: number, field: keyof CreateQuoteItemInput, value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
      const selectedProd = products.find(p => p.id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value,
        unitPrice: selectedProd ? selectedProd.basePrice : 0,
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: '', description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { setError('Selecciona un cliente'); return; }
    if (items.some(i => !i.productId || i.quantity <= 0)) { setError('Todos los items deben tener producto y cantidad válida'); return; }

    try {
      setLoading(true);
      setError(null);
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 15); // Valido por 15 dias

      const payload: CreateQuoteInput = {
        clientId,
        notes: notes || undefined,
        validUntil: validUntil.toISOString(),
        items: items.map(i => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          quantity: Number(i.quantity)
        }))
      };

      const result = await quoteService.createQuote(payload);
      navigate(`/presupuestos/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quotes-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="quotes-page__header">
        <Button variant="ghost" onClick={() => navigate('/presupuestos')}>← Volver</Button>
        <h1 className="quotes-page__title">Nuevo Presupuesto</h1>
        <div style={{ width: '80px' }}></div>
      </div>

      <Card title="Detalles del Presupuesto">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {error && <div style={{ color: 'var(--color-danger)' }}>{error}</div>}

          <div className="input-group">
            <label className="input__label">Cliente *</label>
            <select className="input__field" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.fiscalName ? `(${c.fiscalName})` : ''}</option>
              ))}
            </select>
          </div>

          <div style={{ padding: 'var(--spacing-4)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Items</h3>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: 'var(--spacing-2)', alignItems: 'end', marginBottom: 'var(--spacing-4)' }}>
                <div className="input-group">
                  <label className="input__label">Producto *</label>
                  <select className="input__field" value={item.productId} onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <Input label="Descripción (opcional)" value={item.description || ''} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} />
                <Input label="Cantidad *" type="number" min={1} value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
                <Input label="P. Unit ($) *" type="number" min={0} value={item.unitPrice} onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)} />
                
                <Button type="button" variant="danger" onClick={() => removeItem(idx)} disabled={items.length === 1} style={{ marginBottom: '4px' }}>
                  X
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addItem}>+ Agregar Item</Button>
          </div>

          <Input label="Notas Internas" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-4)' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/presupuestos')}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={loading}>Generar Presupuesto</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
