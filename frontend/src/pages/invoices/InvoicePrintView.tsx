import React from 'react';
import type { Invoice, Client, Order } from '../../types';
import type { BusinessConfig } from '../../services/configService';
import './InvoicePrintView.css';

interface InvoicePrintViewProps {
  invoice: Invoice;
  client: Client;
  orders: Order[];
  config?: BusinessConfig | null;
  copyType?: 'ORIGINAL' | 'DUPLICADO' | 'TRIPLICADO';
}

/**
 * Obtiene el código numérico AFIP según el tipo de comprobante.
 * Factura A = 001, Factura B = 006, Factura C = 011
 * Nota Crédito A = 003, Nota Crédito B = 008, Nota Crédito C = 013
 */
function getAfipTypeCode(invoiceType: string): string {
  const codes: Record<string, string> = {
    FACTURA_A: '001',
    FACTURA_B: '006',
    FACTURA_C: '011',
    NOTA_CREDITO_A: '003',
    NOTA_CREDITO_B: '008',
    NOTA_CREDITO_C: '013',
  };
  return codes[invoiceType] || '006';
}

/**
 * Obtiene la letra del comprobante (A, B o C).
 */
function getInvoiceLetter(invoiceType: string): string {
  return invoiceType.split('_').pop() || 'B';
}

/**
 * Obtiene el nombre del tipo de comprobante para el título.
 */
function getInvoiceTitle(invoiceType: string): string {
  if (invoiceType.startsWith('NOTA_CREDITO')) return 'NOTA DE CRÉDITO';
  return 'FACTURA';
}

/**
 * Formatea la condición de IVA del cliente para mostrarla legiblemente.
 */
function formatIvaCondition(condition: string | undefined): string {
  if (!condition) return 'Consumidor Final';
  const map: Record<string, string> = {
    RESPONSABLE_INSCRIPTO: 'IVA Responsable Inscripto',
    MONOTRIBUTISTA: 'Responsable Monotributo',
    CONSUMIDOR_FINAL: 'Consumidor Final',
    EXENTO: 'IVA Sujeto Exento',
  };
  return map[condition] || condition.replace(/_/g, ' ');
}

/**
 * Formatea un número como moneda argentina (con coma decimal y punto para miles).
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Vista de impresión de factura fiel al modelo AFIP argentino.
 * Formato A4 con estructura: header emisor, datos del receptor, tabla de items,
 * sección de transparencia fiscal (Ley 27.743), totales y footer con QR + CAE.
 */
export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({
  invoice,
  client,
  orders,
  config,
  copyType = 'ORIGINAL',
}) => {
  const invoiceLetter = getInvoiceLetter(invoice.invoiceType);
  const invoiceTitle = getInvoiceTitle(invoice.invoiceType);
  const afipCode = getAfipTypeCode(invoice.invoiceType);
  const isFacturaC = invoice.invoiceType.endsWith('C');

  // Cálculos de montos
  const displayTotal = Number(invoice.total);
  // Según Ley 27.743, Factura B muestra IVA Contenido; Factura A discrimina
  const ivaContenido = isFacturaC ? 0 : displayTotal - displayTotal / 1.21;

  // Partes del número de comprobante
  const [puntoVenta, compNro] = invoice.invoiceNumber
    ? invoice.invoiceNumber.split('-')
    : ['00000', '00000000'];

  return (
    <div className="invoice-print-view">
      <div className="invoice-body-wrapper">
        {/* ── Franja de tipo de copia ── */}
        <div className="invoice-copy-type">{copyType}</div>

        {/* ── Header: datos del emisor + letra + datos del comprobante ── */}
        <div className="invoice-header">
          {/* Columna izquierda: datos del emisor */}
          <div className="invoice-header-left">
            <h1 className="invoice-company-name">
              {config?.businessName || 'IMPRENTA IRLANDA'}
            </h1>
            <div className="invoice-company-details">
              <p>
                <strong>Razón Social:</strong>{' '}
                {config?.businessName || 'PEREZ MARTIN MIGUEL'}
              </p>
              <p>
                <strong>Domicilio Comercial:</strong>{' '}
                {config?.address ||
                  'Yrigoyen Hipolito 2087 - Ciudad de Buenos Aires'}
              </p>
              <p>
                <strong>Condición frente al IVA:</strong>{' '}
                {config?.ivaCondition
                  ? formatIvaCondition(config.ivaCondition)
                  : 'IVA Responsable Inscripto'}
              </p>
            </div>
          </div>

          {/* Recuadro central con la letra del comprobante */}
          <div className="invoice-type-box-wrapper">
            <div className="invoice-type-box">
              <span className="invoice-type-letter">{invoiceLetter}</span>
              <span className="invoice-type-code">COD. {afipCode}</span>
            </div>
            <div className="invoice-type-divider" />
          </div>

          {/* Columna derecha: título, número y datos fiscales */}
          <div className="invoice-header-right">
            <h2 className="invoice-title">{invoiceTitle}</h2>
            <div className="invoice-number-row">
              <p>
                <strong>Punto de Venta:</strong> {puntoVenta}
              </p>
              <p>
                <strong>Comp. Nro:</strong> {compNro}
              </p>
            </div>
            <div className="invoice-meta-data">
              <p>
                <strong>Fecha de Emisión:</strong>{' '}
                {new Date(invoice.createdAt).toLocaleDateString('es-AR')}
              </p>
              <br />
              <p>
                <strong>CUIT:</strong> {config?.cuit || '20238656835'}
              </p>
              <p>
                <strong>Ingresos Brutos:</strong>{' '}
                {config?.grossIncome || 'C.M. 901-278963-3'}
              </p>
              <p>
                <strong>Fecha de Inicio de Actividades:</strong>{' '}
                {config?.activityStartDate || '03/01/2005'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Sección del cliente / receptor ── */}
        <div className="invoice-client-section">
          <div className="invoice-client-row">
            <p className="col-40">
              <strong>CUIT:</strong>{' '}
              {client.cuit || 'Consumidor Final'}
            </p>
            <p className="col-60">
              <strong>Apellido y Nombre / Razón Social:</strong>{' '}
              {client.fiscalName || client.name}
            </p>
          </div>
          <div className="invoice-client-row">
            <p className="col-40">
              <strong>Condición frente al IVA:</strong>{' '}
              {formatIvaCondition(
                (client as any).ivaCondition ||
                  (client as any).iva_condition ||
                  'CONSUMIDOR_FINAL'
              )}
            </p>
            <p className="col-60">
              <strong>Domicilio:</strong> {client.address || '-'}
            </p>
          </div>
          <div className="invoice-client-row">
            <p className="col-100">
              <strong>Condición de venta:</strong> Contado
            </p>
          </div>
        </div>

        {/* ── Tabla de items / detalle ── */}
        <div className="invoice-items-container">
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Código</th>
                <th>Producto / Servicio</th>
                <th style={{ width: '55px' }}>Cantidad</th>
                <th style={{ width: '55px' }}>U. Medida</th>
                <th style={{ width: '65px' }}>Precio Unit.</th>
                <th style={{ width: '45px' }}>% Bonif</th>
                <th style={{ width: '55px' }}>Imp. Bonif.</th>
                <th style={{ width: '65px' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => {
                const price = Number(order.unitPrice);
                const qty = Number(order.quantity);
                const itemSubtotal = price * qty;

                return (
                  <tr key={order.id || idx}>
                    <td>{order.orderNumber || '-'}</td>
                    <td>{order.productDescription}</td>
                    <td className="text-right">{formatCurrency(qty)}</td>
                    <td className="text-center">unidades</td>
                    <td className="text-right">{formatCurrency(price)}</td>
                    <td className="text-right">0,00</td>
                    <td className="text-right">0,00</td>
                    <td className="text-right">
                      {formatCurrency(itemSubtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Sección inferior fijada al fondo ── */}
        <div className="invoice-bottom-section">
          {/* Transparencia Fiscal (Ley 27.743) - Solo para Factura B */}
          {!isFacturaC && (
            <div className="invoice-transparency-section">
              <p className="invoice-transparency-title">
                Régimen de Transparencia Fiscal al Consumidor (Ley 27.743)
              </p>
              <div className="invoice-transparency-row">
                <p>
                  <strong>IVA Contenido: $</strong>
                </p>
                <span className="amount">
                  {formatCurrency(ivaContenido)}
                </span>
              </div>
            </div>
          )}

          {/* Totales */}
          <div className="invoice-totals-section">
            <div className="invoice-totals-content">
              <div className="invoice-totals-row">
                <span className="totals-label">Subtotal: $</span>
                <span className="totals-amount">
                  {formatCurrency(displayTotal)}
                </span>
              </div>
              <div className="invoice-totals-row">
                <span className="totals-label">Importe Otros Tributos: $</span>
                <span className="totals-amount">0,00</span>
              </div>
              <div className="invoice-totals-row total-final">
                <span className="totals-label">Importe Total: $</span>
                <span className="totals-amount">
                  {formatCurrency(displayTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Leyenda comercial */}
          <div className="invoice-commercial-legend">
            "Impresión offset - digital - tipográfica - Centro de Copiado,
            color www.imprentairlanda.com"
          </div>

          {/* Footer: QR + Autorizado + CAE */}
          <div className="invoice-footer">
            <div className="invoice-qr-section">
              {invoice.qrData && (
                <img src={invoice.qrData} alt="QR Fiscal AFIP" />
              )}
            </div>

            <div className="invoice-footer-center">
              <p className="invoice-page-number">Pág. 1/1</p>
              <div className="invoice-authorized">
                <strong>Comprobante Autorizado</strong>
                <p className="invoice-authorized-small">
                  Esta Agencia no se responsabiliza por los datos ingresados en
                  el detalle de la operación
                </p>
              </div>
            </div>

            <div className="invoice-footer-right">
              <p>
                <strong>CAE N°:</strong> {invoice.cae}
              </p>
              <p>
                <strong>Fecha de Vto. de CAE:</strong>{' '}
                {invoice.caeExpiration
                  ? new Date(invoice.caeExpiration).toLocaleDateString('es-AR')
                  : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
