import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Spinner } from '../../components/ui/Spinner';
import type { Order, AccountMovement } from '../../types';
import { clientService, type ClientDetailResult } from '../../services/clientService';
import { accountService } from '../../services/accountService';
import { ClientFormModal } from './ClientFormModal';
import { PaymentFormModal } from '../payments/PaymentFormModal';
import { GenerateInvoiceModal } from '../invoices/GenerateInvoiceModal';
import './ClientDetailPage.css';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<ClientDetailResult | null>(null);
  const [statement, setStatement] = useState<{ balance: number, movements: AccountMovement[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const result = await clientService.getById(id);
      setData(result);
      if (result.client.hasCurrentAccount) {
        const stmt = await accountService.getClientStatement(id);
        setStatement(stmt);
      }
    } catch (error) {
      console.error('Failed to fetch client detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="client-detail" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="client-detail">
        <div className="client-detail__header">
          <Button variant="ghost" onClick={() => navigate('/clientes')}>← Volver</Button>
          <h1 className="client-detail__title">Cliente no encontrado</h1>
        </div>
      </div>
    );
  }

  const { client, orders, ordersSummary } = data;
  
  const unInvoicedOrders = orders.filter(o => !o.invoiceId && (o.status === 'TERMINADO' || o.status === 'ENTREGADO'));

  const orderColumns = [
    { header: 'Pedido', accessor: 'orderNumber' as keyof Order },
    { header: 'Producto', accessor: 'productDescription' as keyof Order },
    { 
      header: 'Total', 
      accessor: 'total' as keyof Order,
      render: (val: any) => `$${Number(val).toLocaleString()}`
    },
    { 
      header: 'Estado', 
      accessor: 'status' as keyof Order,
      render: (val: any) => <StatusBadge status={val} />
    },
    { 
      header: 'Fecha', 
      accessor: 'createdAt' as keyof Order,
      render: (val: any) => new Date(val).toLocaleDateString()
    },
  ];

  return (
    <div className="client-detail">
      <div className="client-detail__header">
        <Button variant="ghost" onClick={() => navigate('/clientes')} aria-label="Volver">←</Button>
        <div>
          <h1 className="client-detail__title">{client.name}</h1>
          {client.fiscalName && <span className="client-detail__subtitle">{client.fiscalName}</span>}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>Editar Cliente</Button>
        </div>
      </div>

      <div className="client-detail__grid">
        <div className="client-detail__section">
          <Card title="Información del Cliente">
            <div className="client-info-list">
              <div className="client-info-item">
                <span className="client-info-item__label">Email</span>
                <span className="client-info-item__value">{client.email || '-'}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-item__label">Teléfono</span>
                <span className="client-info-item__value">{client.phone || '-'}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-item__label">CUIT / DNI</span>
                <span className="client-info-item__value">{client.cuit || '-'}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-item__label">Condición IVA</span>
                <span className="client-info-item__value">{client.ivaCondition.replace('_', ' ')}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-item__label">Dirección</span>
                <span className="client-info-item__value">{client.address || '-'}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-item__label">Cuenta Corriente</span>
                <span className="client-info-item__value">
                  {client.hasCurrentAccount 
                    ? `Habilitada (Límite: $${client.creditLimit?.toLocaleString() || 0})` 
                    : 'No habilitada'}
                </span>
              </div>
                {client.notes && (
                  <div className="client-info-item">
                    <span className="client-info-item__label">Notas Internas</span>
                    <span className="client-info-item__value">{client.notes}</span>
                  </div>
                )}
              </div>
            </Card>

            {client.hasCurrentAccount && (
              <Card title="Estado de Cuenta" style={{ marginTop: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block' }}>Saldo Actual</span>
                    <span style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 700, 
                      color: statement?.balance && statement.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' 
                    }}>
                      ${(statement?.balance || 0).toLocaleString()}
                    </span>
                  </div>
                  <Button variant="primary" onClick={() => setIsPaymentModalOpen(true)}>
                    Registrar Pago
                  </Button>
                </div>
                
                {statement?.movements && statement.movements.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                    {statement.movements.slice(0, 5).map(mov => (
                      <div key={mov.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-2) 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            {mov.type === 'CARGO' ? 'Cargo (Pedido)' : 'Pago'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            {new Date(mov.createdAt).toLocaleDateString()} {mov.description ? `- ${mov.description}` : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: mov.type === 'CARGO' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                            {mov.type === 'CARGO' ? '+' : '-'}${Number(mov.amount).toLocaleString()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            Saldo: ${Number(mov.balanceAfter).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {statement.movements.length > 5 && (
                      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-2)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Mostrando últimos 5 movimientos</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>No hay movimientos registrados.</p>
                )}
              </Card>
            )}
          </div>

        <div className="client-detail__section">
          <div className="client-detail__stats">
            <div className="stat-card">
              <span className="stat-card__value">{ordersSummary.total}</span>
              <span className="stat-card__label">Pedidos Totales</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{ordersSummary.pending}</span>
              <span className="stat-card__label">En Proceso</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{ordersSummary.completed}</span>
              <span className="stat-card__label">Completados</span>
            </div>
          </div>

          <Card title="Historial de Pedidos">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-4)', gap: 'var(--spacing-3)' }}>
              {unInvoicedOrders.length > 0 && (
                <Button variant="secondary" onClick={() => setIsInvoiceModalOpen(true)}>
                  Generar Factura ({unInvoicedOrders.length})
                </Button>
              )}
              <Button variant="primary" onClick={() => navigate(`/pedidos/nuevo?clientId=${client.id}`)}>
                + Nuevo Pedido
              </Button>
            </div>
            <DataTable 
              columns={orderColumns} 
              data={orders}
              emptyMessage="Este cliente aún no tiene pedidos"
              onRowClick={(order) => navigate(`/pedidos/${order.id}`)}
            />
          </Card>
        </div>
      </div>

      <ClientFormModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
        onSuccess={fetchDetail}
      />

      <PaymentFormModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        clientId={client.id}
        onSuccess={fetchDetail}
      />

      <GenerateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        clientId={client.id}
        unInvoicedOrders={unInvoicedOrders}
        onSuccess={fetchDetail}
      />
    </div>
  );
};
