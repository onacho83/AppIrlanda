import React, { useState, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { InvoicePrintView } from './InvoicePrintView';
import { clientService } from '../../services/clientService';
import { configService, type BusinessConfig } from '../../services/configService';
import type { Invoice, Client, Order } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DownloadInvoicePdfButtonProps {
  invoice: Invoice;
}

export const DownloadInvoicePdfButton: React.FC<DownloadInvoicePdfButtonProps> = ({ invoice }) => {
  const [loading, setLoading] = useState(false);
  const printRefOriginal = useRef<HTMLDivElement>(null);
  const printRefDuplicate = useRef<HTMLDivElement>(null);
  
  // Data for rendering
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<BusinessConfig | null>(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener datos necesarios
      const clientDetail = await clientService.getById(invoice.clientId);
      const invoiceOrders = clientDetail.orders.filter(o => o.invoiceId === invoice.id);
      const configData = await configService.getConfig();
      
      setClient(clientDetail.client);
      setOrders(invoiceOrders);
      setConfig(configData);

      // Esperar al siguiente tick de React para que el componente oculto se renderice
      setTimeout(async () => {
        if (!printRefOriginal.current || !printRefDuplicate.current) {
          setLoading(false);
          return;
        }

        try {
          // 2. Capturar con html2canvas
          const canvasOriginal = await html2canvas(printRefOriginal.current, {
            scale: 2,
            useCORS: true,
            logging: false
          });
          const canvasDuplicate = await html2canvas(printRefDuplicate.current, {
            scale: 2,
            useCORS: true,
            logging: false
          });

          // 3. Crear PDF (A5 portrait es approx 148x210 mm)
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5'
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvasOriginal.height * pdfWidth) / canvasOriginal.width;

          // Página 1: Original
          const imgDataOrg = canvasOriginal.toDataURL('image/png');
          pdf.addImage(imgDataOrg, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
          // Página 2: Duplicado
          pdf.addPage();
          const imgDataDup = canvasDuplicate.toDataURL('image/png');
          pdf.addImage(imgDataDup, 'PNG', 0, 0, pdfWidth, pdfHeight);

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
          <>
            <div ref={printRefOriginal}>
              <InvoicePrintView invoice={invoice} client={client} orders={orders} config={config} copyType="ORIGINAL" />
            </div>
            <div ref={printRefDuplicate}>
              <InvoicePrintView invoice={invoice} client={client} orders={orders} config={config} copyType="DUPLICADO" />
            </div>
          </>
        )}
      </div>
    </>
  );
};
