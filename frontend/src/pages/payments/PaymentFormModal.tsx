import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { PaymentMethod } from '../../types';
import { paymentService, type CreatePaymentInput } from '../../services/paymentService';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  orderId?: string;
  suggestedAmount?: number;
  onSuccess: () => void;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  clientId,
  orderId,
  suggestedAmount,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number | ''>(suggestedAmount || '');
  const [method, setMethod] = useState<PaymentMethod>('EFECTIVO');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update suggested amount when it changes
  React.useEffect(() => {
    if (isOpen && suggestedAmount) {
      setAmount(suggestedAmount);
    } else if (isOpen && !suggestedAmount) {
      setAmount('');
    }
  }, [isOpen, suggestedAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload: CreatePaymentInput = {
        clientId,
        orderId,
        amount: Number(amount),
        method,
        reference: reference || undefined,
        notes: notes || undefined,
      };
      
      await paymentService.createPayment(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={orderId ? `Registrar Pago (Pedido #${orderId.substring(0, 8)})` : 'Registrar Pago a Cuenta'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>Registrar Pago</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{error}</div>}
        
        <Input 
          label="Monto ($) *" 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')} 
          disabled={loading} 
          autoFocus 
          min={0}
        />
        
        <div className="input-group">
          <label className="input__label">Método de Pago *</label>
          <select 
            className="input__field"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            disabled={loading}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        {method === 'TRANSFERENCIA' && (
          <Input 
            label="Nº de Referencia / Comprobante" 
            value={reference} 
            onChange={(e) => setReference(e.target.value)} 
            disabled={loading} 
          />
        )}

        <Input 
          label="Notas Adicionales" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          disabled={loading} 
        />
      </form>
    </Modal>
  );
};
