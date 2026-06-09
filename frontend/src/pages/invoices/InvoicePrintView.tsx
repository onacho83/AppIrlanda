import React from 'react';
import type { Invoice, Client, Order } from '../../types';
import type { BusinessConfig } from '../../services/configService';
import './InvoicePrintView.css';

interface InvoicePrintViewProps {
  invoice: Invoice;
  client: Client;
  orders: Order[];
  config?: BusinessConfig | null;
  copyType?: 'ORIGINAL' | 'DUPLICADO';
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice, client, orders, config, copyType = 'ORIGINAL' }) => {
  const isFacturaC = invoice.invoiceType.endsWith('C');
  const displayTotal = Number(invoice.total);
  // Forzamos el cálculo para Factura A y B (Ley 27.743) independientemente de cómo se guardó en DB
  const displayTax = isFacturaC ? 0 : (displayTotal - (displayTotal / 1.21));
  const displayNet = isFacturaC ? displayTotal : (displayTotal / 1.21);

  return (
    <div className="invoice-print-view">
      <div className="invoice-afip-original">{copyType}</div>
      
      <div className="invoice-afip-header">
        <div className="invoice-afip-header-left">
          <h1 className="invoice-afip-company-name">IMPRENTA IRLANDA</h1>
          <div className="invoice-afip-company-details">
            <p><strong>Razón Social:</strong> PEREZ MARTIN MIGUEL</p>
            <p><strong>Domicilio Comercial:</strong> Yrigoyen Hipolito 2087 - Ciudad de Buenos Aires</p>
            <p><strong>Condición frente al IVA:</strong> IVA Responsable Inscripto</p>
          </div>
        </div>
        
        <div className="invoice-afip-type-box-container">
          <div className="invoice-afip-type-box">
            <div className="invoice-afip-type-letter">{invoice.invoiceType.split('_').pop()}</div>
            <div className="invoice-afip-type-code">COD. {invoice.invoiceType.includes('FACTURA') ? '01' : '02'}</div>
          </div>
          <div className="invoice-afip-type-line"></div>
        </div>

        <div className="invoice-afip-header-right">
          <h2 className="invoice-afip-title">FACTURA</h2>
          <div className="invoice-afip-invoice-data">
            <div className="invoice-data-row">
              <p><strong>Punto de Venta:</strong> {invoice.invoiceNumber ? invoice.invoiceNumber.split('-')[0] : '00000'}</p>
              <p><strong>Comp. Nro:</strong> {invoice.invoiceNumber ? invoice.invoiceNumber.split('-')[1] : '00000000'}</p>
            </div>
            <p><strong>Fecha de Emisión:</strong> {new Date(invoice.createdAt).toLocaleDateString('es-AR')}</p>
            <br/>
            <p><strong>CUIT:</strong> {config?.cuit || '20238656835'}</p>
            <p><strong>Ingresos Brutos:</strong> {config?.grossIncome || 'C.M. 901-278963-3'}</p>
            <p><strong>Fecha de Inicio de Actividades:</strong> {config?.activityStartDate || '03/01/2005'}</p>
          </div>
        </div>
      </div>

      <div className="invoice-afip-client">
        <div className="invoice-afip-client-row">
          <p style={{width: '40%'}}><strong>CUIT:</strong> {client.cuit || 'Consumidor Final'}</p>
          <p style={{width: '60%'}}><strong>Apellido y Nombre / Razón Social:</strong> {client.name} {client.fiscalName ? `(${client.fiscalName})` : ''}</p>
        </div>
        <div className="invoice-afip-client-row">
          <p style={{width: '40%'}}><strong>Condición frente al IVA:</strong> {String((client as any).ivaCondition || (client as any).iva_condition || 'CONSUMIDOR_FINAL').replace('_', ' ')}</p>
          <p style={{width: '60%'}}><strong>Domicilio Comercial:</strong> {client.address || '-'}</p>
        </div>
        <div className="invoice-afip-client-row">
          <p><strong>Condición de venta:</strong> Contado</p>
        </div>
      </div>

      <div className="invoice-afip-table-container">
        <table className="invoice-afip-table">
          <thead>
            <tr>
              <th style={{width: '50px'}}>Código</th>
              <th>Producto / Servicio</th>
              <th style={{width: '50px'}}>Cantidad</th>
              <th style={{width: '50px'}}>U. medida</th>
              <th style={{width: '60px'}}>Precio Unit.</th>
              <th style={{width: '50px'}}>% Bonif</th>
              <th style={{width: '60px'}}>Subtotal</th>
              <th style={{width: '50px'}}>Alícuota IVA</th>
              <th style={{width: '70px'}}>Subtotal c/IVA</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const isFacturaC = invoice.invoiceType.endsWith('C');
              // Por Ley 27.743 (Transparencia Fiscal), B y A discriminan IVA
              const taxPct = isFacturaC ? 0 : 21;
              const price = Number(order.unitPrice);
              const qty = Number(order.quantity);
              
              const baseSubtotal = price * qty;
              let itemNet = baseSubtotal;
              let itemTotal = baseSubtotal;
              
              if (!isFacturaC) {
                 itemNet = baseSubtotal / 1.21;
                 itemTotal = baseSubtotal;
              }

              return (
                <tr key={order.id || idx}>
                  <td>{order.orderNumber}</td>
                  <td>{order.productDescription}</td>
                  <td style={{textAlign: 'right'}}>{qty.toFixed(2)}</td>
                  <td style={{textAlign: 'center'}}>unidades</td>
                  <td style={{textAlign: 'right'}}>{(itemNet / qty).toFixed(2)}</td>
                  <td style={{textAlign: 'right'}}>0,00</td>
                  <td style={{textAlign: 'right'}}>{itemNet.toFixed(2)}</td>
                  <td style={{textAlign: 'center'}}>{taxPct > 0 ? `${taxPct}%` : '-'}</td>
                  <td style={{textAlign: 'right'}}>{itemTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="invoice-afip-totals-wrapper">
        <div className="invoice-afip-totals-left">
           <p><strong>Importe Otros Tributos: $</strong> <span className="totals-amount">0,00</span></p>
        </div>
        <div className="invoice-afip-totals-right">
           <div className="totals-row"><p><strong>Importe Neto Gravado: $</strong></p><span className="totals-amount">{displayNet.toFixed(2)}</span></div>
           <div className="totals-row"><p><strong>IVA 27%: $</strong></p><span className="totals-amount">0,00</span></div>
           <div className="totals-row"><p><strong>IVA 21%: $</strong></p><span className="totals-amount">{displayTax.toFixed(2)}</span></div>
           <div className="totals-row"><p><strong>IVA 10.5%: $</strong></p><span className="totals-amount">0,00</span></div>
           <div className="totals-row"><p><strong>IVA 5%: $</strong></p><span className="totals-amount">0,00</span></div>
           <div className="totals-row"><p><strong>IVA 2.5%: $</strong></p><span className="totals-amount">0,00</span></div>
           <div className="totals-row"><p><strong>IVA 0%: $</strong></p><span className="totals-amount">0,00</span></div>
           <div className="totals-row"><p><strong>Importe Otros Tributos: $</strong></p><span className="totals-amount">0,00</span></div>
           <div className="totals-row total-final"><p><strong>Importe Total: $</strong></p><span className="totals-amount">{displayTotal.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="invoice-afip-legend">
        "Impresión offset - digital - tipográfica - Centro de Copiado, color www.imprentairlanda.com"
      </div>

      <div className="invoice-afip-footer">
        <div className="invoice-afip-qr-section">
          {invoice.qrData && <img src={invoice.qrData} alt="QR Físcal AFIP" />}
        </div>
        
        <div className="invoice-afip-center">
          <p className="page-number">Pág. 1/1</p>
          <div className="comprobante-autorizado">
            <strong>Comprobante Autorizado</strong>
            <p className="autorizado-small">Esta Agencia no se responsabiliza por los datos ingresados en el detalle de la operación</p>
          </div>
        </div>

        <div className="invoice-afip-right-bottom">
          <p><strong>CAE N°:</strong> {invoice.cae}</p>
          <p><strong>Fecha de Vto. de CAE:</strong> {invoice.caeExpiration ? new Date(invoice.caeExpiration).toLocaleDateString('es-AR') : ''}</p>
        </div>
      </div>
    </div>
  );
};
