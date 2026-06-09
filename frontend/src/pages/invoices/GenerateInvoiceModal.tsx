import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { invoiceService } from '../../services/invoiceService';
import type { Order } from '../../types';

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  unInvoicedOrders: Order[];
  onSuccess: () => void;
}

export const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({
  isOpen,
  onClose,
  clientId,
  unInvoicedOrders,
  onSuccess
}) => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oId => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === unInvoicedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(unInvoicedOrders.map(o => o.id));
    }
  };

  const totalAmount = unInvoicedOrders
    .filter(o => selectedOrders.includes(o.id))
    .reduce((sum, order) => sum + Number(order.total), 0);

  const handleSubmit = async () => {
    if (selectedOrders.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      await invoiceService.generateInvoice(clientId, selectedOrders);
      setSuccessMsg('Factura generada exitosamente en AFIP');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar factura');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar Factura AFIP" size="md">
      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: 'var(--spacing-2)' }}>{error}</div>}
        {successMsg && <div style={{ color: 'var(--color-success)', fontSize: '0.875rem', marginBottom: 'var(--spacing-2)' }}>{successMsg}</div>}
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
          Selecciona los pedidos que deseas agrupar en esta factura.
        </p>

        {unInvoicedOrders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 'var(--spacing-4)' }}>No hay pedidos disponibles para facturar.</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ padding: 'var(--spacing-2) var(--spacing-3)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', gap: 'var(--spacing-3)', backgroundColor: 'var(--color-surface-hover)' }}>
              <input 
                type="checkbox" 
                checked={selectedOrders.length === unInvoicedOrders.length && unInvoicedOrders.length > 0} 
                onChange={handleSelectAll}
              />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Seleccionar Todos</span>
            </div>
            {unInvoicedOrders.map(order => (
              <label 
                key={order.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-3)', 
                  padding: 'var(--spacing-3)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => handleToggle(order.id)}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{order.orderNumber} - {order.productDescription}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Fecha: {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontWeight: 600 }}>${Number(order.total).toLocaleString()}</div>
              </label>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-3)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontWeight: 500 }}>Total a Facturar:</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>${totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading || selectedOrders.length === 0}
        >
          {loading ? <Spinner size="sm" /> : 'Emitir Factura en AFIP'}
        </Button>
      </div>
    </Modal>
  );
};
