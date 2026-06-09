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
import type { Invoice } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './OrderDetailPage.css';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = React.useRef<HTMLDivElement>(null);

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
    if (!printRef.current || !order) return;
    try {
      setIsPrinting(true);
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Pedido_${order.orderNumber}.pdf`);
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
          <Button variant="secondary" onClick={() => navigate(`/pedidos/${id}/editar`)}>Editar Pedido</Button>
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
              {Number(order.total) - Number(order.paidAmount) > 0 && !order.chargedToAccount && (
                <div style={{ marginTop: 'var(--spacing-4)' }}>
                  <Button variant="primary" style={{ width: '100%' }} onClick={() => setIsPaymentModalOpen(true)}>
                    Registrar Pago
                  </Button>
                </div>
              )}

              <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-3)', fontSize: '0.875rem' }}>Facturación AFIP</h4>
                {invoice ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <div style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 500 }}>Factura generada: {invoice.invoiceNumber}</div>
                     <DownloadInvoicePdfButton invoice={invoice} />
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
        onClose={() => setIsPaymentModalOpen(false)}
        clientId={order.clientId}
        orderId={order.id}
        suggestedAmount={Number(order.total) - Number(order.paidAmount)}
        onSuccess={fetchOrder}
      />

      <GenerateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        clientId={order.clientId}
        unInvoicedOrders={[order]}
        onSuccess={fetchOrder}
      />

      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={printRef} className="print-ticket" style={{ width: '210mm', height: '148mm', background: 'white', color: 'black', padding: '10mm', boxSizing: 'border-box' }}>
          <div className="print-main">
            <h2>Imprenta Irlanda</h2>
            <h3>Pedido #{order.orderNumber}</h3>
            <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Cliente:</strong> {order.client?.name || 'Consumidor Final'}</p>
            <br />
            <p><strong>Producto:</strong> {order.product?.name}</p>
            <p><strong>Detalle:</strong> {order.productDescription}</p>
            <p><strong>Cantidad:</strong> {order.quantity}</p>
            <br />
            <p><strong>Total:</strong> ${Number(order.total).toLocaleString()}</p>
            <p><strong>Abonado:</strong> ${Number(order.paidAmount).toLocaleString()}</p>
            <p><strong>Saldo Pendiente:</strong> ${(Number(order.total) - Number(order.paidAmount)).toLocaleString()}</p>
          </div>
          <div className="print-stub">
            <div>
              <h3>Comprobante Cliente</h3>
              <p><strong>Pedido:</strong> #{order.orderNumber}</p>
              <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <br />
              <p><strong>Producto:</strong> {order.productDescription}</p>
              <p><strong>Total:</strong> ${Number(order.total).toLocaleString()}</p>
              <p><strong>Saldo:</strong> ${(Number(order.total) - Number(order.paidAmount)).toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '20px' }}>
              Presente este talón para retirar su trabajo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
