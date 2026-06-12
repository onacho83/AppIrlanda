import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Spinner } from '../../components/ui/Spinner';
import type { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orderService';
import { PaymentFormModal } from '../payments/PaymentFormModal';
import { invoiceService } from '../../services/invoiceService';
import { DownloadInvoicePdfButton } from '../invoices/DownloadInvoicePdfButton';
import { GenerateInvoiceModal } from '../invoices/GenerateInvoiceModal';
import type { Invoice, Payment } from '../../types';
import { paymentService } from '../../services/paymentService';
import { configService } from '../../services/configService';
import { generateOrderPdf } from './orderPdfGenerator';
import './OrderDetailPage.css';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | undefined>(undefined);
  const [isPrinting, setIsPrinting] = useState(false);


  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const result = await orderService.getById(id);
      setOrder(result);
      if (result.invoiceId) {
        try {
          const inv = await invoiceService.getInvoiceById(result.invoiceId);
          setInvoice(inv);
        } catch (invError) {
          console.error('Failed to fetch invoice:', invError);
        }
      } else {
        setInvoice(null);
      }

      try {
        const payRes = await paymentService.getPayments({ orderId: id });
        setPayments(payRes.data);
      } catch (e) {
        console.error('Failed to fetch payments:', e);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!id) return;
    try {
      await orderService.updateStatus(id, { status });
      fetchOrder();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handlePrintPdf = async () => {
    if (!order) return;
    try {
      setIsPrinting(true);
      const config = await configService.getConfig();
      await generateOrderPdf(order, order.client || null, config);
    } catch (err) {
      console.error('Error generando PDF del pedido', err);
    } finally {
      setIsPrinting(false);
    }
  };

  if (loading) {
    return (
      <div className="order-detail" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail">
        <div className="order-detail__header">
          <Button variant="ghost" onClick={() => navigate('/pedidos')}>← Volver</Button>
          <h1>Pedido no encontrado</h1>
        </div>
      </div>
    );
  }

  const isCanceledByCreditNote = invoice?.invoiceType.includes('NOTA_CREDITO') ?? false;

  return (
    <div className="order-detail">
      <div className="order-detail__header">
        <div className="order-detail__title-container">
          <Button variant="ghost" onClick={() => navigate('/pedidos')} aria-label="Volver">←</Button>
          <h1 className="order-detail__title">Pedido #{order.orderNumber}</h1>
          <StatusBadge status={order.status} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <Button variant="secondary" onClick={handlePrintPdf} disabled={isPrinting}>
            {isPrinting ? <Spinner size="sm" /> : '🖨️ Descargar PDF'}
          </Button>
          {!isCanceledByCreditNote && (
            <Button variant="secondary" onClick={() => navigate(`/pedidos/${id}/editar`)}>Editar Pedido</Button>
          )}
        </div>
      </div>

      <div className="order-detail__grid">
        <div className="order-info-group">
          <Card title="Detalles del Producto">
            <div className="order-detail-card">
              <div className="info-row">
                <span className="info-label">Producto Base</span>
                <span className="info-value">{order.product?.name || 'Desconocido'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Descripción de Trabajo</span>
                <span className="info-value">{order.productDescription}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Cantidad</span>
                <span className="info-value">{order.quantity.toLocaleString()}</span>
              </div>
              {order.designFileReference && (
                <div className="info-row">
                  <span className="info-label">Archivo de Diseño</span>
                  <a href={order.designFileReference} target="_blank" rel="noreferrer" className="info-value" style={{ color: 'var(--color-primary)' }}>
                    Ver Archivo 🔗
                  </a>
                </div>
              )}
              {order.specifications && Object.entries(order.specifications).map(([key, value]) => (
                <div className="info-row" key={key}>
                  <span className="info-label">{key}</span>
                  <span className="info-value">{String(value)}</span>
                </div>
              ))}
              {order.notes && (
                <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <span className="info-label">Notas Internas</span>
                  <p className="info-value" style={{ margin: 0 }}>{order.notes}</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Historial de Estado">
            <div className="timeline">
              {order.statusHistory?.map((history) => (
                <div className="timeline-item" key={history.id}>
                  <div className="timeline-item__dot"></div>
                  <div className="timeline-item__content">
                    <div className="timeline-item__header">
                      <span className="timeline-item__title">
                        {history.fromStatus} ➞ {history.toStatus}
                      </span>
                      <span className="timeline-item__date">
                        {new Date(history.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Por: Usuario #{history.changedBy}</span>
                    {history.notes && (
                      <div className="timeline-item__notes">{history.notes}</div>
                    )}
                  </div>
                </div>
              )) || <p>No hay historial</p>}
            </div>
            
            <div style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-3)', fontSize: '0.875rem' }}>Actualizar Estado Manualmente:</h4>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                <select 
                  className="input__field" 
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as OrderStatus)}
                  style={{ width: 'auto', minWidth: '200px' }}
                  disabled={isCanceledByCreditNote}
                >
                  <option value="RECIBIDO">Recibido</option>
                  <option value="ESPERANDO_DISENO">Esperando Diseño</option>
                  <option value="ESPERANDO_CONFIRMACION">Esperando Confirmación</option>
                  <option value="EN_PRODUCCION">En Producción</option>
                  <option value="TERMINADO">Terminado</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        <div className="order-info-group">
          <Card title="Cliente">
            {order.client ? (
              <div className="order-detail-card">
                <div className="info-row">
                  <span className="info-label">Nombre</span>
                  <span className="info-value" style={{ cursor: 'pointer', color: 'var(--color-primary)' }} onClick={() => navigate(`/clientes/${order.client?.id}`)}>
                    {order.client.name}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{order.client.email || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Teléfono</span>
                  <span className="info-value">{order.client.phone || '-'}</span>
                </div>
                {order.client.hasCurrentAccount && (
                  <div className="info-row" style={{ background: 'var(--color-success-light)', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)' }}>
                    <span className="info-label" style={{ color: 'var(--color-success-dark)' }}>Cuenta Corriente</span>
                    <span className="info-value" style={{ color: 'var(--color-success-dark)' }}>Habilitada</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="info-value">Consumidor Final</p>
            )}
          </Card>

          <Card title="Presupuesto">
            <div className="order-detail-card">
              <div className="info-row">
                <span className="info-label">Precio Unitario</span>
                <span className="info-value">${Number(order.unitPrice).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Subtotal</span>
                <span className="info-value">${Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Impuestos</span>
                <span className="info-value">${Number(order.taxAmount).toLocaleString()}</span>
              </div>
              <div className="info-row" style={{ borderTop: '2px solid var(--color-border)', paddingTop: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
                <span className="info-label" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Total</span>
                <span className="info-value info-value--total">${Number(order.total).toLocaleString()}</span>
              </div>
              <div className="info-row" style={{ marginTop: 'var(--spacing-4)' }}>
                <span className="info-label">Abonado</span>
                <span className="info-value" style={{ color: 'var(--color-success)' }}>${Number(order.paidAmount).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Saldo Pendiente</span>
                <span className="info-value" style={{ color: Number(order.total) - Number(order.paidAmount) > 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                  ${(Number(order.total) - Number(order.paidAmount)).toLocaleString()}
                </span>
              </div>
              {order.chargedToAccount && (
                <div style={{ marginTop: 'var(--spacing-2)', fontSize: '0.75rem', textAlign: 'center', color: 'var(--color-warning-dark)', background: 'var(--color-warning-light)', padding: '4px', borderRadius: '4px' }}>
                  Cargado a Cuenta Corriente
                </div>
              )}
              {Number(order.total) - Number(order.paidAmount) > 0 && !order.chargedToAccount && !isCanceledByCreditNote && (
                <div style={{ marginTop: 'var(--spacing-4)' }}>
                  <Button variant="primary" style={{ width: '100%' }} onClick={() => { setPaymentToEdit(undefined); setIsPaymentModalOpen(true); }}>
                    Registrar Pago
                  </Button>
                </div>
              )}

              <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-3)', fontSize: '0.875rem' }}>Pagos Registrados</h4>
                {payments.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>No hay pagos registrados.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {payments.map(payment => (
                      <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>${Number(payment.amount).toLocaleString()}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{payment.method} - {new Date(payment.createdAt).toLocaleDateString()}</div>
                        </div>
                        {!isCanceledByCreditNote && (
                          <Button variant="ghost" size="sm" onClick={() => { setPaymentToEdit(payment); setIsPaymentModalOpen(true); }}>
                            ✏️ Editar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-3)', fontSize: '0.875rem' }}>Facturación AFIP</h4>
                {invoice ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <div style={{ fontSize: '0.875rem', color: invoice.invoiceType.includes('NOTA_CREDITO') ? 'var(--color-warning-dark)' : 'var(--color-success)', fontWeight: 500 }}>
                       {invoice.invoiceType.includes('NOTA_CREDITO') ? 'Nota de Crédito generada:' : 'Factura generada:'} {invoice.invoiceNumber}
                     </div>
                     <div style={{ display: 'flex', gap: '8px' }}>
                       <DownloadInvoicePdfButton invoice={invoice} />
                       {!invoice.invoiceType.includes('NOTA_CREDITO') && (
                         <Button 
                           variant="danger" 
                           size="sm" 
                           onClick={async () => {
                             if (window.confirm('¿Está seguro de anular esta factura generando una Nota de Crédito AFIP por el monto total?')) {
                               try {
                                 await invoiceService.generateCreditNote(invoice.id);
                                 alert('Nota de Crédito generada exitosamente');
                                 fetchOrder();
                               } catch (err: any) {
                                 alert(err.response?.data?.message || 'Error al generar Nota de Crédito');
                               }
                             }
                           }}
                         >
                           Anular (Generar NC)
                         </Button>
                       )}
                     </div>
                   </div>
                ) : (order.status === 'TERMINADO' || order.status === 'ENTREGADO') ? (
                   <Button variant="secondary" style={{ width: '100%' }} onClick={() => setIsInvoiceModalOpen(true)}>
                     Generar Factura AFIP
                   </Button>
                ) : (
                   <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                     El pedido debe estar terminado o entregado para facturar.
                   </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <PaymentFormModal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setPaymentToEdit(undefined); }}
        clientId={order.clientId}
        orderId={order.id}
        suggestedAmount={Number(order.total) - Number(order.paidAmount)}
        paymentToEdit={paymentToEdit}
        onSuccess={fetchOrder}
      />

      <GenerateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        clientId={order.clientId}
        unInvoicedOrders={[order]}
        onSuccess={fetchOrder}
      />

    </div>
  );
};
