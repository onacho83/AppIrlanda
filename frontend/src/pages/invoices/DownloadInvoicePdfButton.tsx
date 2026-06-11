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

/**
 * Botón que genera y descarga un PDF de factura con 3 páginas:
 * ORIGINAL, DUPLICADO y TRIPLICADO, en formato A4 portrait.
 * Utiliza html2canvas para capturar el componente InvoicePrintView
 * renderizado fuera de pantalla y jsPDF para generar el archivo.
 */
export const DownloadInvoicePdfButton: React.FC<DownloadInvoicePdfButtonProps> = ({ invoice }) => {
  const [loading, setLoading] = useState(false);

  // Refs para cada copia renderizada fuera de pantalla
  const printRefOriginal = useRef<HTMLDivElement>(null);
  const printRefDuplicate = useRef<HTMLDivElement>(null);
  const printRefTriplicate = useRef<HTMLDivElement>(null);

  // Estado para datos necesarios del renderizado
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<BusinessConfig | null>(null);

  const handleDownload = async () => {
    try {
      setLoading(true);

      // 1. Obtener datos necesarios para renderizar la factura
      const clientDetail = await clientService.getById(invoice.clientId);
      const invoiceOrders = clientDetail.orders.filter(
        (o: Order) => o.invoiceId === invoice.id
      );
      const configData = await configService.getConfig();

      setClient(clientDetail.client);
      setOrders(invoiceOrders);
      setConfig(configData);

      // Esperar al siguiente tick de React para que los componentes ocultos se rendericen
      setTimeout(async () => {
        const refs = [
          printRefOriginal.current,
          printRefDuplicate.current,
          printRefTriplicate.current,
        ];

        if (refs.some((ref) => !ref)) {
          setLoading(false);
          return;
        }

        try {
          // 2. Crear PDF en formato A4 portrait (210 x 297 mm)
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();

          // 3. Capturar y agregar cada copia como una página
          for (let i = 0; i < refs.length; i++) {
            const canvas = await html2canvas(refs[i]!, {
              scale: 2,
              useCORS: true,
              logging: false,
            });

            const pdfHeight =
              (canvas.height * pdfWidth) / canvas.width;

            if (i > 0) pdf.addPage();

            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          }

          pdf.save(`Factura_${invoice.invoiceNumber}.pdf`);
        } catch (err) {
          console.error('Error al generar PDF:', err);
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

      {/* Renderizado oculto fuera de pantalla para la captura del PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {client && (
          <>
            <div ref={printRefOriginal}>
              <InvoicePrintView
                invoice={invoice}
                client={client}
                orders={orders}
                config={config}
                copyType="ORIGINAL"
              />
            </div>
            <div ref={printRefDuplicate}>
              <InvoicePrintView
                invoice={invoice}
                client={client}
                orders={orders}
                config={config}
                copyType="DUPLICADO"
              />
            </div>
            <div ref={printRefTriplicate}>
              <InvoicePrintView
                invoice={invoice}
                client={client}
                orders={orders}
                config={config}
                copyType="TRIPLICADO"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};
