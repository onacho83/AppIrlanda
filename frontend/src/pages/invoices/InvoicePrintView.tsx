import React from 'react';
import type { Invoice, Client, Order } from '../../types';
import './InvoicePrintView.css';

interface InvoicePrintViewProps {
  invoice: Invoice;
  client: Client;
  orders: Order[];
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice, client, orders }) => {
  return (
    <div className="invoice-print-view">
      <div className="invoice-print__header">
        <div className="invoice-print__company">
          <h1 className="invoice-print__company-name">Imprenta Irlanda</h1>
          <p>Condición IVA: Responsable Inscripto</p>
        </div>
        <div className="invoice-print__type-box">
          <div className="invoice-print__type-letter">{invoice.invoiceType.split('_').pop()}</div>
          <div className="invoice-print__type-code">COD. {invoice.invoiceType.includes('FACTURA') ? '01' : '02'}</div>
        </div>
        <div className="invoice-print__details">
          <h2>FACTURA</h2>
          <p><strong>Nº:</strong> {invoice.invoiceNumber}</p>
          <p><strong>Fecha:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="invoice-print__client">
        <p><strong>Cliente:</strong> {client.name} {client.fiscalName ? `(${client.fiscalName})` : ''}</p>
        <p><strong>CUIT/DNI:</strong> {client.cuit || 'Consumidor Final'}</p>
        <p><strong>Dirección:</strong> {client.address || '-'}</p>
        <p><strong>Condición frente al IVA:</strong> {String((client as any).ivaCondition || (client as any).iva_condition || 'CONSUMIDOR_FINAL').replace('_', ' ')}</p>
      </div>

      <table className="invoice-print__table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.orderNumber}</td>
              <td>{order.productDescription}</td>
              <td>${Number(order.total).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-print__totals">
        <p><strong>Subtotal Neto:</strong> ${Number(invoice.netAmount).toLocaleString()}</p>
        <p><strong>IVA:</strong> ${Number(invoice.taxAmount).toLocaleString()}</p>
        <h3 className="invoice-print__total-amount">Total: ${Number(invoice.total).toLocaleString()}</h3>
      </div>

      <div className="invoice-print__footer">
        {invoice.qrData && (
          <div className="invoice-print__qr">
            <img src={invoice.qrData} alt="QR Físcal AFIP" />
          </div>
        )}
        <div className="invoice-print__afip-data">
          <p><strong>CAE:</strong> {invoice.cae}</p>
          <p><strong>Vto. CAE:</strong> {invoice.caeExpiration ? new Date(invoice.caeExpiration).toLocaleDateString() : ''}</p>
        </div>
      </div>
    </div>
  );
};
