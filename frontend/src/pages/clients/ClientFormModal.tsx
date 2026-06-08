import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { Client, IvaCondition, CreateClientInput, UpdateClientInput } from '../../types';
import { clientService } from '../../services/clientService';
import './ClientFormModal.css';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
  onSuccess: () => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  client,
  onSuccess,
}) => {
  const isEditing = !!client;

  const [name, setName] = useState('');
  const [fiscalName, setFiscalName] = useState('');
  const [cuit, setCuit] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ivaCondition, setIvaCondition] = useState<IvaCondition>('CONSUMIDOR_FINAL');
  const [hasCurrentAccount, setHasCurrentAccount] = useState(false);
  const [creditLimit, setCreditLimit] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setName(client.name);
        setFiscalName(client.fiscalName || '');
        setCuit(client.cuit || '');
        setEmail(client.email || '');
        setPhone(client.phone || '');
        setAddress(client.address || '');
        setIvaCondition(client.ivaCondition);
        setHasCurrentAccount(client.hasCurrentAccount);
        setCreditLimit(client.creditLimit || '');
        setNotes(client.notes || '');
      } else {
        setName('');
        setFiscalName('');
        setCuit('');
        setEmail('');
        setPhone('');
        setAddress('');
        setIvaCondition('CONSUMIDOR_FINAL');
        setHasCurrentAccount(false);
        setCreditLimit('');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre o razón social es obligatorio.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: CreateClientInput | UpdateClientInput = {
        name,
        fiscalName: fiscalName || undefined,
        cuit: cuit || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        ivaCondition,
        hasCurrentAccount,
        creditLimit: creditLimit ? Number(creditLimit) : undefined,
        notes: notes || undefined,
      };

      if (isEditing && client) {
        await clientService.update(client.id, payload as UpdateClientInput);
      } else {
        await clientService.create(payload as CreateClientInput);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al guardar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleSubmit} loading={loading}>
        {isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      size="md"
      footer={footer}
    >
      <form id="client-form" className="client-form" onSubmit={handleSubmit}>
        {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{error}</div>}
        
        <Input 
          label="Nombre o Razón Social *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Impresos del Sur S.A."
          disabled={loading}
          autoFocus
        />

        <div className="client-form__row">
          <Input 
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            disabled={loading}
          />
          <Input 
            label="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 11 1234-5678"
            disabled={loading}
          />
        </div>

        <div className="client-form__row">
          <Input 
            label="Nombre Fiscal (Opcional)"
            value={fiscalName}
            onChange={(e) => setFiscalName(e.target.value)}
            disabled={loading}
          />
          <Input 
            label="CUIT / DNI"
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="client-form__row">
          <div className="input-group">
            <label className="input__label">Condición frente al IVA</label>
            <select 
              className="input__field"
              value={ivaCondition}
              onChange={(e) => setIvaCondition(e.target.value as IvaCondition)}
              disabled={loading}
            >
              <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
              <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
              <option value="MONOTRIBUTISTA">Monotributista</option>
              <option value="EXENTO">Exento</option>
            </select>
          </div>
          <Input 
            label="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="client-form__row">
          <div className="client-form__checkbox">
            <input 
              type="checkbox" 
              id="hasCurrentAccount" 
              checked={hasCurrentAccount}
              onChange={(e) => setHasCurrentAccount(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="hasCurrentAccount">Habilitar Cuenta Corriente</label>
          </div>
          
          {hasCurrentAccount && (
            <Input 
              label="Límite de Crédito ($)"
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(Number(e.target.value))}
              disabled={loading}
              min={0}
            />
          )}
        </div>

        <Input 
          label="Notas internas"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
        />
      </form>
    </Modal>
  );
};
