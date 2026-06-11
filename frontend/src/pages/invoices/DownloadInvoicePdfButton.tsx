import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { clientService } from '../../services/clientService';
import { configService } from '../../services/configService';
import { generateInvoicePdf } from './invoicePdfGenerator';
import type { Invoice, Order } from '../../types';

interface DownloadInvoicePdfButtonProps {
  invoice: Invoice;
}

/**
 * Botón que genera y descarga un PDF de factura vectorial en formato A5
 * con 2 páginas: ORIGINAL y DUPLICADO.
 * Utiliza jsPDF directamente para dibujar texto, líneas y tablas.
 */
export const DownloadInvoicePdfButton: React.FC<DownloadInvoicePdfButtonProps> = ({ invoice }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      // 1. Obtener datos necesarios
      const clientDetail = await clientService.getById(invoice.clientId);
      const invoiceOrders = clientDetail.orders.filter(
        (o: Order) => o.invoiceId === invoice.id
      );
      const configData = await configService.getConfig();

      // 2. Generar y descargar el PDF vectorial
      await generateInvoicePdf(invoice, clientDetail.client, invoiceOrders, configData);
    } catch (err) {
      console.error('Error al generar PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleDownload} loading={loading}>
      {loading ? 'Preparando...' : 'Descargar PDF'}
    </Button>
  );
};
