import React, { useState, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { InvoicePrintView } from './InvoicePrintView';
import { clientService } from '../../services/clientService';
import { orderService } from '../../services/orderService';
import type { Invoice, Client, Order } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DownloadInvoicePdfButtonProps {
  invoice: Invoice;
}

export const DownloadInvoicePdfButton: React.FC<DownloadInvoicePdfButtonProps> = ({ invoice }) => {
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Data for rendering
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener datos necesarios
      const clientDetail = await clientService.getById(invoice.clientId);
      const invoiceOrders = clientDetail.orders.filter(o => o.invoiceId === invoice.id);
      
      setClient(clientDetail.client);
      setOrders(invoiceOrders);

      // Esperar al siguiente tick de React para que el componente oculto se renderice
      setTimeout(async () => {
        if (!printRef.current) {
          setLoading(false);
          return;
        }

        try {
          // 2. Capturar con html2canvas
          const canvas = await html2canvas(printRef.current, {
            scale: 2,
            useCORS: true,
            logging: false
          });

          // 3. Crear PDF (A5 landscape es approx 210x148 mm)
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a5'
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Factura_${invoice.invoiceNumber}.pdf`);
        } catch (err) {
          console.error("Error al generar PDF:", err);
        } finally {
          setLoading(false);
        }
      }, 500);

    } catch (err) {
      console.error('Error al obtener datos para la factura:', err);
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleDownload} loading={loading}>
        {loading ? 'Preparando...' : 'Descargar PDF'}
      </Button>

      {/* Renderizado oculto para la captura del PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {client && (
          <div ref={printRef}>
            <InvoicePrintView invoice={invoice} client={client} orders={orders} />
          </div>
        )}
      </div>
    </>
  );
};
