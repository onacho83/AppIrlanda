import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import type { Quote } from '../../types';
import { quoteService } from '../../services/quoteService';
import './QuoteDetailPage.css';

export const QuoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  const fetchQuote = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const result = await quoteService.getQuoteById(id);
      setQuote(result);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const handleConvertToOrder = async () => {
    if (!id) return;
    try {
      setConverting(true);
      await quoteService.convertToOrder(id);
      await fetchQuote();
    } catch (error) {
      console.error('Failed to convert quote:', error);
      alert('Error al convertir el presupuesto a pedido.');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="quote-detail" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="quote-detail">
        <div className="quote-detail__header">
          <Button variant="ghost" onClick={() => navigate('/presupuestos')}>← Volver</Button>
          <h1 className="quote-detail__title">Presupuesto no encontrado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-detail">
      <div className="quote-detail__header">
        <Button variant="ghost" onClick={() => navigate('/presupuestos')} aria-label="Volver">←</Button>
        <div>
          <h1 className="quote-detail__title">Presupuesto {quote.quoteNumber}</h1>
          <span className="quote-detail__subtitle">
            Cliente: {quote.client?.name || 'Consumidor Final'} | Creado: {new Date(quote.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="quote-detail__actions" style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--spacing-4)' }}>
          {quote.status === 'PENDIENTE' && (
            <Button variant="primary" onClick={handleConvertToOrder} loading={converting}>
              Aprobar y Crear Pedido
            </Button>
          )}
        </div>
      </div>

      <div className="quote-detail__grid" style={{ display: 'grid', gap: 'var(--spacing-6)', gridTemplateColumns: '2fr 1fr' }}>
        <div className="quote-detail__main">
          <Card title="Items del Presupuesto">
            <div className="quote-items-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              {quote.items?.map((item) => (
                <div key={item.id} style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                    <strong>{item.product?.name || 'Producto'}</strong>
                    <span style={{ fontWeight: 600 }}>${Number(item.subtotal).toLocaleString()}</span>
                  </div>
                  {item.description && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>{item.description}</p>}
                  <div style={{ display: 'flex', gap: 'var(--spacing-4)', fontSize: '0.875rem' }}>
                    <span>Cant: {item.quantity}</span>
                    <span>Precio Unit: ${Number(item.unitPrice).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {quote.notes && (
            <Card title="Notas Adicionales" style={{ marginTop: 'var(--spacing-6)' }}>
              <p style={{ fontSize: '0.875rem' }}>{quote.notes}</p>
            </Card>
          )}
        </div>

        <div className="quote-detail__sidebar">
          <Card title="Resumen Monetario">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                <span>${Number(quote.subtotal).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>IVA (21%)</span>
                <span>${Number(quote.taxAmount).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-primary)' }}>${Number(quote.total).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card title="Estado del Presupuesto" style={{ marginTop: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
               <div>
                 <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block' }}>Estado</span>
                 <strong>{quote.status}</strong>
               </div>
               {quote.validUntil && (
                 <div>
                   <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block' }}>Válido hasta</span>
                   <span>{new Date(quote.validUntil).toLocaleDateString()}</span>
                 </div>
               )}
               {quote.convertedOrderId && (
                 <div style={{ padding: 'var(--spacing-2)', backgroundColor: 'var(--color-success-light)', borderRadius: 'var(--radius-sm)', color: 'var(--color-success-dark)', fontSize: '0.875rem' }}>
                   Presupuesto Aceptado y convertido al Pedido con éxito.
                 </div>
               )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
